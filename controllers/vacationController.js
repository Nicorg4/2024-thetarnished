const { Op } = require('sequelize');
const moment = require('moment');
const MonthlySchedule = require('../models/monthlyScheduleModel');
const Teacher = require('../models/teacherModel');
const Vacation = require('../models/vacationModel');

const assignVacation = async (req, res) => {
    try {
      const { teacherid, startdate, enddate } = req.body;
  
      const startDate = moment.utc(startdate).startOf('day').toDate();
      const endDate = moment.utc(enddate).endOf('day').toDate();
  
      const existingVacation = await Vacation.findOne({
        where: {
          teacherid: teacherid,
          status: 'approved'
        }
      });
      if (existingVacation) {
        return res.status(403).json({ 
          message: 'You already have an approved vacation.' 
        });
      }
  
      const takenSchedules = await MonthlySchedule.findAll({
        where: {
          teacherid: teacherid,
          datetime: {
            [Op.between]: [startDate, endDate]
          },
          currentstudents: {
            [Op.gt]: 0
          }
        }
      });
      if (takenSchedules.length > 0) {
        return res.status(403).json({ 
          message: 'Cannot set vacations while there are booked classes during that period.' 
        });
      }
  
      const vacation = await Vacation.create({
        teacherid: teacherid,
        start_date: startDate,
        end_date: endDate,
        status: 'approved'
      });
  
      const schedules = await MonthlySchedule.findAll({
        where: {
          teacherid: teacherid,
          datetime: {
            [Op.between]: [startDate, endDate]
          }
        }
    });
  
      if (schedules.length > 0) {
        await MonthlySchedule.update(
          { istaken: true },
          {
            where: {
              monthlyscheduleid: {
                [Op.in]: schedules.map(schedule => schedule.monthlyscheduleid)
              }
            }
          }
        );
        const updatedSchedules = schedules.map(schedule => ({
          ...schedule.toJSON(),
          istaken: true
        }));
        return res.status(201).json({ vacation, updatedSchedules });
      } else {
        return res.status(200).json({ vacation, updatedSchedules: [] });
      }
    } catch (error) {
      console.error('Error assigning vacation:', error);
      return res.status(500).send('Server error');
    }
  };

const stopVacation = async (req, res) => {
  try {
    const { teacherid } = req.body;
    await Vacation.destroy({
      where: {
        teacherid: teacherid,
      }
    });

    const schedules = await MonthlySchedule.findAll({
      where: {
        teacherid: teacherid,
        istaken: true,
        currentstudents: 0,
      },
    });
    for (const schedule of schedules) {
      await MonthlySchedule.update(
        { istaken: false },
        { where: { monthlyscheduleid: schedule.monthlyscheduleid } }
      );
    }

    return res.status(200).send('Vacation stopped and schedules updated');
  } catch (error) {
    console.error('Error stopping vacation:', error);
    return res.status(500).send({ 
        message: 'Server error.' 
      });
  }
};

module.exports = {
  assignVacation,
  stopVacation,
};

const { Op } = require('sequelize');
const MonthlySchedule = require('../models/monthlyScheduleModel');
const Teacher = require('../models/teacherModel');
const moment = require('moment');
const Reservation = require('../models/reservationModel');
const cron = require('node-cron');
const Schedule= require('../models/weeklyScheduleModel');
const WeeklySchedule = require('../models/weeklyScheduleModel');
const Vacation = require('../models/vacationModel');

const createMonthlySchedule = async (datetime, teacherid, maxstudents, currentstudents) => {
  try {
    for (let i = 0; i < 4; i++) {
      const scheduleMoment = moment(datetime)
        .add(i * 7, 'days')
        .subtract(3, 'hours');
      const scheduleDate = scheduleMoment.format('YYYY-MM-DD HH:mm:ss');

      const vacation = await Vacation.findOne({
        where: {
          teacherid: teacherid,
          status: 'approved',
          start_date: { [Op.lte]: scheduleMoment.toDate() },
          end_date: { [Op.gte]: scheduleMoment.toDate() }
        }
      });

      if (vacation) {
        console.log(`Skipping schedule creation for teacher ${teacherid} on ${scheduleDate} due to vacation.`);
        continue;
      }

      await MonthlySchedule.create({
        datetime: scheduleDate,
        teacherid: teacherid,
        maxstudents: maxstudents,
        currentstudents: currentstudents,
      });
      console.log(`Schedule created: Teacher ${teacherid}, Date ${scheduleDate}`);
    }
  } catch (error) {
    throw error;
  }
};

const getIndividualClasses = async (req, res) => {
  try {
      const allClasses = await MonthlySchedule.findAll({
          where: {
              maxstudents: 1,
              istaken: false,
          },
      });

      const filteredClasses = allClasses.filter(
          (classItem) => classItem.currentstudents < classItem.maxstudents
      );

      if (filteredClasses.length === 0) {
          return res.status(404).json({ message: 'No individual classes found' });
      }

      res.status(200).json(filteredClasses);
  } catch (err) {
      
      res.status(500).send('Server error');
  }
};

const getGroupClasses = async (req, res) => {
  try {
      const allClasses = await MonthlySchedule.findAll({
          where: {
              istaken: false,
          },
      });

      const filteredClasses = allClasses.filter(
          (classItem) => classItem.currentstudents < classItem.maxstudents
      );

      const refilteredClasses = filteredClasses.filter(
        (classItem) => classItem.maxstudents > 1
      );

      if (refilteredClasses.length === 0) {
          return res.status(404).json({ message: 'No group classes found' });
      }

      res.status(200).json(refilteredClasses);
      
  } catch (err) {
      
      res.status(500).send('Server error');
  }

};

const getMonthlyScheduleByTeacherId = async (req, res) => {
  try {
    const { teacherid } = req.params;
    const monthlySchedule = await MonthlySchedule.findAll({
      where: {
        teacherid: teacherid,
        istaken: false,
        datetime: {
          [Op.gt]: new Date(),
        },
      },
      order: [['datetime', 'ASC']],
    });

    if (monthlySchedule.length > 0) {
      const formattedSchedule = monthlySchedule.map((schedule) => {
        const startTime = new Date(schedule.datetime).toTimeString().split(' ')[0]; 
        const endTime = new Date(new Date(schedule.datetime).getTime() + 60 * 60 * 1000).toTimeString().split(' ')[0]; 
        const dayOfMonth = new Date(schedule.datetime).getDate(); 
        let jsDayOfWeek = new Date(schedule.datetime).getDay(); 
        const dayOfWeek = jsDayOfWeek === 0 ? 7 : jsDayOfWeek;
        return {
          scheduleid: schedule.monthlyscheduleid.toString(),
          start_time: startTime,
          end_time: endTime,
          teacherid: schedule.teacherid.toString(),
          dayofmonth: dayOfMonth,
          dayofweek: dayOfWeek,
          maxstudents: schedule.maxstudents,
          month: new Date(schedule.datetime).getMonth() + 1,
        };
      });

      res.status(200).json(formattedSchedule);
    } else {
      res.status(404).send('Monthly schedule not found');
    }
  } catch (error) {
    /*istanbul ignore next*/
    res.status(500).send('Server error');
  }
};

const getMonthlySubjectScheduleByTeacherId = async (req, res) => {
  try {
    const { teacherid } = req.params;
    const { subjectid } = req.body;

    const monthlySchedules = await MonthlySchedule.findAll({
      where: {
        teacherid: teacherid,
        istaken: false,
      },
      order: [['datetime', 'ASC']],
    });
  
    let filteredSchedules = [];
  

    for (const schedule of monthlySchedules) {
      const reservations = await Reservation.findAll({
        where: {
          schedule_id: schedule.monthlyscheduleid,
        }
      });
      if (reservations.length === 0) {
        filteredSchedules.push(schedule);
        continue; 
      }
      let allMatch = true;
  
      for (const reservation of reservations) {
        if (reservation.subject_id !== subjectid) {
          allMatch = false;
          break; 
        }
      }
  

      if (allMatch) {
        filteredSchedules.push(schedule);
      }
    }

    if (filteredSchedules.length > 0) {
      const formattedSchedule = filteredSchedules.map((schedule) => {
        const startTime = new Date(schedule.datetime).toTimeString().split(' ')[0]; 
        const endTime = new Date(new Date(schedule.datetime).getTime() + 60 * 60 * 1000).toTimeString().split(' ')[0]; 
        const dayOfMonth = new Date(schedule.datetime).getDate(); 
        let jsDayOfWeek = new Date(schedule.datetime).getDay(); 
        const dayOfWeek = jsDayOfWeek === 0 ? 7 : jsDayOfWeek;
        return {
          scheduleid: schedule.monthlyscheduleid.toString(),
          start_time: startTime,
          end_time: endTime,
          teacherid: schedule.teacherid.toString(),
          dayofmonth: dayOfMonth,
          dayofweek: dayOfWeek,
          maxstudents: schedule.maxstudents,
        };
      });

      res.status(200).json(formattedSchedule);
    } else {
      res.status(404).send('Monthly schedule not found');
    }
  } catch (error) {
    /*istanbul ignore next*/
    res.status(500).send('Server error');
  }
};




const generateNextWeekSchedules = async () => {
  try {
    const teachers = await Teacher.findAll({ where: { is_active: true } });
    const today = moment().startOf('day');
    const endDate = moment().add(28, 'days').endOf('day');

    for (const teacher of teachers) {
      const weeklySchedules = await WeeklySchedule.findAll({ where: { teacherid: teacher.teacherid } });
      
      for (const schedule of weeklySchedules) {
        for (let i = 0; i <= 28; i++) {
          const currentDay = today.clone().add(i, 'days');
          if (currentDay.isoWeekday() === Number(schedule.dayofweek)) {
            const time = moment(schedule.start_time, 'HH:mm:ss');
            const scheduledDate = currentDay.clone()
              .hour(time.hour())
              .minute(time.minute())
              .second(time.second())
              .subtract(3, 'hours');

            if (scheduledDate.isSameOrBefore(endDate)) {
              const vacation = await Vacation.findOne({
                where: {
                  teacherid: teacher.teacherid,
                  status: 'approved',
                  start_date: { [Op.lte]: scheduledDate },
                  end_date: { [Op.gte]: scheduledDate }
                }
              });
              if (vacation) {
                console.log(`Skipping schedule for teacher ${teacher.teacherid} on ${scheduledDate.format('YYYY-MM-DD HH:mm:ss')} due to vacation.`);
                continue;
              }

              const existingSchedule = await MonthlySchedule.findOne({
                where: {
                  teacherid: teacher.teacherid,
                  datetime: scheduledDate.format('YYYY-MM-DD HH:mm:ss'),
                },
              });
              if (!existingSchedule) {
                await MonthlySchedule.create({
                  datetime: scheduledDate.format('YYYY-MM-DD HH:mm:ss'),
                  teacherid: teacher.teacherid,
                  maxstudents: schedule.maxstudents,
                  currentstudents: 0,
                });
                console.log(`Schedule created: Teacher ${teacher.teacherid}, Date ${scheduledDate.format('YYYY-MM-DD HH:mm:ss')}`);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating next week schedules:', error);
  }
};

cron.schedule('0 0 * * *', () => {
  console.log('Executing daily schedule update.');
  generateNextWeekSchedules();
});


module.exports = {
  getIndividualClasses,
  getGroupClasses,
  createMonthlySchedule,
  getMonthlyScheduleByTeacherId,
  getMonthlySubjectScheduleByTeacherId
};

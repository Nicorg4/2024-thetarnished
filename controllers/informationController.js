const { Op } = require('sequelize');
const Reservation = require ('../models/reservationModel');
const Student = require ('../models/studentModel');
const Teacher = require ('../models/teacherModel');

const getAnalytics = async (req, res) => {
    try {
        const totalReservations = await Reservation.count();

        const totalStudents = await Student.count();

        const totalTeachers = await Teacher.count({
            where: {
              is_active: true
            }
          });

        const monthlyReservations = await getMonthlyReservations();

        return res.status(200).json({
            totalReservations,
            totalStudents,
            totalTeachers,
            monthlyReservations,
        });
    } catch (error) {
        console.error("Error fetching analytics: ", error);
        return res.status(500).json({ message: "Error fetching analytics" });
    }
};

const getMonthlyReservations = async () => {
    const currentMonth = new Date().getMonth();
    const monthlyCounts = Array(5).fill(0);

    for (let i = 0; i < 5; i++) {
        const month = (currentMonth - i + 12) % 12;
        const startOfMonth = new Date(new Date().getFullYear(), month, 1);
        const endOfMonth = new Date(new Date().getFullYear(), month + 1, 0);

        monthlyCounts[i] = await Reservation.count({
            where: {
                created_at: {
                    [Op.between]: [startOfMonth, endOfMonth],
                },
            },
        });
    }

    return monthlyCounts.reverse();
};

module.exports = { getAnalytics };
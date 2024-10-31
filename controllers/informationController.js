const { Op } = require('sequelize');
const Reservation = require ('../models/reservationModel');
const Student = require ('../models/studentModel');
const Teacher = require ('../models/teacherModel');
const Exam = require('../models/examModel');
const sequelize = require('../config/database');

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

const getTeacherStats = async (req, res) => {
    try {
        const { teacherid } = req.params;
        const teacher = await Teacher.findByPk(teacherid);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        const currentDate = new Date();
        const signUp = new Date(teacher.signup_date);
        const differenceInTime = currentDate - signUp;
        const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
    
        const teacherStats = {
            total_reservations: await Reservation.count({
                where: {
                    teacher_id: teacher.teacherid,
                    reservation_status: 'terminated',
                },
            }),
            total_exams: await Exam.count({
                where: {
                    teacher_id: teacher.teacherid,
                },
            }),
            total_time: differenceInDays,
        };
        return res.status(200).json(teacherStats);
    }catch (error) {
    console.error("Error fetching teacher stats: ", error);
    return res.status(500).json({ message: "Error fetching teacher stats" });
    }
}


const getStudentStats = async (req, res) => {
    try {
        const { studentid } = req.params;
        const student = await Student.findByPk(studentid);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        const currentDate = new Date();
        const signUp = new Date(student.signup_date);
        const differenceInTime = currentDate - signUp;
        const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));
        const [result] = await sequelize.query(`
            SELECT COUNT(e.exam_id) AS total_exams
            FROM exams e
            JOIN reservations r ON r.id = e.reservation_id
            WHERE r.student_id = :student_id
            AND e.state = 'FINISHED'
            AND e.score > 60
        `, {
            replacements: { student_id: student.studentid },
            type: sequelize.QueryTypes.SELECT
        });

        const teacherStats = {
            total_reservations: await Reservation.count({
                where: {
                    student_id: student.studentid,
                    reservation_status: 'terminated',
                },
            }),
            total_exams: result.total_exams,
            total_time: differenceInDays,
        };
        return res.status(200).json(teacherStats);
    }catch (error) {
    console.error("Error fetching teacher stats: ", error);
    return res.status(500).json({ message: "Error fetching teacher stats" });
    }
}

const getUsersRanking = async (req, res) => {
    try {
        const students = await Student.findAll({
            order: [['xp', 'DESC']],
            attributes: ['firstname', 'lastname', 'xp'],
        });

        const teachers = await Teacher.findAll({
            order: [['xp', 'DESC']],
            attributes: ['firstname', 'lastname', 'xp'],
        });

        const formattedStudents = students.map(student => ({
            name: `${student.firstname} ${student.lastname}`,
            experience: student.xp,
        }));

        const formattedTeachers = teachers.map(teacher => ({
            name: `${teacher.firstname} ${teacher.lastname}`,
            experience: teacher.xp,
        }));

        res.status(200).json({
            students: formattedStudents,
            teachers: formattedTeachers,
        });
    } catch (error) {
        console.error('Error fetching user rankings:', error);
        res.status(500).json({ error: 'Error fetching user rankings' });
    }
};

module.exports = { getUsersRanking };


module.exports = { getAnalytics, getTeacherStats, getStudentStats, getUsersRanking };
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./studentModel');
const Subject = require('./subjectModel');
const Teacher = require('./teacherModel');
const Meeting = require('./meetingModel');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true, 
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'students',
      key: 'studentid',
    },
    onDelete: 'CASCADE',
  },
  schedule_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'schedule',
      key: 'scheduleid',
    },
    onDelete: 'CASCADE',
  },
  subject_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'subjectid',
    },
    onDelete: 'CASCADE',
  },
  datetime: {
    type: DataTypes.DATE,  
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'teacherid',
    },
    onDelete: 'CASCADE',
  },
  reservation_status: {
    type: DataTypes.STRING,
    defaultValue: 'booked', 
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: 'cash', 
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  meeting_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'meetings',
      key: 'id',
    },
    onDelete: 'SET NULL',
  }

}, 
{
  tableName: 'reservations',
  timestamps: false,
});

Reservation.belongsTo(Student, { foreignKey: 'student_id' });
Reservation.belongsTo(Subject, { foreignKey: 'subject_id' });
Reservation.belongsTo(Teacher, { foreignKey: 'teacher_id' });
Reservation.belongsTo(Meeting, { foreignKey: 'meeting_id' });

module.exports = Reservation;

const  DataTypes  = require('sequelize');
const sequelize = require('../config/database');


const Student = sequelize.define('Student', {
  studentid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  xp: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  signup_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  hasfoundeasteregg:{
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }, 
  hascompletedquiz:{
    type: DataTypes.BOOLEAN,
    defaultValue: false
  } 
}, {
  tableName: 'students', 
  timestamps: false 
});

module.exports = Student;

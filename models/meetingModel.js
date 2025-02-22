const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true, 
  },
  meet_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  meet_link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, 
{
  tableName: 'meetings',
  timestamps: false,
});

module.exports = Meeting;

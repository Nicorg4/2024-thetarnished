const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const File = sequelize.define('File', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  teacher_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'teacherid'
    },
    onDelete: 'CASCADE'
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  size: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'files',
  timestamps: false
});

module.exports = File;

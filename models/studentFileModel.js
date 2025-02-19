const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentFile = sequelize.define('StudentFile', {
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'students',
      key: 'studentid'
    },
    onDelete: 'CASCADE'
  },
  file_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'files',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'students_files',
  timestamps: false
});

module.exports = StudentFile;

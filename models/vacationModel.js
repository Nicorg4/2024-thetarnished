const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vacation = sequelize.define('Vacation', {
  vacation_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    defaultValue: sequelize.literal('unique_rowid()')
  },
  teacherid: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'approved'
  }
}, {
  tableName: 'vacations',
  timestamps: false,
  validate: {
    endDateAfterStartDate() {
      if (this.end_date <= this.start_date) {
        throw new Error('End date must be greater than start date');
      }
    }
  }
});

module.exports = Vacation;

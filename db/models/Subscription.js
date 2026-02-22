const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Subscription = sequelize.define("Subscription", {

  createdAtTs: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },

  firstSync: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  timestamps: false,
});

module.exports = Subscription;
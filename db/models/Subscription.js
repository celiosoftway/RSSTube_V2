const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Subscription = sequelize.define("Subscription", {

  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  ChannelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

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
  indexes: [
    {
      unique: true,
      fields: ["user_id", "channel_id"]
    },
  ],
});

module.exports = Subscription;
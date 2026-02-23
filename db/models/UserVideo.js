const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const UserVideo = sequelize.define("UserVideo", {

  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  VideoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  notifiedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },

}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["UserId", "VideoId"],
    },
  ],
});

module.exports = UserVideo;
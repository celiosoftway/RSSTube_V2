const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

/**
 * Representa um canal do YouTube.
 */
const Channel = sequelize.define("Channel", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  youtubeChannelId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  title: {
    type: DataTypes.STRING,
  },

  avatar: {
    type: DataTypes.STRING,
  },

});

module.exports = Channel;
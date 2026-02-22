const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

/**
 * Representa usuário ou canal do Telegram.
 */
const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  telegramId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = User;
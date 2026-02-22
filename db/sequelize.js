const { Sequelize } = require("sequelize");

/**
 * Instância do banco SQLite.
 * storage: database.sqlite será criado automaticamente.
 */
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
});

module.exports = sequelize;
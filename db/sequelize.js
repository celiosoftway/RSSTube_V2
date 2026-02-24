const { Sequelize } = require("sequelize");
require("dotenv").config();

/**
 * Instância do banco SQLite.
 * storage: database.sqlite será criado automaticamente.
 */

/*
// para usar sequelize, remova o comentario
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db/data/database.sqlite",
  logging: false,
});
*/

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.BD_HOST,
  port: 3306,
  database: process.env.BD_BANCO,
  username: process.env.BD_USER,
  password: process.env.BD_SENHA,
  logging: false,

  timezone: '-03:00', // Brasil
  dialectOptions: {
    charset: 'utf8mb4',
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    underscored: true,
    freezeTableName: true,
  },
});

module.exports = sequelize;
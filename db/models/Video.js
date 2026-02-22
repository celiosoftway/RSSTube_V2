const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

/**
 * Vídeos são globais.
 * Não pertencem a um usuário específico.
 */
const Video = sequelize.define("Video", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  youtubeVideoId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // 🔥 Declare explicitamente a FK
  ChannelId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  title: DataTypes.STRING,
  link: DataTypes.STRING,
  author: DataTypes.STRING,
  publishedAt: DataTypes.DATE,
  publishedAtTs: DataTypes.BIGINT,
});

module.exports = Video;
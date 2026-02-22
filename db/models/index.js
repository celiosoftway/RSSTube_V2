const sequelize = require("../sequelize");

const User = require("./User");
const Channel = require("./Channel");
const Subscription = require("./Subscription");
const Video = require("./Video");

/**
 * Relacionamentos
 */

User.belongsToMany(Channel, { through: Subscription });
Channel.belongsToMany(User, { through: Subscription });

Channel.hasMany(Video);
Video.belongsTo(Channel);

module.exports = {
  sequelize,
  User,
  Channel,
  Subscription,
  Video,
};
const { User } = require('../../db/models');

let BOT_OPEN = true;

/**
 * Controle global
 */
function openBot() {
  BOT_OPEN = true;
}

function closeBot() {
  BOT_OPEN = false;
}

function isBotOpen() {
  return BOT_OPEN;
}

/**
 * Verifica acesso do usuário
 */
async function canAccess(telegramId, OWNER_ID) {

  // OWNER sempre entra
  if (telegramId === OWNER_ID) {
    return true;
  }

  // se bot estiver aberto, libera geral
  if (BOT_OPEN) {
    return true;
  }

  // modo beta fechado → verifica whitelist
  const user = await User.findOne({
    where: { telegramId: telegramId.toString() }
  });

  return user?.isAllowed === true;
}

/**
 * Libera usuário beta
 */
async function allowUser(telegramId) {

  const [user] = await User.findOrCreate({
    where: { telegramId: telegramId.toString() }
  });

  user.isAllowed = true;
  await user.save();

  return user;
}

/**
 * Bloqueia usuário beta
 */
async function blockUser(telegramId) {

  const user = await User.findOne({
    where: { telegramId: telegramId.toString() }
  });

  if (!user) return null;

  user.isAllowed = false;
  await user.save();

  return user;
}

module.exports = {
  openBot,
  closeBot,
  isBotOpen,
  canAccess,
  allowUser,
  blockUser
};
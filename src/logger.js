const lastLog = new Map();

/**
 * Log normal (atalho para console.log)
 */
function log(message) {
  console.log(message);
}

/**
 * Log com throttle automático.
 * Evita spam de logs repetidos em loops rápidos.
 *
 * @param {string} key Identificador único do log
 * @param {string} message Texto do log
 * @param {number} delay Tempo mínimo entre logs iguais (ms)
 */
function throttledLog(key, message, delay = 3000) {

  const now = Date.now();
  const last = lastLog.get(key) || 0;

  if (now - last < delay) {
    return;
  }

  lastLog.set(key, now);

  console.log(message);
}

module.exports = {
  log,
  throttledLog
};
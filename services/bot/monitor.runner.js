const { runMonitor } = require('../youtube/monitor.service');

let isRunning = false;

/**
 * Evita execução concorrente do monitor
 */
async function safeRunMonitor() {

  if (isRunning) {
    console.log('[Monitor] Execução já em andamento...');
    return;
  }

  try {
    isRunning = true;
    console.log('[Monitor] Iniciando ciclo...');
    await runMonitor();
  } catch (err) {
    console.error('[Monitor] Erro:', err);
  } finally {
    isRunning = false;
  }
}

/**
 * Inicializa loop automático
 */
function startMonitorLoop(intervalMs = 60000) {

  console.log(`[Monitor] Loop iniciado (${intervalMs}ms)`);

  // primeira execução imediata
  safeRunMonitor();

  // loop contínuo
  setInterval(safeRunMonitor, intervalMs);
}

module.exports = {
  startMonitorLoop
};
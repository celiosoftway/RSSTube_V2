// node teste/stress.test.js
const { runMonitor } = require('../services/youtube/monitor.service');
const { Channel } = require('../db/models');

(async () => {

  console.log('🧪 Iniciando stress test...\n');

  const startTotal = Date.now();

  const channels = await Channel.findAll();

  console.log(`📺 Canais cadastrados: ${channels.length}\n`);

  let success = 0;
  let failed = 0;

  for (const channel of channels) {

    const startChannel = Date.now();

    try {

      console.log(`▶️ Processando canal ${channel.id} - ${channel.title}`);

      await runMonitor(channel); // se seu monitor aceitar canal específico
      success++;

      const duration = Date.now() - startChannel;

      console.log(`✅ Canal ${channel.id} finalizado em ${duration}ms\n`);

    } catch (err) {

      failed++;

      console.error(`❌ Erro no canal ${channel.id}`);
      console.error(err);

    }
  }

  const totalDuration = Date.now() - startTotal;

  console.log('\n==============================');
  console.log('📊 RESULTADO DO STRESS TEST');
  console.log('==============================');

  console.log(`⏱️ Tempo total: ${totalDuration}ms`);
  console.log(`📺 Canais processados: ${channels.length}`);
  console.log(`✅ Sucesso: ${success}`);
  console.log(`❌ Falhas: ${failed}`);

  const avg = channels.length ? Math.round(totalDuration / channels.length) : 0;

  console.log(`⚡ Média por canal: ${avg}ms`);

  console.log('==============================\n');

})();
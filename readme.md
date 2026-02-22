core/
 ├── channelService      -> cadastro e normalização do canal
 ├── feedService         -> leitura do RSS do YouTube
 ├── videoService        -> persistência e deduplicação
 ├── monitorService      -> loop de verificação
 └── notifierService     -> envio pro Telegram
 
 https://www.youtube.com/feeds/videos.xml?channel_id=UCXXXX


loop canais únicos
   ↓
buscar RSS UMA vez
   ↓
salvar vídeos novos (global)
   ↓
buscar subscriptions do canal
   ↓
notificar usuários
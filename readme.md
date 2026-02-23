# 🤖 RSSTube V2
<img src="src/img/logo.png" align="middle">

Bot para Telegram que monitora canais do YouTube via RSS e envia notificações automáticas quando novos vídeos são publicados.

Projeto focado em:

* baixo custo (sem uso direto da API oficial do YouTube)
* arquitetura simples e escalável
* controle individual de notificações por usuário

---

# 🚀 Funcionalidades

## 📺 Monitoramento de canais

* Adicionar canal do YouTube via URL
* Monitoramento automático via RSS
* Suporte a múltiplos usuários no mesmo canal
* Vídeos são armazenados globalmente (sem duplicação)

## 🔔 Notificações inteligentes

* Notificação apenas para vídeos novos
* Controle individual por usuário
* Histórico de notificações para evitar envio duplicado
* Primeira sincronização ignora vídeos antigos

## 🤖 Comandos do bot

* ➕ **Adicionar canal** — cadastra canal e cria subscription
* 📋 **Listar canais** — mostra canais do usuário
* ❌ **Deletar canal** — remove apenas a subscription do usuário
* 🔄 **Sincronizar** — força verificação manual
* ❓ **Ajuda** — manual rápido

---

# 🧱 Arquitetura

Estrutura baseada em separação clara de responsabilidades:

```
bot.js            → inicialização do bot
handlers/         → entrada do Telegram (UI/fluxo)
scenes/           → interações guiadas
services/         → regras de negócio
db/models/        → models Sequelize
```

### Entidades principais

* **Channel** → canal global do YouTube
* **Video** → vídeos globais
* **User** → usuário Telegram
* **Subscription** → vínculo User ↔ Channel
* **UserVideo** → histórico de notificações

---

# ⚙️ Instalação

## 1️⃣ Clonar projeto

```
git clone <repo>
cd RSSTube_V2
```

## 2️⃣ Instalar dependências

```
npm install
```

## 3️⃣ Configurar `.env`

```
TELEGRAM_BOT_TOKEN=SEU_TOKEN
TELEGRAM_BOT_USERNAME=rsstube
OWNER_ID=SEU_ID_TELEGRAM
```

---

# ▶️ Executar

```
node bot.js
```

O sistema irá:

* iniciar o bot
* sincronizar banco SQLite
* iniciar monitor automático

---

# 🔄 Monitor automático

O monitor roda em loop usando:

```
setInterval + lock de execução
```

Fluxo:

```
Loop canais únicos
↓
Buscar RSS
↓
Salvar vídeos novos (global)
↓
Notificar usuários inscritos
```

---

# 📦 Banco de Dados

Usa SQLite com Sequelize.

Não é necessário criar tabelas manualmente.

```
database.sqlite
```

é criado automaticamente.

---

# 🧪 Modo Beta

Atualmente o acesso é controlado por middleware:

```
OWNER_ID
```

Durante o beta você pode liberar novos usuários ou grupos no middleware do bot.js. Remova o middleware para uso sem restrições

---

# 🧩 Scenes

## addCanal

Fluxo:

```
Entrar na scene
↓
Enviar URL do canal
↓
Criar subscription
↓
Retornar ao menu
```

Comando `/cancel` disponível dentro da scene.

---

# 🛠️ Tecnologias

* Node.js
* Telegraf
* Sequelize
* SQLite
* RSS XML Parsing

---

# 🧠 Filosofia do Projeto

* Sem associações mágicas do Sequelize
* Queries explícitas
* Monitor único por canal
* Notificação individual por usuário

---

# 🗺️ Roadmap

## Próximos passos

* [ ] Paginação na listagem de canais
* [ ] Filtros por duração do vídeo
* [ ] Configuração por usuário
* [ ] Logs estruturados
* [ ] Worker separado para monitor

## Futuro

* Painel web simples
* Suporte a Shorts / Lives
* Sistema de prioridades de notificação

---

# 👤 Autor

Projeto RSSTube V2 — reconstrução do bot original com foco em arquitetura limpa e baixo custo operacional.

---

# 📜 Licença

Uso pessoal / experimental.

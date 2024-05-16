const { Client, GatewayIntentBits } = require("discord.js");

global.client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildVoiceStates ] });

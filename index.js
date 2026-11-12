require('dotenv').config();
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const token = process.env.token;

const app = express();
app.get('/', (req, res) => res.status(200).send('OK'));
app.get('/health', (req, res) => res.status(200).send('OK'));
app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
	console.log(`Health check server listening on port ${process.env.PORT || 3000}`);
});


process.on('unhandledRejection', error => {
	console.error('[UNHANDLED REJECTION]', error);
});

process.on('uncaughtException', error => {
	console.error('[UNCAUGHT EXCEPTION]', error);
});
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filepath = path.join(commandsPath, file);
		const command = require(filepath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filepath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Adding some debug stuff
client.on('debug', info => {
	if (info.toLowerCase().includes('token')) return;
	console.log('[DISCORD DEBUG]', info);
});

client.on('error', error => {
	console.error('[DISCORD ERROR]', error);
});

client.on('shardError', error => {
	console.error('[SHARD ERROR]', error);
});

client.on('shardDisconnect', (event, id) => {
	console.log(`[SHARD ${id}] Disconnected:`, event);
});

client.on('shardReconnecting', id => {
	console.log(`[SHARD ${id}] Reconnecting...`);
});

client.on('shardReady', id => {
	console.log(`[GATEWAY] Shard ${id} is READY`);
});

client.on('shardReconnecting', id => {
	console.log(`[GATEWAY] Shard ${id} reconnecting`);
});

client.on('shardDisconnect', (event, id) => {
	console.log(`[GATEWAY] Shard ${id} disconnected`, event.code);
});

client.on('shardError', (error, id) => {
	console.error(`[GATEWAY] Shard ${id} error:`, error);
});

client.on('warn', warning => {
	console.warn('[DISCORD WARNING]', warning);
});


console.log('[TEST] Checking Discord API connectivity...');

fetch('https://discord.com/api/v10/gateway', {
	signal: AbortSignal.timeout(10000),
})
	.then(async response => {
		console.log('[TEST] Discord API status:', response.status);
		console.log('[TEST] Gateway response:', await response.json());
	})
	.catch(error => {
		console.error('[TEST] Discord API connection failed:', error);
	});

console.log('[TEST] Attempting Discord login...');

client.login(token)
	.then(() => console.log('[LOGIN] Login promise resolved'))
	.catch(error => console.error('[LOGIN ERROR]', error));
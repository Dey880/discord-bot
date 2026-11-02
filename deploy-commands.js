require('dotenv').config();
const { REST, Routes, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const { clientId, guildId, token } = process.env;
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const dmCommands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filepath = path.join(commandsPath, file);
		const command = require(filepath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
			if (command.dm) {
				dmCommands.push({
					...command.data.toJSON(),
					integration_types: [
						ApplicationIntegrationType.GuildInstall,
						ApplicationIntegrationType.UserInstall,
					],
					contexts: [
						InteractionContextType.BotDM,
						InteractionContextType.PrivateChannel,
					],
				});
			}
		} else {
			console.log(`[WARNING] The command at ${filepath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} guild and ${dmCommands.length} DM application (/) commands.`);

		const guildData = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
		const dmData = await rest.put(Routes.applicationCommands(clientId), { body: dmCommands });

		console.log(`Successfully reloaded ${guildData.length} guild and ${dmData.length} DM application (/) commands.`);
	} catch (error) {
		// And of course, make sure you cathc and log any errors!
		console.error(error);
	}
})();
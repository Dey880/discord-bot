const { SlashCommandBuilder } = require('discord.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


module.exports = {
	cooldown: 2,
	dm: true,
	data: new SlashCommandBuilder().setName('cf').setDescription('Replies with the results of a coinflip!'),
	async execute(interaction) {
		const randomVal = Math.random();
    	const faceCoin = randomVal < 0.5 ? 'Heads' : 'Tails';

		await interaction.reply('You flipped a coin and got...');
		await sleep(2000);
		await interaction.followUp(`${faceCoin}!`);
	},
};
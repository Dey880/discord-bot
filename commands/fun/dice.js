const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	cooldown: 2,
	dm: true,
	data: new SlashCommandBuilder()
		.setName('dice')
		.setDescription('Rolls a die with user specified sides.')
		.addIntegerOption((option) => option.setName('input').setDescription('The amount of sides to roll').setRequired(true)),

	async execute(interaction) {
		const sides = interaction.options.getInteger('input');
		const roll = Math.floor((Math.random() * sides) + 1);
		await interaction.reply(`You rolled a d${sides} and it turned a ${roll}!`);
	},
};
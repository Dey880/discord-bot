const { SlashCommandBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');


module.exports = {
	cooldown: 10,
	dm: true,
	data: new SlashCommandBuilder().setName('kitty').setDescription('Replies with a random kitty image!'),
	async execute(interaction) {
		try {
			const response = await fetch('https://api.thecatapi.com/v1/images/search');
			if (!response.ok) throw new Error(`Cat API response status: ${response.status}`);

			const [cat] = await response.json();
			if (!cat?.url) throw new Error('Cat API returned no image URL');

			const imageResponse = await fetch(cat.url);
			if (!imageResponse.ok) throw new Error(`Image response status: ${imageResponse.status}`);

			const image = Buffer.from(await imageResponse.arrayBuffer());
			const kitty = new AttachmentBuilder(image, { name: 'kitty.jpg' });
			await interaction.reply({ content: 'Here is your kitty!', files: [kitty] });
		} catch (error) {
			console.error('Failed to get kitty image:', error);
			await interaction.reply({
				content: 'There was an error getting your kitty image. Please try again later.',
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
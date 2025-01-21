const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'hello',
  description: 'Menyapa pengguna dengan pesan yang ramah.',
  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setColor('#00ff00') // Warna hijau untuk sambutan yang ramah
      .setTitle('Halo! 👋')
      .setDescription('Selamat datang! Semoga hari Anda menyenankan!')
      .setFooter({ text: 'Metanoia Evolution' })
      .setTimestamp();

    // Kirim embed ke channel
    await message.channel.send({ embeds: [embed] });
  },
};

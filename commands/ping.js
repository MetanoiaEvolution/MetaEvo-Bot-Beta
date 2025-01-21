const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Mengetes apakah bot sedang online dan memberikan informasi mengenai latency bot.',
  async execute(message, args) {
    const delay = Math.floor(Math.random() * 1000) + 500; // Simulasi delay antara 500ms hingga 1500ms

    // Kirim embed sebelum delay
    const embedBeforeDelay = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Pong !!!')
      .setDescription('Bot sedang memproses permintaan... ⏳')
      .addFields(
        { name: 'Ping 🏓', value: 'Menunggu pengukuran ping... 🕒', inline: true },
        { name: 'Latency ⏱', value: 'Menunggu pengukuran latency... ⏱', inline: true }
      )
      .setFooter({ text: 'Metanoia Evolution' })
      .setTimestamp();

    const sentMessage = await message.channel.send({ embeds: [embedBeforeDelay] });

    // Delay sebelum mengedit pesan
    setTimeout(() => {
      const embedAfterDelay = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Pong !!!')
        .setDescription(`Bot respons dalam ${delay}ms.`)
        .addFields(
          { name: 'Ping 🏓', value: `${delay}ms`, inline: true },
          { name: 'Latency ⏱', value: `${delay}ms`, inline: true }
        )
        .setFooter({ text: 'Metanoia Evolution' })
        .setTimestamp();

      // Edit pesan yang sudah dikirim sebelumnya
      sentMessage.edit({ embeds: [embedAfterDelay] });
    }, delay);
  },
};

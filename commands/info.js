const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'info',
  description: 'Memberikan informasi mengenai bot ini.',
  async execute(message, args) {
    // Membuat Embed untuk command info
    const embedInfo = new EmbedBuilder()
      .setColor('#00bfff') // Warna biru muda untuk tampilan lebih segar
      .setTitle('Informasi Bot 🤖') // Judul yang menarik dengan emoji robot
      .setDescription('Berikut adalah informasi tentang **Metanoia Evolution** bot. 🌐')
      .setThumbnail(message.client.user.displayAvatarURL()) // Thumbnail menggunakan avatar bot
      .addFields(
        { name: '🧠 Nama Bot', value: 'Metanoia Evolution', inline: true },
        { name: '🔢 Versi', value: 'v1.0.0', inline: true },
        { name: '📄 Deskripsi', value: 'Bot ini menyediakan berbagai fitur menarik dan berguna di server Discord!', inline: false },
        { name: '👨‍💻 Developer', value: 'MaXx', inline: true },
        { name: '🌍 Jumlah Server', value: `${message.client.guilds.cache.size} Server`, inline: true },
        { name: '👥 Jumlah Pengguna', value: `${message.client.users.cache.size} Pengguna`, inline: true },
        { name: '📅 Tanggal Bergabung', value: message.client.user.createdAt.toLocaleDateString(), inline: true },
        { name: '💬 Dukungan', value: '[Support Server](https://discord.gg/eBW98yWg)', inline: false },
        { name: '🔗 Undang Bot', value: '[Klik untuk mengundang Bot](https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID&scope=bot&permissions=YOUR_PERMISSIONS)', inline: false }
      )
      .setFooter({ text: 'Metanoia Evolution | Your friendly bot! 🤗', iconURL: message.client.user.displayAvatarURL() }) // Footer dengan ikon bot
      .setTimestamp(); // Tanggal waktu embed dikirim

    // Kirim Embed dengan informasi
    await message.channel.send({ embeds: [embedInfo] });
  },
};

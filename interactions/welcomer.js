const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'welcomer',
  description: 'Sambutan untuk anggota baru di server',

  // Fungsi untuk menyambut anggota baru
  async execute(client) {
    client.on('guildMemberAdd', async (member) => {
      // Menentukan channel sambutan menggunakan ID (ID channel diambil dari .env)
      const channelId = process.env.WELCOME_CHANNEL_ID;  // ID channel diambil dari .env
      console.log(`Mencoba untuk menyambut anggota baru ${member.user.tag} di channel dengan ID ${channelId}`);

      const channel = member.guild.channels.cache.get(channelId);

      if (!channel) {
        console.log('Channel dengan ID tersebut tidak ditemukan!');
        return;
      }

      console.log(`Channel ditemukan: ${channel.name}`);

      const welcomeEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Selamat Datang!')
        .setDescription(`Halo ${member.user.tag}, selamat datang di **${member.guild.name}**!`)
        .setThumbnail(member.user.avatarURL())
        .addFields(
          { name: '🎉 Selamat bergabung!', value: `Jangan lupa membaca aturan dan perkenalkan diri kamu!`, inline: true },
          { name: '📅 Member ke-', value: `${member.guild.memberCount}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Bot powered by Discord.js' });

      // Kirim pesan sambutan ke channel dengan ID yang telah ditentukan
      try {
        await channel.send({ embeds: [welcomeEmbed] });
        console.log('Pesan sambutan berhasil dikirim.');
      } catch (error) {
        console.error('Gagal mengirim pesan sambutan:', error);
      }
    });
  }
};

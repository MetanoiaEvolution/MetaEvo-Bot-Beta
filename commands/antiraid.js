const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'antiraid',
  description: 'Mengaktifkan atau menonaktifkan perlindungan anti-raid untuk server.',
  permissions: ['ADMINISTRATOR'], // Hanya bisa digunakan oleh admin
  execute(message, args) {
    const subCommand = args[0]?.toLowerCase();

    if (!subCommand || (subCommand !== 'on' && subCommand !== 'off')) {
      return message.channel.send('Silakan gunakan **on** atau **off** untuk mengaktifkan atau menonaktifkan fitur Anti-Raid.');
    }

    const antiRaidStatus = subCommand === 'on' ? true : false;

    // Simpan pengaturan Anti-Raid ke database atau memory server
    message.client.antiRaidEnabled = antiRaidStatus;

    const embed = new EmbedBuilder()
      .setColor(antiRaidStatus ? '#ff0000' : '#00ff00') // Merah jika ON, hijau jika OFF
      .setTitle(antiRaidStatus ? 'Anti-Raid Diaktifkan 🛑' : 'Anti-Raid Dinonaktifkan ✅')
      .setDescription(
        antiRaidStatus
          ? 'Perlindungan anti-raid telah diaktifkan. Semua pengguna baru akan diawasi dengan ketat!'
          : 'Perlindungan anti-raid telah dinonaktifkan. Semua pengguna bisa bergabung tanpa pembatasan khusus.'
      )
      .setFooter({ text: 'Metanoia Evolution | Anti-Raid System', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });

    if (antiRaidStatus) {
      // Tambahkan pengawasan ekstra, seperti membatasi pengguna baru
      const newMemberListener = (member) => {
        if (!member.guild) return; // Pastikan ini adalah member yang masuk ke server

        // Cek apakah ini adalah raid, misalnya terlalu banyak pengguna yang masuk dalam waktu singkat
        const joinLog = message.client.joinLog || [];
        joinLog.push(Date.now());
        message.client.joinLog = joinLog.filter((time) => Date.now() - time < 60000); // Menyimpan join dalam 1 menit terakhir

        if (message.client.joinLog.length > 10) { // Batas 10 pengguna dalam 1 menit
          member.guild.members.cache.forEach((m) => {
            if (!m.permissions.has('ADMINISTRATOR')) {
              m.ban({ reason: 'Anti-Raid Protection: Raid detected' });
            }
          });

          message.channel.send('🚨 Deteksi raid! Semua anggota yang baru saja masuk telah dibanned untuk melindungi server.');
        }
      };

      message.client.on('guildMemberAdd', newMemberListener);
    } else {
      // Hapus listener jika Anti-Raid dimatikan
      message.client.removeAllListeners('guildMemberAdd');
    }
  },
};

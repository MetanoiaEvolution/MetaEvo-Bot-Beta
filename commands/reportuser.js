const { EmbedBuilder, PermissionsBitField } = require('discord.js'); // Pastikan EmbedBuilder diimpor
const { reportChannelId, reportChannelName } = require('../config.js'); // Mengambil channel ID dan nama channel dari config.js

module.exports = {
    name: 'reportuser',
    description: 'Lapor pengguna dengan menyertakan alasan.',
    async execute(message, args) {
        // Cek apakah command dijalankan di channel yang benar berdasarkan reportChannelId dari config.js
        if (message.channel.id !== reportChannelId) {
            return message.reply(`Perintah ini hanya bisa digunakan di channel <#${reportChannelId}>.`);
        }

        // Cari channel laporan (🚨-report) dengan nama atau ID yang sesuai
        let reportChannel = message.guild.channels.cache.find(channel => channel.name === reportChannelName);

        if (!reportChannel) {
            try {
                console.log("Membuat channel 🚨-report...");
                reportChannel = await message.guild.channels.create({
                    name: '🚨-report',
                    type: 0, // 0 adalah untuk text channel
                    topic: 'Channel untuk laporan pengguna',
                    reason: 'Membuat channel untuk laporan pengguna',
                    permissionOverwrites: [
                        {
                            id: message.guild.id, // Everyone role
                            deny: [PermissionsBitField.Flags.ViewChannel], // Menyembunyikan channel dari semua user
                        },
                    ],
                });
                console.log("Channel 🚨-report berhasil dibuat.");
            } catch (error) {
                console.error('Error membuat channel 🚨-report:', error);
                return message.reply('Terjadi kesalahan saat membuat channel untuk laporan.');
            }
        }

        // Kirim Embed dengan instruksi laporan
        const reportEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Laporan Pengguna')
            .setDescription('Silakan masukkan @username : alasan laporan.')
            .addFields(
                { name: 'Contoh Format:', value: '@username : dia harus di ban nih' }
            )
            .setTimestamp();

        await message.reply({ embeds: [reportEmbed] });

        // Tunggu input dari pengguna
        const filter = response => response.author.id === message.author.id;
        const collected = await message.channel.awaitMessages({
            filter,
            max: 1,
            time: 30000,
            errors: ['time'],
        }).catch(() => null);

        if (!collected) {
            return message.reply('Waktu habis! Laporan tidak dikirim.');
        }

        const reportMessage = collected.first().content;

        // Parsing laporan untuk mengambil mention dan alasan
        const [mention, reason] = reportMessage.split(' : ');

        // Menangani jika format salah atau mention tidak ada
        let userToReport = message.mentions.users.first();

        if (!userToReport) {
            // Jika mention tidak ditemukan, coba mendapatkan user berdasarkan ID
            const userID = mention?.replace(/[<@!>]/g, '');
            userToReport = message.guild.members.cache.get(userID)?.user;
        }

        if (!userToReport) {
            return message.reply('Mohon sebutkan @username yang ingin dilaporkan dengan benar (gunakan fitur autocomplete).');
        }

        // Validasi alasan
        const reportReason = reason ? reason.trim() : 'Tidak ada alasan diberikan';

        // Memastikan semua field memiliki nilai string yang valid
        const reportEmbedMessage = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Laporan Pengguna')
            .addFields(
                { name: 'Dilaporkan Oleh', value: message.author.tag || 'Tidak ada penulis laporan', inline: true },
                { name: 'Pengguna yang Dilaporkan', value: userToReport.tag || 'Tidak ada pengguna yang dilaporkan', inline: true },
                { name: 'Alasan', value: reportReason, inline: false },
                { name: 'Tanggal Laporan', value: new Date().toLocaleString(), inline: true },
            )
            .setThumbnail(userToReport.displayAvatarURL())
            .setFooter({ text: 'Laporan Otomatis', iconURL: message.guild.iconURL() })
            .setTimestamp();

        try {
            // Mengirim laporan ke channel 🚨-report
            await reportChannel.send({ embeds: [reportEmbedMessage] });
            message.reply('Laporan berhasil dikirim!');
        } catch (error) {
            console.error('Error mengirim laporan:', error);
            message.reply('Terjadi kesalahan saat mengirim laporan.');
        }

        // Menghapus pesan input pengguna setelah selesai diproses (Hanya input pengguna)
        try {
            await collected.first().delete(); // Menghapus pesan input pengguna
        } catch (error) {
            console.error('Gagal menghapus pesan pengguna:', error);
        }
    },
};

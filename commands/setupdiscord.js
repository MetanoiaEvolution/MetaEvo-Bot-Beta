const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'setupdiscord',
  description: 'Membuat setup server dengan template atau default setting.',
  
  async execute(message, args) {
    // Buat channel setup jika belum ada
    let setupChannel = message.guild.channels.cache.find(channel => channel.name === 'setup-server');
    if (!setupChannel) {
      setupChannel = await message.guild.channels.create({
        name: 'setup-server',
        type: 0, // Channel type: 0 = Text Channel
        permissionOverwrites: [
          {
            id: message.guild.id, // Everyone role
            deny: [PermissionsBitField.Flags.ViewChannel], // Menyembunyikan channel dari semua user
          },
          {
            id: message.member.id, // Hanya creator yang bisa melihat
            allow: [PermissionsBitField.Flags.ViewChannel],
          }
        ],
      });
    }

    // Mengirim pesan di channel setup dengan dropdown menu
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Setup Server')
      .setDescription('Pilih salah satu opsi untuk melanjutkan:')
      .addFields(
        { name: '🔗 Link Template', value: 'Setup menggunakan link template Discord yang Anda berikan.' },
        { name: '🛠️ Default Setup', value: 'Setup menggunakan default template dari bot.' }
      )
      .setFooter({ text: 'Metanoia Evolution' });

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup-menu')
          .setPlaceholder('Pilih metode setup...')
          .addOptions([
            {
              label: 'Link Template',
              description: 'Setup menggunakan link template.',
              value: 'link_template',
              emoji: '🔗',
            },
            {
              label: 'Default Setup',
              description: 'Setup menggunakan template default bot.',
              value: 'default_setup',
              emoji: '🛠️',
            }
          ])
      );

    const setupMessage = await setupChannel.send({ embeds: [embed], components: [row] });

    // Menunggu interaksi dari user
    const collector = setupMessage.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async interaction => {
      if (!interaction.isStringSelectMenu()) return; // Pastikan ini adalah interaksi Select Menu

      try {
        const value = interaction.values[0];

        if (value === 'link_template') {
            // Meminta link template dari user dengan embed
            await interaction.reply({ 
              embeds: [new EmbedBuilder().setColor('#00ff00').setDescription('Masukkan link template Discord Anda:')] 
            });
        
            const filter = response => response.author.id === interaction.user.id;
            const collected = await setupChannel.awaitMessages({ filter, max: 1, time: 60000 });
        
            const templateLink = collected.first()?.content;
        
            // Pastikan user memasukkan link yang valid
            if (templateLink && (templateLink.startsWith('https://discord.new/') || templateLink.startsWith('https://discord.gg/'))) {
                // Kirimkan embed konfirmasi kepada pengguna
                await interaction.followUp({
                    embeds: [
                        new EmbedBuilder().setColor('#00ff00').setDescription(`Apakah Anda yakin ingin menggunakan template berikut?\n${templateLink}\nKetik 'ya' untuk melanjutkan atau 'batal' untuk membatalkan.`)
                    ]
                });
        
                // Menunggu konfirmasi dari pengguna
                const confirmationCollected = await setupChannel.awaitMessages({
                    filter: response => response.author.id === interaction.user.id && (response.content.toLowerCase() === 'ya' || response.content.toLowerCase() === 'batal'),
                    max: 1,
                    time: 60000
                });
        
                const confirmation = confirmationCollected.first()?.content?.toLowerCase();
        
                if (confirmation === 'ya') {
                    // Lakukan pembersihan server (hapus semua kecuali setup channel)
                    await clearServer(message.guild, setupChannel);
        
                    // Kirimkan notifikasi untuk mulai memproses template
                    await interaction.followUp({
                        embeds: [new EmbedBuilder().setColor('#00ff00').setDescription(`Memproses template dari link: ${templateLink}`)]
                    });
        
                    // Implementasikan logika untuk mengimpor atau memproses template
                    try {
                        // Misalnya, gunakan API Discord untuk membuat channel, roles, atau pengaturan server berdasarkan template
                        await importTemplateFromLink(templateLink, message.guild); // Fungsi ini harus Anda implementasikan untuk menyesuaikan dengan kebutuhan Anda
        
                        // Setelah proses selesai
                        await interaction.followUp({
                            embeds: [new EmbedBuilder().setColor('#00ff00').setDescription('Setup template berhasil diterapkan.')]
                        });
        
                    } catch (error) {
                        console.error('Error saat memproses template:', error);
                        await interaction.followUp({
                            embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Terjadi kesalahan saat memproses template.')]
                        });
                    }
        
                } else {
                    await interaction.followUp({
                        embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Setup dibatalkan oleh pengguna.')]
                    });
        
                    // Hapus channel setup jika setup dibatalkan
                    await deleteSetupChannel(setupChannel);
                }
            } else {
                await interaction.followUp({
                    embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Link template tidak valid. Setup dibatalkan.')]
                });
        
                // Hapus channel setup jika setup dibatalkan
                await deleteSetupChannel(setupChannel);
            }        
                    
        } else if (value === 'default_setup') {
          // Konfirmasi apakah user ingin melanjutkan default setup dengan embed
          await interaction.reply({ embeds: [new EmbedBuilder().setColor('#00ff00').setDescription('Apakah Anda yakin ingin menggunakan setup default dari bot? (ketik "yes" atau "no")')] });

          const filter = response => response.author.id === interaction.user.id && ['yes', 'no'].includes(response.content.toLowerCase());
          const collected = await setupChannel.awaitMessages({ filter, max: 1, time: 60000 });

          if (collected.first()?.content.toLowerCase() === 'yes') {
            // Lakukan pembersihan server (hapus semua kecuali setup channel)
            await clearServer(message.guild, setupChannel);

            // Melakukan setup default (kategori, channel, roles)
            await interaction.followUp({ embeds: [new EmbedBuilder().setColor('#00ff00').setDescription('Memulai setup default server...')] });
            await createDefaultSetup(message.guild, setupChannel);
          } else {
            await interaction.followUp({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Setup dibatalkan.')] });
            // Hapus channel setup jika setup dibatalkan
            await deleteSetupChannel(setupChannel);
          }
        }
      } catch (error) {
        console.error('Terjadi kesalahan saat memproses interaksi:', error);
        if (!interaction.replied) {
          await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Terjadi kesalahan saat memproses interaksi.')] });
        }
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        setupChannel.send({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Tidak ada interaksi dalam 60 detik. Setup dibatalkan.')] });
        // Hapus channel setup jika tidak ada interaksi
        await deleteSetupChannel(setupChannel);
      }
    });
  },
};

// Fungsi untuk menghapus semua channel dan roles kecuali channel setup dan role bot
async function clearServer(guild, setupChannel) {
  // Hapus semua channel kecuali setup channel
  guild.channels.cache.forEach(async (channel) => {
    if (channel.id !== setupChannel.id) {
      try {
        await channel.delete();
      } catch (error) {
        console.error(`Gagal menghapus channel: ${channel.name}. Error: ${error.message}`);
        await setupChannel.send({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`⚠️ Tidak dapat menghapus channel: **${channel.name}**. Pastikan bot memiliki izin yang cukup.`)] });
      }
    }
  });

  // Hapus semua roles kecuali @everyone dan role bot
  guild.roles.cache.forEach(async (role) => {
    if (role.name !== '@everyone' && role.managed === false) { // Pastikan tidak menghapus role yang dibuat oleh bot
      try {
        await role.delete();
      } catch (error) {
        console.error(`Gagal menghapus role: ${role.name}. Error: ${error.message}`);
        await setupChannel.send({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`⚠️ Tidak dapat menghapus role: **${role.name}**. Pastikan bot memiliki izin yang cukup dan role bot berada di atas role tersebut.`)] });
      }
    }
  });
}

module.exports = {
  name: 'setupdiscord',
  description: 'Membuat setup server dengan template atau default setting.',
  
  async execute(message, args) {
    // Buat channel setup jika belum ada
    let setupChannel = message.guild.channels.cache.find(channel => channel.name === 'setup-server');
    if (!setupChannel) {
      setupChannel = await message.guild.channels.create({
        name: 'setup-server',
        type: 0, // Channel type: 0 = Text Channel
        permissionOverwrites: [
          {
            id: message.guild.id, // Everyone role
            deny: [PermissionsBitField.Flags.ViewChannel], // Menyembunyikan channel dari semua user
          },
          {
            id: message.member.id, // Hanya creator yang bisa melihat
            allow: [PermissionsBitField.Flags.ViewChannel],
          }
        ],
      });
    }

    // Mengirim pesan di channel setup dengan dropdown menu
    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Setup Server')
      .setDescription('Pilih salah satu opsi untuk melanjutkan:')
      .addFields(
        { name: '🔗 Link Template', value: 'Setup menggunakan link template Discord yang Anda berikan.' },
        { name: '🛠️ Default Setup', value: 'Setup menggunakan default template dari bot.' }
      )
      .setFooter({ text: 'Metanoia Evolution' });

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('setup-menu')
          .setPlaceholder('Pilih metode setup...')
          .addOptions([
            {
              label: 'Link Template',
              description: 'Setup menggunakan link template.',
              value: 'link_template',
              emoji: '🔗',
            },
            {
              label: 'Default Setup',
              description: 'Setup menggunakan template default bot.',
              value: 'default_setup',
              emoji: '🛠️',
            }
          ])
      );

    const setupMessage = await setupChannel.send({ embeds: [embed], components: [row] });

    // Menunggu interaksi dari user
    const collector = setupMessage.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async interaction => {
      if (!interaction.isStringSelectMenu()) return; // Pastikan ini adalah interaksi Select Menu

      try {
        // Validasi interaksi sebelum membalas
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp('Interaksi ini sudah diproses sebelumnya.');
          return;
        }
        
        const value = interaction.values[0];

        if (value === 'link_template') {
          // Meminta link template dari user
          await interaction.reply('Masukkan link template Discord Anda:');
          
          const filter = response => response.author.id === interaction.user.id;
          const collected = await setupChannel.awaitMessages({ filter, max: 1, time: 60000 });

          const templateLink = collected.first()?.content;
          // Pastikan user memasukkan link yang valid
          if (templateLink && (templateLink.startsWith('https://discord.new/') || templateLink.startsWith('https://discord.gg/'))) {
            // Lakukan pembersihan server (hapus semua kecuali setup channel)
            await clearServer(message.guild, setupChannel);

            // Import template dari link yang diberikan user
            await interaction.followUp(`Memproses template dari link: ${templateLink}`);
            // (Implementasi untuk proses setup menggunakan link template)
          } else {
            await interaction.followUp('Link template tidak valid. Setup dibatalkan.');
            // Hapus channel setup jika setup dibatalkan
            await deleteSetupChannel(setupChannel);
          }
        } else if (value === 'default_setup') {
          // Konfirmasi apakah user ingin melanjutkan default setup
          await interaction.reply('Apakah Anda yakin ingin menggunakan setup default dari bot? (ketik "yes" atau "no")');

          const filter = response => response.author.id === interaction.user.id && ['yes', 'no'].includes(response.content.toLowerCase());
          const collected = await setupChannel.awaitMessages({ filter, max: 1, time: 60000 });

          if (collected.first()?.content.toLowerCase() === 'yes') {
            // Lakukan pembersihan server (hapus semua kecuali setup channel)
            await clearServer(message.guild, setupChannel);

            // Melakukan setup default (kategori, channel, roles)
            await interaction.followUp({ embeds: [new EmbedBuilder().setColor('#00ff00').setDescription('Memulai setup default server...')] });
            await createAdvancedSetup(message.guild, setupChannel);
          } else {
            await interaction.followUp('Setup dibatalkan.');
            // Hapus channel setup jika setup dibatalkan
            await deleteSetupChannel(setupChannel);
          }
        }
      } catch (error) {
        console.error('Terjadi kesalahan saat memproses interaksi:', error);
        if (!interaction.replied) {
          await interaction.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Terjadi kesalahan saat memproses interaksi.')] });
        }
      }
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        setupChannel.send({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription('Tidak ada interaksi dalam 60 detik. Setup dibatalkan.')] });
        // Hapus channel setup jika tidak ada interaksi
        await deleteSetupChannel(setupChannel);
      }
    });
  },
};

// Fungsi untuk menghapus semua channel dan roles kecuali channel setup dan role bot
async function clearServer(guild, setupChannel) {
  // Hapus semua channel kecuali setup channel
  guild.channels.cache.forEach(async (channel) => {
    if (channel.id !== setupChannel.id) {
      try {
        await channel.delete();
      } catch (error) {
        console.error(`Gagal menghapus channel: ${channel.name}. Error: ${error.message}`);
        await setupChannel.send({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`⚠️ Tidak dapat menghapus channel: **${channel.name}**. Pastikan bot memiliki izin yang cukup.`)] });
      }
    }
  });

  // Hapus semua roles kecuali @everyone dan role bot
  guild.roles.cache.forEach(async (role) => {
    if (role.name !== '@everyone' && role.managed === false) { // Pastikan tidak menghapus role yang dibuat oleh bot
      try {
        await role.delete();
      } catch (error) {
        console.error(`Gagal menghapus role: ${role.name}. Error: ${error.message}`);
        await setupChannel.send({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`⚠️ Tidak dapat menghapus role: **${role.name}**. Pastikan bot memiliki izin yang cukup dan role bot berada di atas role tersebut.`)] });
      }
    }
  });
}

// Fungsi untuk membuat kategori, channel, roles, dan event default
async function createAdvancedSetup(guild, setupChannel) {
    // Membuat kategori tambahan untuk event, aktivitas, kreatif, dan lain-lain
    const activityCategory = await guild.channels.create({
      name: '🎮 Event & Activities',
      type: 4, // Category type
    });
  
    const generalCategory = await guild.channels.create({
      name: '🌐 General',
      type: 4, // Category type
    });
  
    const supportCategory = await guild.channels.create({
      name: '🛠️ Support',
      type: 4, // Category type
    });
  
    const mediaCategory = await guild.channels.create({
      name: '📸 Media',
      type: 4, // Category type
    });
  
    const musicCategory = await guild.channels.create({
      name: '🎵 Music',
      type: 4, // Category type
    });
  
    const creativeCategory = await guild.channels.create({
      name: '🎨 Creative',
      type: 4, // Category type
    });
  
    const feedbackCategory = await guild.channels.create({
      name: '📣 Feedback',
      type: 4, // Category type
    });
  
    const gamingCategory = await guild.channels.create({
      name: '🎮 Gaming',
      type: 4, // Category type
    });
  
    const memesCategory = await guild.channels.create({
      name: '😂 Memes',
      type: 4, // Category type
    });
  
    const developerCategory = await guild.channels.create({
      name: '💻 Development',
      type: 4, // Category type
    });
    const generalTextChannel = await guild.channels.create({
        name: '💬 general-chat',
        type: 0, // Teks Channel
        parent: generalCategory.id, // Menempatkan channel ini di dalam kategori General
        topic: 'Diskusi umum dan interaksi antar member.',
        nsfw: false,
      });
      
      const generalVoiceChannel = await guild.channels.create({
        name: '🔊 general-voice',
        type: 2, // Voice Channel
        parent: generalCategory.id, // Menempatkan channel ini di dalam kategori General
        nsfw: false,
      });
      const supportTextChannel = await guild.channels.create({
        name: '❓ support-chat',
        type: 0, // Teks Channel
        parent: supportCategory.id, // Menempatkan channel ini di dalam kategori Support
        topic: 'Tempat untuk bertanya dan mendapatkan bantuan.',
        nsfw: false,
      });
      
      const supportVoiceChannel = await guild.channels.create({
        name: '📞 support-voice',
        type: 2, // Voice Channel
        parent: supportCategory.id, // Menempatkan channel ini di dalam kategori Support
        nsfw: false,
      });
    // Membuat channel untuk kategori event dan aktivitas
    const gameNightChannel = await guild.channels.create({
      name: '🎮 game-night',
      type: 0, // Text Channel
      parent: activityCategory.id,
      topic: 'Ayo bermain bersama, siapa yang siap bertanding? 🎮',
      nsfw: false,
    });
  
    const artSharingChannel = await guild.channels.create({
      name: '🎨 art-sharing',
      type: 0, // Text Channel
      parent: activityCategory.id,
      topic: 'Bagikan karya seni kreatifmu! 🎨',
      nsfw: false,
    });
  
    const bookClubChannel = await guild.channels.create({
      name: '📚 book-club',
      type: 0, // Text Channel
      parent: activityCategory.id,
      topic: 'Suka membaca? Ayo diskusi buku favorit di sini! 📚',
      nsfw: false,
    });
  
    const eventChannel = await guild.channels.create({
      name: '📅 events',
      type: 0, // Text Channel
      parent: activityCategory.id,
      topic: 'Pengumuman tentang acara dan aktivitas server.',
      nsfw: false,
    });
  
    // Channel untuk kategori media
    const mediaShareChannel = await guild.channels.create({
      name: '📸 media-share',
      type: 0, // Text Channel
      parent: mediaCategory.id,
      topic: 'Bagikan foto, video, atau konten multimedia lainnya.',
      nsfw: false,
    });
  
    const photographyChannel = await guild.channels.create({
      name: '📷 photography',
      type: 0, // Text Channel
      parent: mediaCategory.id,
      topic: 'Tempat berbagi foto dan tips fotografi.',
      nsfw: false,
    });
  
    const videoEditingChannel = await guild.channels.create({
      name: '🎬 video-editing',
      type: 0, // Text Channel
      parent: mediaCategory.id,
      topic: 'Diskusi tentang editing video dan teknik produksi.',
      nsfw: false,
    });
  
    // Channel untuk kategori musik
    const musicDiscussionChannel = await guild.channels.create({
      name: '🎵 music-discussion',
      type: 0, // Text Channel
      parent: musicCategory.id,
      topic: 'Diskusi tentang musik favorit, album, dan artis.',
      nsfw: false,
    });
  
    const musicSharingChannel = await guild.channels.create({
      name: '🎶 music-share',
      type: 0, // Text Channel
      parent: musicCategory.id,
      topic: 'Bagikan lagu atau playlist favoritmu.',
      nsfw: false,
    });
  
    const musicVoiceChannel = await guild.channels.create({
      name: '🎧 music-room',
      type: 2, // Voice Channel
      parent: musicCategory.id,
      nsfw: false,
    });
  
    // Channel kreatif
    const creativeShareChannel = await guild.channels.create({
      name: '🎨 creative-share',
      type: 0, // Text Channel
      parent: creativeCategory.id,
      topic: 'Bagikan karya seni, proyek kreatif, atau desainmu.',
      nsfw: false,
    });
  
    // Channel feedback
    const feedbackChannel = await guild.channels.create({
      name: '📣 feedback',
      type: 0, // Text Channel
      parent: feedbackCategory.id,
      topic: 'Berikan saran atau masukan untuk perbaikan server.',
      nsfw: false,
    });
  
    // Channel game
    const gameDiscussionChannel = await guild.channels.create({
      name: '🎮 game-discussion',
      type: 0, // Text Channel
      parent: gamingCategory.id,
      topic: 'Diskusi tentang game terbaru dan favoritmu.',
      nsfw: false,
    });
  
    const multiplayerChannel = await guild.channels.create({
      name: '🎮 multiplayer',
      type: 0, // Text Channel
      parent: gamingCategory.id,
      topic: 'Cari teman bermain? Gabung di sini.',
      nsfw: false,
    });
  
    const gameStrategyChannel = await guild.channels.create({
      name: '🎮 game-strategy',
      type: 0, // Text Channel
      parent: gamingCategory.id,
      topic: 'Diskusi tentang strategi dan tips dalam game.',
      nsfw: false,
    });
  
    // Channel meme
    const memeChannel = await guild.channels.create({
      name: '😂 memes',
      type: 0, // Text Channel
      parent: memesCategory.id,
      topic: 'Tempat berbagi meme lucu dan gambar kocak.',
      nsfw: false,
    });
  
    const dankMemesChannel = await guild.channels.create({
      name: '💀 dank-memes',
      type: 0, // Text Channel
      parent: memesCategory.id,
      topic: 'Meme dengan humor tingkat tinggi.',
      nsfw: false,
    });
  
    // Channel developer
    const devDiscussionChannel = await guild.channels.create({
      name: '💻 dev-discussion',
      type: 0, // Text Channel
      parent: developerCategory.id,
      topic: 'Diskusi tentang pemrograman dan pengembangan perangkat lunak.',
      nsfw: false,
    });
  
    const codingHelpChannel = await guild.channels.create({
      name: '💡 coding-help',
      type: 0, // Text Channel
      parent: developerCategory.id,
      topic: 'Butuh bantuan coding? Tanyakan di sini.',
      nsfw: false,
    });
  
    const projectShowcaseChannel = await guild.channels.create({
      name: '🚀 project-showcase',
      type: 0, // Text Channel
      parent: developerCategory.id,
      topic: 'Tunjukkan proyek atau aplikasi yang sedang kamu kerjakan.',
      nsfw: false,
    });
  
    // Membuat roles untuk staff dan helper
    const staffRole = await guild.roles.create({
      name: '👨‍💼 Staff',
      color: '#4B0082',
      permissions: [
        PermissionsBitField.Flags.ManageChannels,
        PermissionsBitField.Flags.ManageMessages,
        PermissionsBitField.Flags.ManageRoles,
        PermissionsBitField.Flags.BanMembers,
        PermissionsBitField.Flags.KickMembers,
        PermissionsBitField.Flags.MuteMembers,
      ],
    });
  
    const helperRole = await guild.roles.create({
      name: '🧑‍🤝‍🧑 Helper',
      color: '#FFD700',
      permissions: [
        PermissionsBitField.Flags.ManageMessages,
        PermissionsBitField.Flags.MuteMembers,
      ],
    });
  
    // Membuat auto-assign roles untuk member baru
    const welcomeChannel = await guild.channels.create({
      name: '👋 welcome',
      type: 0, // Text Channel
      parent: activityCategory.id,
      topic: 'Selamat datang di server kami! Pastikan untuk membaca aturan!',
      nsfw: false,
    });
  
    // Menambahkan bot automation untuk member baru
    await welcomeChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('🎉 Selamat datang di server!')
          .setDescription('Kami sangat senang kamu bergabung. Jangan lupa untuk memperkenalkan diri dan membaca aturan yang ada di #rules.')
      ]
    });
  
    // Periksa apakah role '👥 Member' sudah ada
    let memberRole = guild.roles.cache.find(role => role.name === '👥 Member');
  
    if (!memberRole) {
      // Jika belum ada, buat role baru '👥 Member'
      memberRole = await guild.roles.create({
        name: '👥 Member',
        color: '#00ff00',  // Anda bisa mengganti warna sesuai keinginan
      });
    }
  
    // Menambahkan role '👥 Member' ke semua member non-bot
    await guild.members.fetch().then(members => {
      members.forEach(async (member) => {
        if (!member.user.bot) {
          // Pastikan Anda menambahkan role dengan ID (bukan nama)
          await member.roles.add(memberRole.id); // Menambahkan role kepada member
        }
      });
    });
  
    // Menambahkan scheduled events dengan notifikasi otomatis
    const scheduledEvents = [
      {
        name: '🎮 Game Night',
        description: 'Bergabunglah untuk malam permainan bersama!',
        time: '2025-01-25T18:00:00Z', // Tanggal dan waktu acara
      },
      {
        name: '🎨 Art Show',
        description: 'Tunjukkan karya seni terbaikmu!',
        time: '2025-01-27T15:00:00Z',
      },
    ];
  
    scheduledEvents.forEach(async (event) => {
      await eventChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle(`📅 Event: ${event.name}`)
            .setDescription(event.description)
            .addFields([
              { name: 'Waktu:', value: `<t:${Math.floor(new Date(event.time).getTime() / 1000)}:F>` },
            ])
      ]});
    });
  
    // Membuat log channel untuk mencatat aktivitas admin/moderator
    const logChannel = await guild.channels.create({
      name: '🔒 log-channel',
      type: 0, // Text Channel
      parent: activityCategory.id,
      topic: 'Log untuk aktivitas admin dan moderator.',
      nsfw: false,
    });
  
    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('📝 Log Channel Created')
          .setDescription('Semua aktivitas admin dan moderator akan tercatat di sini untuk keamanan dan transparansi.')
      ]
    });
  
    // Update permissions untuk Event & Activity Channels
    await gameNightChannel.permissionOverwrites.edit(staffRole, {
      ViewChannel: true,
      SendMessages: true,
    });
  
    // Kirim konfirmasi setup selesai
    await setupChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#32CD32')
          .setTitle('🚀 Setup Server Telah Selesai!')
          .setDescription('Semua channel dan roles sudah siap! Selamat datang di server! 🎉')
      ]
    });
  }
  
// Fungsi untuk menghapus channel setup
async function deleteSetupChannel(setupChannel) {
  try {
    await setupChannel.delete();
  } catch (error) {
    console.error('Gagal menghapus channel setup:', error);
  }
}

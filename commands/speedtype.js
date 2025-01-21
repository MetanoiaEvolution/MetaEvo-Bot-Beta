const { EmbedBuilder } = require('discord.js');

// List kata-kata yang digunakan dalam game
const words = [
    'saya', 'kamu', 'dia', 'kami', 'mereka', 'kita', 'aku', 'anda', 'belajar', 'kerja',
    'rumah', 'sekolah', 'kantor', 'teman', 'keluarga', 'makan', 'minum', 'pergi', 'datang', 'tidur',
    'bangun', 'tidak', 'ya', 'perlu', 'baik', 'buruk', 'besar', 'kecil', 'panjang', 'pendek',
    'cepat', 'lambat', 'baru', 'lama', 'mudah', 'sulit', 'senang', 'sedih', 'marah', 'tenang',
    'bantu', 'cinta', 'suka', 'benci', 'takut', 'bahagia', 'terima', 'beri', 'selamat', 'pulang',
    'libur', 'kerja', 'waktu', 'hari', 'bulan', 'tahun', 'sudah', 'belum'
  ];
  

module.exports = {
  name: 'speedtype',
  description: 'Game mengetik cepat! Ketik kata-kata acak secepat mungkin.',
  async execute(message) {
    // Pilih kata-kata acak dan gabungkan menjadi string acak yang tidak beraturan
    const randomWords = words.sort(() => Math.random() - 0.5).slice(0, 5).join(' ');

    // Buat embed untuk memulai game
    const embedStart = new EmbedBuilder()
      .setColor('#00bfff')
      .setTitle('🏁 Speed Type Challenge!')
      .setDescription(`Tulis ulang kata-kata berikut dengan benar dan cepat: **${randomWords}**`)
      .setFooter({ text: 'Ketik secepat mungkin!', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    // Kirim embed ke channel
    await message.channel.send({ embeds: [embedStart] });

    // Mulai mendeteksi siapa yang mengetik kata dengan benar dan tercepat
    const startTime = Date.now();

    // Filter untuk memeriksa apakah pesan sesuai
    const filter = (msg) => msg.author.id !== message.client.user.id;

    const collector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 }); // Batas waktu 30 detik

    collector.on('collect', (msg) => {
      const timeTaken = (Date.now() - startTime) / 1000; // Hitung waktu dalam detik
      const userInput = msg.content.trim();
      const correctWords = randomWords.trim();

      // Hitung total karakter dan kata yang benar
      const totalCharacters = userInput.replace(/ /g, '').length; // Menghitung total karakter tanpa spasi
      const userWords = userInput.split(' '); // Pisahkan kata-kata yang diketik
      const correctWordCount = userWords.filter(word => correctWords.includes(word)).length; // Kata yang benar
      const incorrectWordCount = userWords.length - correctWordCount; // Kata yang salah
      const accuracy = (correctWordCount / userWords.length) * 100; // Ketepatan (%)

      // Perkiraan KPM (Kata per Menit)
      const kpm = (userWords.length / timeTaken) * 60;

      // Tentukan emoji berdasarkan ketepatan
      let emoji;
      if (accuracy === 100) {
        emoji = '🎉'; // Perfect!
      } else if (accuracy >= 80) {
        emoji = '👌'; // Good job!
      } else if (accuracy >= 50) {
        emoji = '😐'; // Could be better
      } else {
        emoji = '😔'; // Better luck next time
      }

      // Buat embed dengan emoji
      const embedWinner = new EmbedBuilder()
        .setColor(emoji === '🎉' ? '#00ff00' : '#ff0000') // Hijau untuk sempurna, merah untuk gagal
        .setTitle(`${emoji} Hasil Tantangan!`)
        .setDescription(`Selamat kepada ${msg.author} yang berhasil mengetik dengan **${accuracy.toFixed(2)}%** ketepatan dalam **${timeTaken.toFixed(2)} detik**!`)
        .addFields(
          { name: 'Kata yang diketik', value: randomWords },
          { name: 'Perkiraan KPM', value: `${kpm.toFixed(2)} KPM`, inline: true },
          { name: 'Total Karakter', value: `${totalCharacters} karakter`, inline: true },
          { name: 'Kata yang Benar', value: `${correctWordCount}`, inline: true },
          { name: 'Kata yang Salah', value: `${incorrectWordCount}`, inline: true }
        )
        .setFooter({ text: 'Metanoia Evolution | Speed Type Game', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();

      message.channel.send({ embeds: [embedWinner] });
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        const embedTimeout = new EmbedBuilder()
          .setColor('#ff0000')
          .setTitle('⏳ Waktu Habis!')
          .setDescription('Tidak ada yang berhasil mengetik kata dengan benar. 😔')
          .setFooter({ text: 'Metanoia Evolution | Speed Type Game', iconURL: message.client.user.displayAvatarURL() })
          .setTimestamp();

        message.channel.send({ embeds: [embedTimeout] });
      }
    });
  },
};

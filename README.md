# MetaEvo Bot
**Developer**: MaXx  
**Versi**: Beta

MetaEvo Bot adalah Discord bot yang dirancang untuk memberikan pengalaman server yang lebih interaktif dan responsif. Beberapa fitur utama dari bot ini termasuk pesan sambutan, pengecekan ping, laporan pengguna, setup otomatis, dan tes kecepatan mengetik.

## Fitur Utama
- Welcome Message: Mengirim pesan sambutan otomatis saat pengguna bergabung ke server.
- Cek Ping: Memeriksa waktu respon bot terhadap server.
= Report User: Memungkinkan pengguna melaporkan perilaku yang tidak diinginkan.
- Setup Auto: Menyediakan konfigurasi otomatis untuk setup channel dll (link masih dalam perbaikan)
- SpeedType Test: Tes kecepatan mengetik untuk pengguna.

## Persyaratan
- Node.js (versi 16.x atau lebih tinggi)
- Discord.js (versi 14.x atau lebih tinggi)
- Text Editor (misalnya, Visual Studio Code)
- Discord Developer Account

## Instalasi

### Langkah 1: Clone Repositori
Clone repositori ini ke mesin lokal Anda:

```bash
git clone https://github.com/username/MetaEvo-Bot.git
cd MetaEvo-Bot
```

## Langkah 2: Install Dependensi
Pastikan kamu memiliki Node.js terinstal. Kemudian, jalankan perintah berikut untuk menginstal dependensi yang diperlukan:

```bash
npm install
```

## Langkah 3: Mengatur Token dan Konfigurasi

### Token Bot Discord
- Buat bot di Discord Developer Portal, ambil token bot, dan simpan di file .env.
### Pengaturan Channel dan Server
- Buka file config.json dan atur channel-channel yang digunakan untuk fitur-fitur bot seperti welcome message, laporan, dll.

```json
{
  "welcomeChannelId": "ID_CHANNEL_SAMBUTAN",
  "reportChannelId": "ID_CHANNEL_LAPORAN",
  "speedTypeChannelId": "ID_CHANNEL_TES_TIPE",
  "prefix": "!"
}
```
Setelah selesai, pastikan file .env berisi token bot Discord Anda:

```makefile
DISCORD_TOKEN=your-bot-token-here
Langkah 4: Menjalankan Bot
Untuk menjalankan bot, gunakan perintah berikut:
```
```bash
node index.js
```
Jika semuanya diatur dengan benar, bot kamu akan online dan siap digunakan.

## COMMAND
- Gunakan `!ping` untuk mengecek ping bot.
- Gunakan `!setupdiscord` untuk konfigurasi otomatis.
- Gunakan `!Speedtype ` untuk melakukan tes kecepatan mengetik.
- Gunakan `!reportuser` untuk melaporkan perilaku buruk dari pengguna tertentu.

###Lisensi
Distributed under the MIT License. See LICENSE for more information.

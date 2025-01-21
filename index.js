// Memuat file .env
require('dotenv').config();

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // Intent untuk memantau anggota
    ]
});

// Ambil token dan prefix dari file .env
const token = process.env.DISCORD_TOKEN;
const prefix = process.env.PREFIX || '!';  // Jika tidak ada prefix di .env, gunakan default '!'

// Membuat koleksi untuk commands
client.commands = new Collection();

// Membaca semua file di folder commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Meload command dari folder commands
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.name && typeof command.execute === 'function') {
        client.commands.set(command.name, command);
    } else {
        console.log(`[WARNING] Command ${file} tidak memiliki properti 'name' atau 'execute'.`);
    }
}

// Memuat file interactives/welcomer.js
const welcomer = require('./interactions/welcomer');
welcomer.execute(client); // Menjalankan welcomer saat bot online

client.once('ready', () => {
    console.log('Bot is online!');
    // Mengatur status aktivitas bot
    client.user.setPresence({
        activities: [{ name: ' commands', type: 2 }],
        status: 'online',
    });
    client.on('messageCreate', (message) => {
      if (message.content === '!guildid') {
        message.reply(`Guild ID: ${message.guild.id}`);
      }
    });
    
});

// Event listener untuk message (prefix commands)
client.on('messageCreate', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('Ada kesalahan saat mengeksekusi command!');
    }
    process.on('unhandledRejection', (error) => {
        console.error('Unhandled promise rejection:', error);
        // Kamu bisa juga mengirim pesan kesalahan ke channel tertentu jika diinginkan
      });
      
});

client.login(token);

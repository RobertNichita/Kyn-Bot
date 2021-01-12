const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client();

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {

    console.log(`Logged in as ${client.user.tag}`);
});

client.on('message', message => {

    if (message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(' ');
    const cmd = args.shift().toLowerCase();

    if (!client.commands.has(cmd)) return;

    try {
        client.commands.get(cmd).execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply("There was an error running that command! So sorry!");
    }
});

console.log("Starting up");
client.login(config.token);

module.exports = {client};
const fs = require('fs');
require('dotenv').config();
const Discord = require('discord.js');
const { commandDir } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const _loadDir = (dir = commandDir) => {
    const files = fs.readdirSync(dir);
    const commandFiles = [];
    files.forEach((file) => {
        const filepath = `${dir}/${file}`;
        if (fs.statSync(filepath).isDirectory()) {
            commandFiles.push(..._loadDir(filepath));
        } else {
            if (filepath.endsWith('.js')) {
                commandFiles.push(`${dir}/${file}`);
            }
        }
    });

    return commandFiles;
};

const installCommands = () => {
    const commandFiles = _loadDir();

    for (const file of commandFiles) {
        const command = require(file);
        client.commands.set(command.name, command);
    }
};

installCommands();

client.on('ready', () => {
    console.log('ayy connected');
});

client.on('message', (message) => {
    if (message.author.bot) return;

    const args = message.content.split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(process.env.DISCORD_TOKEN);

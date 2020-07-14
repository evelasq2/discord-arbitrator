const fs = require('fs');
require('dotenv').config();
const Discord = require('discord.js');
const { commandDirs } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const _loadDir = (dir) => {
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

const _installDir = (commandFiles) => {
    const commandModule = new Discord.Collection();
    for (const file of commandFiles) {
        const command = require(file);
        commandModule.set(command.name, command);
    }

    return commandModule;
};

const installCommands = () => {
    const commandModules = {};
    for (const dir of commandDirs) {
        commandModules[dir.prefix] = _installDir(_loadDir(dir.location));
    }

    return commandModules;
};

const _findModule = (messageText, commandModules) => {
    for (const [prefix, commands] of Object.entries(commandModules)) {
        if (messageText.startsWith(prefix)) return { prefix, commands };
    }

    return false;
};

const commandModules = installCommands();

client.on('ready', () => {
    console.log('ayy connected');
});

client.on('message', (message) => {
    const commandModule = _findModule(message.content, commandModules);
    if (message.author.bot || !commandModule) return;
    const { prefix, commands } = commandModule;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!commands.has(commandName)) return;

    const command =
        commands.get(commandName) ||
        commands.find(
            (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
        );

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(process.env.DISCORD_TOKEN);

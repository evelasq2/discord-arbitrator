const fs = require('fs');
require('dotenv').config();
const Discord = require('discord.js');
const { commandDirs } = require('./config.json');

const client = new Discord.Client();

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

    commandModules[`findModule`] = function (messageText) {
        for (const [prefix, commands] of Object.entries(this)) {
            if (messageText.startsWith(prefix)) return { prefix, commands };
        }

        return false;
    };

    return commandModules;
};

client.commandModules = installCommands();

console.log(client);

client.on('ready', () => {
    console.log('ayy connected');
});

client.on('message', (message) => {
    const cm = client.commandModules;
    const commandModule = cm.findModule(message.content);
    if (message.author.bot || !commandModule) return;
    const { prefix, commands } = commandModule;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command =
        commands.get(commandName) ||
        commands.find(
            (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
        );

    if (!command) return;

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(process.env.DISCORD_TOKEN);

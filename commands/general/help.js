_getCommandInfo = (command, prefix) => {
    return `${prefix}${command.name} ${command.usage || ''} ${
        command.description || ''
    }`;
};

module.exports = {
    name: 'help',
    description: 'List all commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const modules = message.client.commandModules;

        // help
        if (!args.length) {
            prefixes = Object.keys(modules);
            data.push(
                'Use !help [prefix] to list all available commands under that prefix.'
            );
            data.push(`\nAvailable prefixes: ` + prefixes.join(' '));

            return message.channel.send(data);
        }

        // help <prefix>
        const query = args[0].toLowerCase();
        if (query in modules) {
            const commands = modules[query];
            data.push(`commands under ${query}:`);
            data.push(
                commands
                    .map((command) => _getCommandInfo(command, query))
                    .join('\n')
            );
            return message.channel.send(data);
        }

        // help <command>
        else {
            const commandModule = modules.findModule(query);
            if (!commandModule)
                return message.channel.send(
                    `${query} is not a valid command! Maybe you have the wrong prefix?`
                );
            console.log(commandModule);
            const { prefix, commands } = commandModule;

            const args = query.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command =
                commands.get(commandName) ||
                commands.find(
                    (c) => c.aliases && c.aliases.includes(commandName)
                );

            if (!command)
                return message.channel.send(
                    `${query} is not a valid command! Maybe you have the wrong prefix?`
                );

            data.push(`**Name:** ${command.name}`);
            if (command.aliases)
                data.push(`**Aliases:** ${command.aliases.join(', ')}`);
            if (command.description)
                data.push(`**Description:** ${command.description}`);
            if (command.usage)
                data.push(
                    `**Usage:** ${prefix}${command.name} ${command.usage}`
                );
            // data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);
            return message.channel.send(data, { split: true });
        }
    },
};

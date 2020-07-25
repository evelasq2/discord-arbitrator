module.exports = {
    name: 'echo',
    description: 'says what you said',
    usage: '[anything]',
    args: true,
    aliases: ['repeat'],
    execute(message, args) {
        message.channel.send(args.join(' '));
    },
};

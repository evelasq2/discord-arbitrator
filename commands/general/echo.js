module.exports = {
    name: 'echo',
    description: 'responds with input message minus !echo part',
    usage: '!echo [anything]',
    execute(message, args) {
        message.channel.send(message.content.replace('!echo', ''));
    },
};

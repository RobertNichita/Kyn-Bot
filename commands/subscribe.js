const fs = require('fs');
const schedule = require('node-schedule');
const utils = require('./../utils');
const { hasDuplicates } = require('./../utils');

module.exports = {
    name: 'subscribe',
    description: 'Has a command run at a specific time, in a specific channel',
    execute(client, message, args) {

        const serverID = message.channel.guild.id;
        const channelID = message.channel.id;
        const time = args.shift()
        const command = args.shift()

        if (time < 0 || time > 24) {
            message.channel.send("Please enter a time between 0 (12AM) and 23(12PM)");
            return;
        }

        let cmdFile = require(`./${command}`);
        if (! ('executeSubscribe' in cmdFile)) {
            message.channel.send("You cannot subscribe to that command.");
            return;
        }

        subscribeObject = { server: serverID, channel: channelID, time: time, command: command, args: args.join(' ')}

        let json = JSON.parse(fs.readFileSync('./subscriptions.json'));

        if (!utils.includes(json.subs, subscribeObject)) {
            message.channel.send("Already subscribed!")
            return;
        }

        json.subs.push(subscribeObject);
        fs.writeFileSync('./subscriptions.json', JSON.stringify(json));

        this.loadSubscriptions(client, [subscribeObject]);

        message.channel.send("Successfully subscribed!");
    },
    loadSubscriptions(client, subscriptions) {

        console.log(`Loading ${subscriptions.length} subscriptions`)

        subscriptions.forEach(sub => {

            client.channels.fetch(sub.channel)
                .then(channel =>{
                    schedule.scheduleJob(`* ${sub.time} * * * *`, () => {
                        client.commands.get(sub.command).executeSubscribe(client, channel, sub.args);
                    });
                })
                .catch(console.error);
        });
    }
}
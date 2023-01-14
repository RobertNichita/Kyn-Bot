
import { dirname, importx } from '@discordx/importer';
import { Events, IntentsBitField, Interaction, Message } from 'discord.js';
import { Client } from 'discordx';
import * as dotenv from 'dotenv';
dotenv.config();

const twitterRegex = /https:\/\/twitter\.com\/([-a-zA-Z0-9()@:%_+.~#?&//=]{1,512})/;

const env = process.env.NODE_ENV || 'dev';

async function main() {
    
    const bot = new Client({
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMessageReactions,
            IntentsBitField.Flags.GuildVoiceStates,
        ],
        silent: false
    });
    
    bot.once(Events.ClientReady, async() => {
    
        await bot.guilds.fetch();

        if (env === 'dev') await bot.clearApplicationCommands();

        await bot.initApplicationCommands();
    
        console.log('Kyn-Bot Ready!');
    });
    
    bot.on(Events.InteractionCreate, (interaction: Interaction) => {

        if (interaction.isButton() || interaction.isSelectMenu()) {
            if (interaction.customId.startsWith("discordx@pagination@")) {
              return;
            }
          }

        bot.executeInteraction(interaction);
    });
    
    bot.on(Events.MessageCreate, (message : Message) => {
        const originalContent = message.content;
        const query = message.content.match(twitterRegex);
        if(query){
            message.edit(`https://www.fxtwitter.com/${query[1]}`)
            .then(msg => console.log(`Rewrote twitter link ${originalContent} to fxtwitter link ${msg.content}`))
            .catch(console.error);
        }
        bot.executeCommand(message);
    });

    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    if (!process.env.BOT_TOKEN) {
        throw Error("Couldn't Find BOT_TOKEN in env.");
    }

    await (bot.login(process.env.BOT_TOKEN));
}

main();

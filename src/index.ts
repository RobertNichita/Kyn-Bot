
import { dirname, importx } from '@discordx/importer';
import { Events, IntentsBitField, Interaction, Message } from 'discord.js';
import { Client } from 'discordx';
import * as dotenv from 'dotenv';
import fxtwitterRewrite from './events/fxtwitter.js';
dotenv.config();


// const env = process.env.NODE_ENV || 'dev';

async function main() {
    
    const bot = new Client({
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMessageReactions,
            IntentsBitField.Flags.GuildVoiceStates,
            IntentsBitField.Flags.MessageContent
        ],
        silent: false
    });
    
    bot.once(Events.ClientReady, async() => {
    
        await bot.guilds.fetch();

        // if (env === 'dev') await bot.clearApplicationCommands();

        // await bot.initApplicationCommands();
    
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
        // ignore messages from bots
        if(message.author.bot) return;   

        bot.executeCommand(message);

        fxtwitterRewrite(message, bot);

    });



    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    if (!process.env.BOT_TOKEN) {
        throw Error("Couldn't Find BOT_TOKEN in env.");
    }

    await (bot.login(process.env.BOT_TOKEN));
}

main();

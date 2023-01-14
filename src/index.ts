
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
    
    /*
    * rewrites all twitter URLS in a message to fxtwitter URLs
    * 
    * @param MessageContent: string
    * 
    * @returns the message with all twitter URLs rewritten to fxtwitter URLs
    * 
    * e.g.
    * "The first twitter link is https://twitter.com/LeagueOfLegends/status/1614028829823209472?s=20 
    *  and the second one is https://twitter.com/Legs/status/1614028829823209472 
    *  lorem https://twitter.com/Legoland/status/1614028829823209472 ipsum"
    *  =>
    *  "The first twitter link is https://fxtwitter.com/LeagueOfLegends/status/1614028829823209472?s=20 
    *  and the second one is https://fxtwitter.com/Legs/status/1614028829823209472 
    *  lorem https://fxtwitter.com/Legoland/status/1614028829823209472 ipsum"
    */
    const rewriteTwitterUrls = (MessageContent: string) => {
        //find all twitter URLs
        const matches = [...MessageContent.matchAll(twitterRegex)];
        // this reducer will not append the part of the message past the last twitter URL
        const partial = matches.reduce((accumulator, curMatch, matchIndex) => {
                return accumulator + 
                /*subtract 2 from the accumulator length for each match 
                * since we are adding 2 characters 'fx' for each match
                * to match the correct position in the original message */
                MessageContent.substring(accumulator.length - 2*(matchIndex), curMatch.index) + 
                `https://fxtwitter.com/${curMatch[1]}`;
        },"");
        //append the rest of the message
        return partial + MessageContent.substring(partial.length - matches.length * 2,MessageContent.length);
    };

    bot.on(Events.MessageCreate, (message : Message) => {
        bot.executeCommand(message);
        //only rewrite messages after in case it would affect commands
        const originalContent = message.content;
        const hasTwitterUrl = twitterRegex.test(originalContent);
        if(hasTwitterUrl){
            message.edit(rewriteTwitterUrls(message.content))
            .then(msg => console.log(`Rewrote message with twitter link ${originalContent} to message with fxtwitter link ${msg.content}`))
            .catch(console.error);
        }
    });



    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    if (!process.env.BOT_TOKEN) {
        throw Error("Couldn't Find BOT_TOKEN in env.");
    }

    await (bot.login(process.env.BOT_TOKEN));
}

main();

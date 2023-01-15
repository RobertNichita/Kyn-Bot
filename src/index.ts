
import { dirname, importx } from '@discordx/importer';
import { Events, IntentsBitField, Interaction, Message, Channel } from 'discord.js';
import { Client } from 'discordx';
import * as dotenv from 'dotenv';
dotenv.config();

const twitterRegex = /https:\/\/twitter\.com/;

const env = process.env.NODE_ENV || 'dev';

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
        // ignore messages from bots
        if(message.author.bot) return;   

        bot.executeCommand(message);

        //only rewrite messages after in case it would affect commands
        const originalContent = message.content;
        const hasTwitterUrl = twitterRegex.test(originalContent);
        if(hasTwitterUrl){
            const channel:Channel|undefined = bot.channels.cache.get(message.channelId);
            if(channel && (channel?.isTextBased() || channel?.isThread())){
                channel.send({content: `Posted by user <@${message.author.id}>\n` + originalContent.split('https://twitter.com').join("https://fxtwitter.com")})
                .then((msg:Message) => {
                    if(message.deletable){
                        message.delete();
                        console.log(`deleted message ${originalContent} from user ${message.author.username}`);
                    }else{
                        console.log(`could not delete message ${originalContent} from user ${message.author.username}`);
                    }
                    console.log(`Rewrote message with twitter link ${originalContent} to message with fxtwitter link ${msg.content}`);})
                .catch(console.error);
            }
        }

    });



    await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

    if (!process.env.BOT_TOKEN) {
        throw Error("Couldn't Find BOT_TOKEN in env.");
    }

    await (bot.login(process.env.BOT_TOKEN));
}

main();

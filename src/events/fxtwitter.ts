import { Client, Message, Channel } from "discord.js";

const twitterRegex = /https:\/\/twitter\.com/;
       
const fxtwitterRewrite = (message:Message, bot:Client) => {
        const originalContent = message.content;
        const hasTwitterUrl = twitterRegex.test(originalContent);

        if(hasTwitterUrl){
            const channel:Channel|undefined = bot.channels.cache.get(message.channelId);

            if(channel && (channel?.isTextBased() || channel?.isThread())){
                channel.send({content: `Posted by user <@${message.author.id}>\n` + originalContent.split('https://twitter.com').join("https://fxtwitter.com")})
                .then((msg:Message) => {

                    if(message.deletable){
                        message.delete();
                        console.debug(`deleted message ${originalContent} from user ${message.author.username}`);
                    }else{
                        console.debug(`could not delete message ${originalContent} from user ${message.author.username}`);
                    }
                    console.debug(`Rewrote message with twitter link ${originalContent} to message with fxtwitter link ${msg.content}`);})
                .catch(console.error);
            }
        }
};

export default fxtwitterRewrite;
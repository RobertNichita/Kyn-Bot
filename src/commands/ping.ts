
import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";

@Discord()
export class Ping {

    @Slash({
        description: "Pong!",
        name: "ping"
    })
    async execute(interaction: CommandInteraction): Promise<void> {

        await interaction.reply({ content: "pong!", ephemeral: true });
    }
}
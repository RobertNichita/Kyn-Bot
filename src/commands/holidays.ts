
import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import fetch from 'node-fetch';

type APIResponse = {
    day: number,
    month: number,
    holidays: string[]
}

@Discord()
export class Holidays {

    @Slash({
        description: "Gets the current holidays for today or a specified day",
        name: "holidays"
    })
    async execute(
        @SlashOption({
            description: "Day of the week to get",
            name: "day",
            required: false,
            type: ApplicationCommandOptionType.Integer
        }) day: number | undefined,
        @SlashOption({
            description: "Month of the year",
            name: "month",
            required: false,
            type: ApplicationCommandOptionType.Integer
        }) month: number | undefined,
        interaction: CommandInteraction): Promise<void> {

        const gotDay = day !== undefined;
        const gotMonth = month !== undefined;

        await interaction.deferReply();

        if (gotDay && !gotMonth || !gotDay && gotMonth) {
            await interaction.followUp({ content: 'Both year and month must be provided' });
            return;
        }

        const path = (!gotDay && !gotMonth) ? 'today' : `date/${month}/${day}`;
        const data = await this.getResult(path);
        console.debug(data);
        const msg = `**Holidays for ${data.day}/${data.month}**\n${data.holidays.map(s => `• ${s}`).join('\n')}`;
        await interaction.followUp(msg);
    }

    private async getResult(path: string): Promise<APIResponse> {

        const res = await fetch(`https://national-api-day.herokuapp.com/api/${path}`);
        const data = await res.json() as APIResponse;

        return data;
    }
}
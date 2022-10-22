
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
            await interaction.followUp({ content: 'Both day and month must be provided' });
            return;
        }

        const name = this.getDateName(day, month);

        if (name === undefined) {
            await interaction.followUp({ content: `${month}/${day} is not a valid date` })
            return;
        }

        const path = (!gotDay && !gotMonth) ? 'today' : `date/${month}/${day}`;
        const data = await this.getResult(path);

        if (!data || !data.holidays) {
            await interaction.followUp({ content: `No holidays found for ${name}` });
            return;
        }

        const msg = `**Holidays for ${name}**\n${data.holidays.map(s => `• ${s}`).join('\n')}`;
        await interaction.followUp(msg);
    }

    private getDateName(month: number | undefined, day: number | undefined): string | undefined {
        // Get current date
        if (month === undefined || day === undefined) {
            const today = new Date();
            
            month = today.getMonth() + 1;
            day = today.getDate();
        }

        if (month < 1 || month > 12 || day < 1)
            return undefined;
        
        // Validate day is in month
        switch (month) {
            case 4:
            case 6:
            case 9:
            case 11:
                if (day > 30)
                    return undefined;
                break;
            case 2:
                if (day > 29)
                    return undefined;
                break;
            default:
                if (day > 31)
                    return undefined;
                break;
        }

        // Get name of date
        const monthName = new Date(2000, month - 1, 10).toLocaleString('default', { month: 'long' });
        let dayEnding;

        switch (day % 10) {
            case 1:
                dayEnding = "st";
                break;
            case 2:
                dayEnding = "nd";
                break;
            case 3:
                dayEnding = "rd";
                break;
            default:
                dayEnding = "th";
                break;
        }
        
        return `${monthName} ${day}${dayEnding}`;
    }

    private async getResult(path: string): Promise<APIResponse | undefined> {
        try {
            return await fetch(`https://national-api-day.herokuapp.com/api/${path}`).then(res => res.json()) as APIResponse;
        } catch (e) {
            return undefined;
        }
    }
}
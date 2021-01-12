const axios = require("axios");
const cheerio = require("cheerio");
const url = 'https://www.gocomics.com/garfield/' // followed by YYYY/MM/DD

module.exports = {
    name: 'garfield',
    description: 'Gets the latest garfield',
    async executeSubscribe(client, channel, args) {
        let date = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
        let image = await this.fetchImg(date);
        channel.send({files: [image]});
    },
    async execute(client, message, args) {
        let date = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
        let image = await this.fetchImg(date);
        message.channel.send({files: [image]});
    },
    async fetchImg(date) {
        

        const result = await axios.get(`${url}${date}`);
        const $ = cheerio.load(result.data); 
        imgEl = $('div[data-feature-type=comic] > div.comic__wrapper > div.comic__container > div > a > picture > img');
        if (imgEl.attr('src') == undefined) {
            date = new Date(Date.now() - 8640000).toISOString().slice(0, 10).replace(/-/g, '/');            // 8640000 is one day in seconds
            return this.fetchImg(date);
        };
        return `${imgEl.attr('src')}.png`;
    }
}
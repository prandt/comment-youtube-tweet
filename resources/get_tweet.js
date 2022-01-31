const needle = require('needle');
const { userName, hashTag } = require('../config.json')
require('dotenv/config')

const params = `query=from%3A${userName}%20${hashTag}&expansions=author_id&tweet.fields=entities`
const endpointURL = `https://api.twitter.com/2/tweets/search/recent?${params}`;

const token = process.env.TOKEN;

async function get_tweet() {

    const tweet = await makeRequest()

    async function getRequest() {

        const res = await needle('get', endpointURL, {
            headers: {
                "User-Agent": "v2RecentSearchJS",
                "authorization": `Bearer ${token}`
            }
        })

        if (res.body) {
            return res.body
        }

    }

    function extractText(response, value) {
        // tweets valídos (não foram utilizados) e quem contem apenas hashtag-link-texto
        // 
        const phrases = response.data[value].text.split(" ")
        const linkVideo = response.data[value].entities.urls[0].expanded_url.split("=")[1]

        let comment = "";
        for (const text in phrases) {
            if (text > 1) {
                comment += parseInt(text) === phrases.length - 1 ? phrases[text] + "" : phrases[text] + " "
            }
        }
        return {
            comment: comment,
            linkVideo: linkVideo
        }
    }

    async function makeRequest() {
        try {
            const response = await getRequest();
            return extractText(response, 0)

        } catch (e) {
            console.log(e);
        }
    }
    return tweet;
}

module.exports = get_tweet









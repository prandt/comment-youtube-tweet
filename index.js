const youtube_comment = require('./resources/youtube_comment')
const get_tweet = require('./resources/get_tweet')

async function start(){

    const tweet = await get_tweet()
    console.log(tweet)
    //await youtube_comment("Segundo comentario sem channelID teste",  "64GL2h5kimY")

}

start()
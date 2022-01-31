const express = require("express")
const google = require('googleapis').google
const OAuth2 = google.auth.OAuth2
const youtube = google.youtube({version: 'v3'})

async function youtube_comment(comment, videoId) {

    await authenticateWithOAuth()
    await sendComment(comment, videoId)

    async function authenticateWithOAuth() {
        const webServer = await startWebServer()
        const OAuthClient = await createOAuthClient()
        requestUserConsent(OAuthClient)
        const authorizationToken = await waitForGoogleCallBack(webServer)
        requestGoogleForAcessTokens(OAuthClient, authorizationToken)
        setGlobalGoogleAuthentication(OAuthClient)
        await stopWebServer(webServer)

        async function startWebServer(){
            return new Promise((resolve, reject) => {
                const port = 5000
                const app = express()

                const server = app.listen(port, () => {
                    console.log(`> Listening on http://localhost:${port}`)

                    resolve({
                        app,
                        server
                    })
                })
            })
        }

        async function createOAuthClient(){
            const credentials = require('../credentials/google-youtube.json')

            const OAuthClient = new OAuth2(
                credentials.web.client_id,
                credentials.web.client_secret,
                credentials.web.redirect_uris[0]
            )

            return OAuthClient
        }
        function requestUserConsent(OAuthClient){
            const consentUrl = OAuthClient.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube.force-ssl']
            })

            console.log(`> Please give your consent: ${consentUrl}`)
        }
        async function waitForGoogleCallBack(webServer){
            return new Promise((resolve, reject) => {
                console.log('> Waiting for user consent...')

                webServer.app.get('/oathucallback', (req, res) => {
                    const authCode = req.query.code
                    res.send('<h1>Thank you!</h1><p>Now close this tab</p>')
                    resolve(authCode)
                })
            })
        }

        function requestGoogleForAcessTokens(OAuthClient, authorizationToken){
            return new Promise((resolve, reject) => {
                OAuthClient.getToken(authorizationToken, (error, tokens) => {
                    if(error){
                        return reject(error)
                    }

                    OAuthClient.setCredentials(tokens)
                    resolve()
                })
            })
        }

        function setGlobalGoogleAuthentication(OAuthClient){
            google.options({
                auth: OAuthClient
            })
        }

        async function stopWebServer(){
            return new Promise((resolve, reject) => {
                webServer.server.close(() => {
                    resolve()
                })
            })
        }
    }

    async function sendComment(comment, videoId){
      const requestParams = {
          part: 'snippet',
          requestBody: {
            snippet: {
                videoId: videoId,
                topLevelComment: {
                    snippet: {
                      textOriginal: comment
                    }
                  }
              }
          }
      }

    await youtube.commentThreads.insert(requestParams).then(
          function(res){
            console.log(res)
          }, function(error){
              console.error("Send comment error",error)
          }
      )
      

    }
}

module.exports = youtube_comment
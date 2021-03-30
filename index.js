const Discord = require('discord.js')
const client = new Discord.Client()

require('dotenv').config()
const { TOKEN: token, VOICE_CHANNEL: vcId } = process.env

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.login(token)

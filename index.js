const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()

require('dotenv').config()
const { TOKEN: token, VOICE_CHANNEL: vcId } = process.env

const USER_ID_PATH = './data_users.txt'
const userIds = new Set(
  (() => {
    try {
      return fs.readFileSync(USER_ID_PATH, 'utf8')
    } catch {
      return ''
    }
  })()
    .split(/\r?\n/)
    .map(entry => entry.split('=')[0].trim())
    .filter(userId => userId)
)
const userIdStream = fs.createWriteStream(USER_ID_PATH, { flags: 'a' })

let lastTime = Date.now()
function displayDuration (milliseconds) {
  const seconds = (milliseconds / 1000 % 60).toFixed(3)
  const minutes = Math.floor(milliseconds / 60000)
  const hours = Math.floor(milliseconds / 60000)
  if (milliseconds < 60000) {
    return `${seconds} seconds`
  } else if (hours === 0) {
    return `${minutes}:${seconds}`
  } else {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds}`
  }
}

client.on('ready', () => {
  console.log(`I, ${client.user.tag}, am present!.`)
})

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.channelID === vcId) {
    if (!userIds.has(newState.member.id)) {
      const now = Date.now()
      const elapsed = now - lastTime
      lastTime = now

      userIds.add(newState.member.id)
      userIdStream.write(`${newState.member.id}=${now - lastTime}\n`)

      console.log(newState.member.user.tag, displayDuration(now - lastTime))
    }
  }
})

client.on('message', message => {
  if (message.author.bot) return
  if (message.content === '😷 last touch') {
    message.channel.send('', {
      embed: {
        description: `AQI hasn't been touched for ${displayDuration(Date.now() - lastTime)}.`,
        timestamp: new Date(lastTime).toISOString()
      }
    })
  }
})

client.login(token)

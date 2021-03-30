const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()

require('dotenv').config()
const {
  VOICE_CHANNEL: vcId,
  LOG_CHANNEL: logId,
  NAME: channelName,
  TOKEN: token
} = process.env

const phrases = [
  'lol',
  'epic',
  'powerful',
  'porque',
  'hmm',
  'mr little',
  'owo',
  'uwu',
  'oof',
  'oop',
  '\u{1fac2}', // :people_hugging:
  '<:lemonthink:741411636111343657>',
  '<:ghosthug:825908534918774794>',
  'ass',
  'i-',
  'power',
  'oh',
  'big brain',
  'uau',
  '<:blobheart:794473653868953651>',
  '<:scremwoke:711636407499882559>',
  [] + {},
  // Add "scary" a few times just to be safe
  'scary',
  'scary',
  'scary',
  'scary',
  'scary'
]
const phrases2 = [
  'Now I have to reset the timer.',
  'I have just reset the timer.',
  'The timer has been reset.',
  'I shall reset the timer now.',
  'Timer has been of the resettings.'
]
function random (phrases) {
  return phrases[Math.floor(Math.random() * phrases.length)]
}

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
  const hours = Math.floor(milliseconds / 60000 / 60)
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
  if (!client.channels.cache.has(logId)) {
    throw new Error(`I don't have access to <#${logId}>.`)
  }
})

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.channelID === vcId) {
    if (!userIds.has(newState.member.id)) {
      const now = Date.now()
      const elapsed = now - lastTime
      lastTime = now

      userIds.add(newState.member.id)
      userIdStream.write(`${newState.member.id}=${now - lastTime}\n`)

      // TODO: Give roles?
      client.channels.cache.get(logId).send(
        `<@${newState.member.id}> ${random(phrases)}`,
        {
          embed: {
            description: `${channelName} hadn't been touched for ${displayDuration(elapsed)}! ${random(phrases2)}`
          }
        }
      )
    }
  }
})

client.on('message', message => {
  if (message.author.bot) return
  if (message.content === '😷 last touch' || message.content === '😷 last touched') {
    message.channel.send('', {
      embed: {
        description: `${channelName} hasn't been touched for ${displayDuration(Date.now() - lastTime)}.`,
        timestamp: new Date(lastTime).toISOString()
      }
    })
  }
})

client.login(token)

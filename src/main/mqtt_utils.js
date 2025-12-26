import mqtt from 'mqtt'
import AES from './AES.js'
import AESTest from './AESTest.js'
import { sendToRenderer } from './index.js'

let client = null
let secret = null

export const connectMqtt = (data) => {
  secret = Buffer.from(data.secret.replace(/-/g, ''), 'utf8')
  console.log(data.secret.replace(/-/g, ''))
  // AES.useAes256(true)
  console.log('Connecting to MQTT broker with data:', data)
  console.log('Using secret:', secret)
  client = mqtt.connect(import.meta.env.VITE_APP_IM_MQTT_URL, {
    clientId: data.clientId,
    username: data.userId,
    password: data.token,

    protocolVersion: 4, // ✅ MQTT 3.1.1
    keepalive: 60,
    clean: true
  })
  client.on('connect', () => {
    console.log('connected to MQTT broker')
  })
  client.on('message', (topic, message) => {
    console.log('message:', topic, message.length, message)
    const decrypted = AES.AESDecrypt(message, secret, false, [false])
    sendToRenderer('mqtt', {
      topic: topic,
      message: decrypted
    })
  })
  client.on('reconnect', () => {
    console.log('reconnecting to MQTT broker')
  })

  client.on('close', () => {
    console.log('MQTT connection closed')
  })

  client.on('error', (err) => {
    console.error('MQTT error:', err.message)
  })
}

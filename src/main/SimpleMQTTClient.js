import mqtt from 'mqtt'
import { sendToRenderer } from './index.js'

export class SimpleMQTTClient {
  constructor({ url, clientId, userId, token }) {
    this.url = url
    this.clientId = clientId
    this.userId = userId
    this.token = token
    this.client = null
    this.messageListeners = new Set()
  }

  connect() {
    this.client = mqtt.connect(this.url, {
      clientId: this.clientId,
      username: this.userId,
      password: this.token,
      protocolVersion: 4,
      keepalive: 60,
      clean: true
    })

    this.client.on('connect', () => {
      console.log('[MQTT] connected')
    })

    this.client.on('message', (topic, message) => {
      sendToRenderer('mqtt-message', { topic })
    })

    this.client.on('error', (err) => {
      console.error('[MQTT] error', err)
    })
    this.client.on('close', () => {
      console.log('[MQTT] connection closed')
    })
    this.client.on('reconnect', () => {
      console.log('[MQTT] reconnecting...')
    })
  }
}

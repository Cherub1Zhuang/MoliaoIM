import mqtt from 'mqtt'
import { sendToRenderer } from './index.js'
import protobuf from 'protobufjs'
import path from 'path'
import { is } from '@electron-toolkit/utils'
const protoPath = is.dev
  ? path.join(process.cwd(), 'resources', 'wfcmessage_community.proto') // ← 开发模式 DLL 跟 main.js 一起放
  : path.join(process.resourcesPath, 'wfcmessage_community.proto')

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

    this.client.on('message', async (topic, message) => {
      let decoded = null
      try {
        const root = await protobuf.load(protoPath)
        const PushMessage = root.lookupType('cn.wildfirechat.proto.NotifyMessage')
        decoded = PushMessage.decode(message)
        console.log('decoded:', decoded)
      } catch (e) {
        console.log('❌ protobuf decode失败:', e)
      }
      sendToRenderer('mqtt-message', { topic, decoded })
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

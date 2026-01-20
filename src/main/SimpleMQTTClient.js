import mqtt from 'mqtt'
import { sendToRenderer } from './index.js'
import protobuf from 'protobufjs'

function extractJsonFromBuffer(buf) {
  // 扫描字节 0x7b '{' 或 0x5b '['
  let start = -1
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x7b || buf[i] === 0x5b) {
      start = i
      break
    }
  }
  if (start === -1) return null

  const text = buf.subarray(start).toString('utf8')

  // 防止后面还有别的字段混进来：尝试只取到最后一个 } 或 ]
  const lastObj = text.lastIndexOf('}')
  const lastArr = text.lastIndexOf(']')
  const end = Math.max(lastObj, lastArr)
  if (end === -1) return null

  const jsonStr = text.slice(0, end + 1)
  return JSON.parse(jsonStr)
}

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
        const root = await protobuf.load(
          'C:\\Users\\Admin\\Desktop\\IM\\app\\src\\main\\wfcmessage_community.proto'
        )
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

import { SimpleMQTTClient } from './SimpleMQTTClient.js'

let client = null
export const connectMqtt = async (data) => {
  client = new SimpleMQTTClient({
    url: import.meta.env.VITE_APP_IM_MQTT_URL,
    clientId: data.clientId,
    userId: data.userId,
    token: data.token
  })
  client.connect()
}

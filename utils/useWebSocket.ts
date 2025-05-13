import { ref } from 'vue'

let socket: WebSocket | null = null
const lastMessage = ref(null)

export const useWebSocket = () => {
  const connect = () => {
    if (!import.meta.client) return

    const config = useRuntimeConfig().public
    socket = new WebSocket(config.web_socket_url)

    socket.onopen = () => {
      console.log("WebSocket connected")
    }

    socket.onmessage = (event) => {
      try {
        lastMessage.value = JSON.parse(event.data)
        console.log("Message from Lambda:", lastMessage.value)
      } catch (e) {
        console.error("Invalid WebSocket JSON", e)
      }
    }

    socket.onerror = (error) => {
      console.error("WebSocket error:", error)
    }

    socket.onclose = () => {
      console.log("WebSocket disconnected")
    }
  }

  const disconnect = () => {
    if (!import.meta.client) return
    socket?.close()
    socket = null
  }

  return { connect, disconnect, lastMessage }
}

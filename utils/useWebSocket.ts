import { ref } from 'vue'

let socket: WebSocket | null = null
const lastMessage = ref(null)

export const useWebSocket = () => {
  const connect = () => {
    const config = useRuntimeConfig().public;
    socket = new WebSocket(`${config.web_socket_url}`)

    socket.onopen = () => {
      console.log("WebSocket connected")
    }

    socket.onmessage = (event) => {
      console.log("Message from Lambda:", event.data)
      try {
        lastMessage.value = JSON.parse(event.data) 
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
    socket?.close()
    socket = null
  }

  return { connect, disconnect, lastMessage }
}

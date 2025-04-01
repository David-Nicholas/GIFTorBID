<template>
    <Navbar/>
    <div>
        <slot />
    </div>
</template>

<script>
import { onMounted } from 'vue'
import { useWebSocket } from '~/utils/useWebSocket'

export default {
  setup() {
    const { connect } = useWebSocket()

    onMounted(() => {
      connect()
    })
    
  }
}
</script>

<style>
</style>

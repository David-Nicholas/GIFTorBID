<template>
    <template v-if="showNotification">
        <UAlert class="container"
            icon="i-heroicons-command-line"
            color="white"
            variant="solid"
            :description="description"
        />
    </template>
</template>

<script>
import { ref, watch } from 'vue';

export default {
    name: 'WarnMessage',
    props: {
        description: {
            type: String,
            required: true,
        },
        timeout: {
            type: Number,
            default: 10000, 
        },
    },
    setup(props) {
        const showNotification = ref(true);
        watch(
            () => props.description,
            () => {
                if (props.description) {
                    showNotification.value = true;
                    setTimeout(() => {
                        showNotification.value = false;
                    }, props.timeout);
                }
            },
            { immediate: true }
        );

        return {
            showNotification,
        };
    },
};
</script>

<style scoped>
.container {
  border: 1.5px solid #8e8d8d; 
  border-radius: 0;
  margin-bottom: 16px; 
  margin-top: 16px; 
  width: calc(100% - 20px);
}
</style>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
    const ctx = canvas.value?.getContext('2d')
    if (!ctx || !canvas.value) return

    const canvasEl = canvas.value
    const resize = () => {
        canvasEl.width = canvasEl.offsetWidth
        canvasEl.height = canvasEl.offsetHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const columns = Math.floor(canvasEl.width / 12)
    const drops = Array(columns).fill(1)

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)

        ctx.fillStyle = '#00FF00'
        ctx.font = '14px monospace'

        for (let i = 0; i < drops.length; i++) {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96)
            ctx.fillText(text, i * 12, drops[i] * 14)

            if (drops[i] * 14 > canvasEl.height && Math.random() > 0.975) {
                drops[i] = 0
            }
            drops[i]++
        }
    }

    const interval = setInterval(draw, 50)

    onUnmounted(() => {
        clearInterval(interval)
        window.removeEventListener('resize', resize)
    })
})
</script>

<template>
    <canvas ref="canvas" class="absolute inset-0 w-full h-full z-0 opacity-30 pointer-events-none" />
</template>

<style scoped>
canvas {
  display: block;
}
</style>

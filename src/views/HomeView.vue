<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { bonuses } = storeToRefs(gameStore)

const clickCode = gameStore.clickCode
const collectBonus = gameStore.collectBonus
const buyUpgrade = gameStore.buyUpgrade

const activeTab = ref<'click' | 'auto'>('click')
const filteredUpgrades = computed(() => {
    return gameStore.upgrades.filter(upg =>
        activeTab.value === 'click' ? upg.lpcClick : upg.lpc
    )
})
</script>

<template>
    <div
        class="min-h-screen bg-black text-green-400 font-8bit text-sm flex flex-col items-center justify-center p-6">
        <h1
            class="text-4xl font-extrabold mb-6 animate-fade-in tracking-tight drop-shadow-lg text-center">
            Web Dev Clicker</h1>

        <div class="fixed top-4 right-4 space-y-2 z-50">
            <div v-if="gameStore.multiplierActive"
                 class="bg-red-500 text-black font-bold px-3 py-1 rounded shadow animate-pulse">
                🔥 x2 Clicks Active
            </div>
            <div v-if="gameStore.autoclickActive"
                 class="bg-blue-400 text-black font-bold px-3 py-1 rounded shadow animate-pulse">
                🖱️ Auto Click Active
            </div>
        </div>

        <div
            class="w-full max-w-6xl flex flex-col relative lg:flex-row gap-8 items-start justify-center">
            <!-- Left Panel: Counter and Button -->
            <div class="flex-1 flex flex-col items-center ">
                <div
                    v-for="(bonus, i) in bonuses"
                    :key="i"
                    class="absolute z-50 max-w-[100px] truncate whitespace-nowrap text-sm flex-grow shrink-0 px-2 py-1 cursor-pointer select-none bg-yellow-300 text-black font-bold rounded shadow animate-fade-in-fast"
                    :style="{
                        left: `min(${bonus.x}px, calc(100vw - 120px))`,
                        top: `min(${bonus.y}px, calc(100vh - 40px))`,
                        transform: 'translateX(-50%)'
                    }"
                    @click="collectBonus(i)"
                >
                    💥 {{ bonus.label }}
                </div>

                <button
                    @mousedown.prevent="clickCode"
                    class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-xl shadow-2xl mb-4 animate-pulse w-full max-w-xs transition-transform duration-100 active:scale-95"
                >
                    💻 Click to Code!
                </button>

                <div class="text-2xl mb-2 font-mono bg-black bg-opacity-20 rounded px-4 py-2 shadow-inner">
                    LOC: <span class="font-bold">{{ gameStore.linesOfCode }}</span>
                </div>
                <div class="text-xs text-green-400 mb-1">+{{ gameStore.clickValue }} LOC per click</div>
                <div class="text-xs text-green-400 mb-6">+{{ gameStore.passiveRate }} LOC per second</div>
            </div>

            <!-- Right Panel: Upgrades with Tabs -->
            <div class="flex-1 w-full space-y-4 animate-fade-in">
                <h2 class="text-xl font-semibold mb-2 border-b border-white/10 pb-1">Upgrade Shop</h2>

                <div class="flex gap-2 mb-4">
                    <button
                        v-for="type in ['click', 'auto']"
                        :key="type"
                        @click="activeTab = type"
                        class="px-4 py-1 rounded font-bold"
                        :class="[
                            activeTab === type ? 'bg-green-600 text-white' : 'bg-gray-600 text-white/70 hover:bg-gray-500',
                            'transition'
                        ]"
                    >
                        {{ type === 'click' ? 'Click Boosts' : 'Auto Coders' }}
                    </button>
                </div>

                <div
                    v-for="(upgrade, index) in filteredUpgrades"
                    :key="index"
                    class="bg-gray-800 bg-opacity-50 p-3 rounded-xl flex justify-between items-center flex-wrap transition-all duration-300 hover:bg-opacity-70 shadow-lg"
                >
                    <div class="mb-2 md:mb-0 flex items-center gap-3 max-w-[60%]">
                        <span class="text-xl">
                            {{ upgrade.lpc ? '🤖' : '⌨️' }}
                        </span>
                        <div>
                            <div class="font-bold text-base">{{ upgrade.name }}</div>
                            <div class="text-xs text-gray-300">
                                {{ upgrade.lpc ? `+${upgrade.lpc} LOC/sec` : `+${upgrade.lpcClick} LOC/click` }}
                                ({{ upgrade.count }})
                            </div>
                        </div>
                    </div>
                    <button
                        :disabled="gameStore.linesOfCode < upgrade.cost"
                        @click="buyUpgrade(gameStore.upgrades.indexOf(upgrade))"
                        class="relative bg-green-600 hover:bg-green-700 disabled:opacity-30 py-1.5 px-3 rounded w-full md:w-auto transition-transform duration-100 active:scale-95 font-bold text-white shadow"
                    >
                        Buy ({{ upgrade.cost }} LOC)
                        <span
                            v-if="gameStore.linesOfCode >= upgrade.cost"
                            class="absolute -top-2 -right-2 text-xs bg-yellow-300 text-black font-bold px-1.5 py-0.5 rounded"
                        >
                            🔥
                        </span>
                    </button>
                </div>
            </div>
        </div>

        <div class="mt-12 max-w-2xl w-full animate-fade-in">
            <h2 class="text-lg font-semibold mb-2">Achievements</h2>
            <ul class="space-y-1 text-xs">
                <li v-for="(ach, i) in gameStore.achievements" :key="i"
                    :class="ach.unlocked ? 'text-green-400' : 'text-gray-500'">
                    {{ ach.text }}
                </li>
            </ul>
        </div>
    </div>
</template>

<style>
@keyframes fade-in-fast {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in-fast {
  animation: fade-in-fast 0.3s ease-out;
}
</style>

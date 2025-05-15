<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { storeToRefs } from 'pinia'
import MatrixBackground from '@/components/MatrixBackground.vue'

const gameStore = useGameStore()
const { bonuses, upgrades, bestScore } = storeToRefs(gameStore)

const clickCode = gameStore.clickCode
const collectBonus = gameStore.collectBonus
const buyUpgrade = gameStore.buyUpgrade
const upgradeCategory = gameStore.upgradeCategory

const activeTab = ref<'click' | 'auto' | 'infrastructure' | 'support'>('click')

const allTabs = ['click', 'auto', 'infrastructure', 'support'] as const

const visibleUpgradeTabs = computed(() =>
    allTabs.filter(tab =>
        upgrades.value.some(u => upgradeCategory(u) === tab && (!u.unlockAt || bestScore.value >= u.unlockAt))
    )
)

const filteredUpgrades = computed(() =>
    upgrades.value.filter(
        u => upgradeCategory(u) === activeTab.value && (!u.unlockAt || bestScore.value >= u.unlockAt)
    )
)

const bonusEngineCount = computed(() => {
    const upgrade = upgrades.value.find(u => u.name === 'Faster Bonus Engine')
    return upgrade?.count || 0
})

const codeOptimizerCount = computed(() => {
    const upgrade = upgrades.value.find(u => u.name === 'Code Optimizer')
    return upgrade?.count || 0
})

const automatedTestingCount = computed(() => {
    const upgrade = upgrades.value.find(u => u.name === 'Automated Testing')
    return upgrade?.count || 0
})

const continuousIntegrationCount = computed(() => {
    const upgrade = upgrades.value.find(u => u.name === 'Continuous Integration')
    return upgrade?.count || 0
})

const costReduction = computed(() => {
    return (1 - gameStore.getCostReduction()) * 100
})

const bugReduction = computed(() => {
    return (1 - gameStore.getNegativeEventChanceReduction()) * 100
})

const featureBoost = computed(() => {
    return (gameStore.getPositiveEventChanceIncrease() - 1) * 100
})
</script>

<template>
    <div
        class="min-h-screen h-screen bg-black text-green-400 font-8bit text-sm flex flex-col items-center justify-center p-6"
    >
        <h1 class="text-4xl font-extrabold mb-6 animate-fade-in tracking-tight drop-shadow-lg text-center">
            Web Dev Clicker
        </h1>

        <div class="fixed top-4 left-4 z-50 bg-yellow-500 text-black font-bold px-3 py-1 rounded shadow text-xs">
            🔥 Streak: {{ gameStore.streakCount }} day{{ gameStore.streakCount > 1 ? 's' : '' }}
            <div v-if="gameStore.nextStreakReward" class="mt-2 text-center">
                <button
                    @click="gameStore.claimStreakReward"
                    class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-bold"
                >
                    🎁 Claim {{ gameStore.nextStreakReward.reward }} LOC (Day {{ gameStore.nextStreakReward.day }} Reward)
                </button>
            </div>
        </div>

        <div class="fixed top-4 right-4 space-y-2 z-50 text-xs">
            <div v-if="gameStore.multiplierActive"
                 class="bg-red-500 text-black font-bold px-3 py-1 rounded shadow animate-pulse">
                🔥 x2 Clicks Active
            </div>
            <div v-if="gameStore.autoclickActive"
                 class="bg-blue-400 text-black font-bold px-3 py-1 rounded shadow animate-pulse">
                🖱️ Auto Click Active
            </div>
            <div v-if="bonusEngineCount > 0"
                 class="bg-green-400 text-black font-bold px-3 py-1 rounded shadow">
                ⚡ Bonus Engine Lvl {{ bonusEngineCount }}
            </div>
            <div v-if="codeOptimizerCount > 0"
                 class="bg-purple-400 text-black font-bold px-3 py-1 rounded shadow">
                💰 Cost -{{ costReduction.toFixed(0) }}%
            </div>
            <div v-if="automatedTestingCount > 0"
                 class="bg-blue-300 text-black font-bold px-3 py-1 rounded shadow">
                🐛 Bugs -{{ bugReduction.toFixed(0) }}%
            </div>
            <div v-if="continuousIntegrationCount > 0"
                 class="bg-yellow-300 text-black font-bold px-3 py-1 rounded shadow">
                🚀 Features +{{ featureBoost.toFixed(0) }}%
            </div>
            <div v-if="gameStore.themeMode === 'matrix'"
                 class="bg-black text-lime-400 font-bold px-3 py-1 border border-lime-400 rounded shadow">
                🧪 Matrix Theme Active
            </div>
        </div>

        <div
            class="w-full max-w-6xl flex flex-col relative lg:flex-row gap-8 items-stretch justify-center"
        >
            <!-- Left Panel -->
            <div class="flex-1 flex flex-col justify-center relative h-full items-center">
                <MatrixBackground />

                <div
                    v-for="(bonus, i) in bonuses"
                    :key="i"
                    class="absolute z-50 max-w-[200px] truncate whitespace-nowrap text-sm flex-grow shrink-0 px-2 py-1 cursor-pointer select-none bg-yellow-300 text-black font-bold rounded shadow animate-fade-in-fast"
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
                    LOC: <span class="font-bold">{{ gameStore.linesOfCode.toFixed(0) }}</span>
                </div>
                <div class="text-xs text-green-400 mb-1">
                    +{{ gameStore.clickValue.toFixed(1) }} LOC per click
                </div>
                <div class="text-xs text-green-400 mb-6">
                    +{{ gameStore.passiveRate.toFixed(1) }} LOC per second
                </div>

                <div v-if="gameStore.canRefactor" class="text-center mt-8">
                    <button @click="gameStore.performRefactor"
                            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold">
                        ♻️ Refactor Codebase (+1 Refactor Point)
                    </button>
                    <p class="text-xs text-gray-400 mt-1">
                        Resets all progress but permanently increases LOC gain by 20% per point.
                    </p>
                </div>

                <div class="mt-8 max-w-2xl w-full animate-fade-in">
                    <h2 class="text-lg font-semibold mb-2">📆 Daily Missions</h2>
                    <ul class="space-y-1 text-xs">
                        <li
                            v-for="(mission, i) in gameStore.dailyMissions"
                            :key="i"
                            :class="mission.completed ? 'text-green-400' : 'text-yellow-200'"
                        >
                            ✅ {{ mission.text }} —
                            <span v-if="!mission.completed">
                                {{ Math.min(mission.progress, mission.goal).toFixed(0) }}/{{ mission.goal }}
                            </span>
                            <span v-else>Reward claimed!</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Right Panel: Upgrades -->
            <div class="flex-1 w-full space-y-4 animate-fade-in max-h-[70vh] overflow-y-auto pr-2">
                <h2 class="text-xl font-semibold mb-2 border-b border-white/10 pb-1">Upgrade Shop</h2>

                <div class="flex gap-2 mb-4 flex-wrap">
                    <button
                        v-for="type in visibleUpgradeTabs"
                        :key="type"
                        @click="activeTab = type"
                        class="px-4 py-1 rounded font-bold capitalize"
                        :class="[
                            activeTab === type ? 'bg-green-600 text-white' : 'bg-gray-600 text-white/70 hover:bg-gray-500',
                            'transition'
                        ]"
                    >
                        {{ type }}
                    </button>
                </div>

                <div
                    v-for="upgrade in filteredUpgrades"
                    :key="upgrade.name"
                    class="bg-gray-800 bg-opacity-50 p-3 rounded-xl flex justify-between items-center flex-wrap transition-all duration-300 hover:bg-opacity-70 shadow-lg"
                >
                    <div class="mb-2 md:mb-0 flex items-center gap-3 max-w-[60%]">
                        <span class="text-xl">
                            {{ upgrade.type === 'cosmetic' ? '🎨' : (upgrade.linesPerSecond && upgrade.linesPerClick ? '🏗️' : (upgrade.linesPerSecond ? '🤖' : '⌨️')) }}
                        </span>
                        <div>
                            <div class="font-bold text-base">{{ upgrade.name }}</div>
                            <div class="text-xs text-gray-300">
                                <template v-if="upgrade.type === 'cosmetic'">
                                    Cosmetic
                                </template>
                                <template v-else-if="upgrade.type === 'functional'">
                                    <template v-if="upgrade.name === 'Faster Bonus Engine'">
                                        Increases bonus spawn rate (Lvl {{ upgrade.count }})
                                    </template>
                                    <template v-else-if="upgrade.name === 'Code Optimizer'">
                                        Reduces upgrade costs by 5% per level (Lvl {{ upgrade.count }})
                                    </template>
                                    <template v-else-if="upgrade.name === 'Automated Testing'">
                                        Reduces negative events by 10% per level (Lvl {{ upgrade.count }})
                                    </template>
                                    <template v-else-if="upgrade.name === 'Continuous Integration'">
                                        Increases positive events by 20% per level (Lvl {{ upgrade.count }})
                                    </template>
                                    <template v-else>
                                        Functional (Lvl {{ upgrade.count }})
                                    </template>
                                </template>
                                <template v-else>
                                    {{ upgrade.linesPerSecond ? `+${upgrade.linesPerSecond} LOC/sec ` : '' }}
                                    {{ upgrade.linesPerClick ? `+${upgrade.linesPerClick} LOC/click` : '' }}
                                    ({{ upgrade.count }})
                                </template>
                            </div>
                        </div>
                    </div>
                    <button
                        :disabled="gameStore.linesOfCode < upgrade.cost"
                        @click="buyUpgrade(gameStore.upgrades.indexOf(upgrade))"
                        class="relative bg-green-600 hover:bg-green-700 disabled:opacity-30 py-1.5 px-3 rounded w-full md:w-auto transition-transform duration-100 active:scale-95 font-bold text-white shadow"
                    >
                        Buy ({{ upgrade.cost }} LOC)
                    </button>
                </div>
            </div>
        </div>

        <button
            @click="gameStore.resetGame"
            class="mt-8 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
        >
            🔄 Reset Game
        </button>

        <div class="mt-12 max-w-2xl w-full animate-fade-in">
            <h2 class="text-lg font-semibold mb-2">Achievements</h2>
            <ul class="space-y-1 text-xs">
                <li
                    v-for="(ach, i) in gameStore.achievements"
                    :key="i"
                    :class="ach.unlocked ? 'text-green-400' : 'text-gray-500'"
                >
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

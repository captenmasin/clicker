<script lang="ts" setup>
import {computed} from "vue";
import {useGameStore} from "@/stores/gameStore.ts";
import {storeToRefs} from "pinia";

const gameStore = useGameStore()

const { upgrades } = storeToRefs(gameStore)

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
    </div>
</template>

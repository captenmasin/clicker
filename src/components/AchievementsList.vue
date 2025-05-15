<script setup lang="ts">
import {useGameStore} from "@/stores/gameStore.js";

const gameStore = useGameStore();
const { achievements } = gameStore;
</script>

<template>
    <div class="mt-12 max-w-2xl w-full animate-fade-in">
        <h2 class="text-lg font-semibold mb-2">Achievements</h2>
        <ul class="space-y-1 text-xs">
            <li
                v-for="(ach, i) in achievements"
                :key="i"
                :class="ach.unlocked ? 'text-green-400' : 'text-gray-500'"
            >
                {{ ach.text }}
            </li>
        </ul>
    </div>
</template>

import {defineStore} from 'pinia'
import {ref, watch, onMounted, computed} from 'vue'

interface Upgrade {
  name: string
  cost: number
  lpc?: number
  lpcClick?: number
  count: number
}

interface Achievement {
  text: string
  unlocked: boolean
}

interface Bonus {
  x: number
  y: number
  type: 'loc' | 'multiplier' | 'autoclick'
  value: number
  label: string
  expiresAt: number
}

export const useGameStore = defineStore('game', () => {
    const linesOfCode = ref<number>(parseInt(localStorage.getItem('linesOfCode') || '0'))
    const upgrades = ref<Upgrade[]>(
        JSON.parse(localStorage.getItem('upgrades') || 'null') || [
            {name: 'Junior Dev', cost: 50, lpc: 1, count: 0},
            {name: 'Mid-Level Dev', cost: 200, lpc: 5, count: 0},
            {name: 'Senior Dev', cost: 1000, lpc: 20, count: 0},
            {name: 'AI Assistant', cost: 5000, lpc: 100, count: 0},
            {name: 'Startup Incubator', cost: 15000, lpc: 500, count: 0},
            {name: 'AI Dev Team', cost: 100000, lpc: 2000, count: 0},
            {name: 'Better Keyboard', cost: 200, lpcClick: 1, count: 0},
            {name: 'Dual Monitor Setup', cost: 600, lpcClick: 5, count: 0},
            {name: 'Mechanical Keyboard', cost: 2000, lpcClick: 10, count: 0},
            {name: 'Quantum Dev Tools', cost: 50000, lpcClick: 50, count: 0}
        ]
    )

    const achievements = ref<Achievement[]>([
        {text: 'First 100 LOC!', unlocked: false},
        {text: 'Own 5 Junior Devs', unlocked: false},
        {text: '1,000 LOC milestone', unlocked: false},
        {text: 'Buy an AI Assistant', unlocked: false}
    ])

    const leaderboard = ref<{ name: string; score: number }[]>(
        JSON.parse(localStorage.getItem('leaderboard') || '[]')
    )

    const theme = ref<string>(localStorage.getItem('theme') || 'dark')

    const toggleTheme = () => {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    const clickValue = computed(() => {
        return 1 + upgrades.value.reduce((sum, u) => sum + (u.lpcClick || 0) * u.count, 0)
    })

    const passiveRate = computed(() => {
        return upgrades.value.reduce((sum, u) => sum + (u.lpc || 0) * u.count, 0)
    })

    const multiplierActive = ref(false)
    const autoclickActive = ref(false)

    const bonuses = ref<Bonus[]>([])

    const clickCode = () => {
        const multiplier = multiplierActive.value ? 2 : 1
        linesOfCode.value += clickValue.value * multiplier
        checkAchievements()
        playClickSound()
    }

    const spawnBonus = () => {
        const existingTypes = bonuses.value.map(b => b.type)
        const x = Math.random() * (window.innerWidth - 100)
        const y = Math.random() * (window.innerHeight - 100)
        const typeChance = Math.random()
        const now = Date.now()

        if (typeChance < 0.6 && !existingTypes.includes('loc')) {
            const locValue = Math.floor(Math.random() * 20) + 10
            bonuses.value.push({ x, y, type: 'loc', value: locValue, label: `+ ${locValue} LOC`, expiresAt: now + 4000 })
        } else if (typeChance < 0.85 && !existingTypes.includes('multiplier')) {
            bonuses.value.push({ x, y, type: 'multiplier', value: 2, label: 'x2 Clicks (10s)', expiresAt: now + 4000 })
        } else if (!existingTypes.includes('autoclick')) {
            bonuses.value.push({ x, y, type: 'autoclick', value: 10, label: 'Auto Click (10s)', expiresAt: now + 4000 })
        }
    }

    const collectBonus = (index: number) => {
        const bonus = bonuses.value[index]
        bonuses.value.splice(index, 1)

        if (bonus.type === 'loc') {
            linesOfCode.value += bonus.value
        } else if (bonus.type === 'multiplier') {
            multiplierActive.value = true
            setTimeout(() => multiplierActive.value = false, 10000)
        } else if (bonus.type === 'autoclick') {
            autoclickActive.value = true
            const interval = setInterval(() => clickCode(), 250)
            setTimeout(() => {
                autoclickActive.value = false
                clearInterval(interval)
            }, 10000)
        }
    }

    const buyUpgrade = (index: number) => {
        const upgrade = upgrades.value[index]
        if (linesOfCode.value >= upgrade.cost) {
            linesOfCode.value -= upgrade.cost
            upgrade.count++
            upgrade.cost = Math.floor(upgrade.cost * 1.5)
            checkAchievements()
        }
    }

    const checkAchievements = () => {
        if (linesOfCode.value >= 100) achievements.value[0].unlocked = true
        if (upgrades.value[0].count >= 5) achievements.value[1].unlocked = true
        if (linesOfCode.value >= 1000) achievements.value[2].unlocked = true
        if (upgrades.value[3].count >= 1) achievements.value[3].unlocked = true
    }

    const saveScore = (name: string) => {
        leaderboard.value.push({name, score: linesOfCode.value})
        leaderboard.value.sort((a, b) => b.score - a.score)
        leaderboard.value = leaderboard.value.slice(0, 10)
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard.value))
    }

    const playClickSound = () => {
    // const clickSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.wav')
    // clickSound.currentTime = 0
    // clickSound.play()
    }

    onMounted(() => {
        setInterval(() => {
            linesOfCode.value += passiveRate.value
            checkAchievements()
        }, 1000)

        setInterval(() => {
            bonuses.value = bonuses.value.filter(b => b.expiresAt > Date.now())
            if (Math.random() < 0.2) spawnBonus()
        }, 2000)
    })

    watch(linesOfCode, (val) => {
        localStorage.setItem('linesOfCode', val.toString())
    })

    watch(upgrades, (val) => {
        localStorage.setItem('upgrades', JSON.stringify(val))
    }, {deep: true})

    watch(theme, (val) => {
        localStorage.setItem('theme', val)
        document.body.className = val === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }, {immediate: true})

    return {
        linesOfCode,
        upgrades,
        achievements,
        leaderboard,
        theme,
        toggleTheme,
        clickCode,
        buyUpgrade,
        saveScore,
        clickValue,
        passiveRate,
        bonuses,
        collectBonus,
        multiplierActive,
        autoclickActive
    }
})

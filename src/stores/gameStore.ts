import { defineStore } from 'pinia'
import { ref, watch, onMounted, computed } from 'vue'

interface Upgrade {
  name: string
  cost: number
  linesPerSecond?: number
  linesPerClick?: number
  count: number
  unlockAt?: number
  type?: 'cosmetic' | 'functional'
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
    const bestScore = ref<number>(parseInt(localStorage.getItem('bestScore') || '0'))
    const theme = ref<string>(localStorage.getItem('theme') || 'dark')
    const themeMode = ref<string>(localStorage.getItem('themeMode') || 'default')
    const refactorPoints = ref<number>(parseInt(localStorage.getItem('refactorPoints') || '0'))

    const streakCount = ref<number>(parseInt(localStorage.getItem('streakCount') || '0'))
    const lastStreakReward = ref<number>(parseInt(localStorage.getItem('lastStreakReward') || '0'))


    const defaultUpgrades = ref<Upgrade[]>([
        // Auto (passive income generators)
        { name: 'Junior Dev', cost: 50, linesPerSecond: 1, count: 0 },
        { name: 'Mid-Level Dev', cost: 200, linesPerSecond: 5, count: 0 },
        { name: 'Senior Dev', cost: 1000, linesPerSecond: 20, count: 0 },
        { name: 'AI Assistant', cost: 5000, linesPerSecond: 100, count: 0 },
        { name: 'Startup Incubator', cost: 15000, linesPerSecond: 500, count: 0 },
        { name: 'AI Dev Team', cost: 100000, linesPerSecond: 2000, count: 0 },
        { name: 'Code Generation API', cost: 250000, linesPerSecond: 5000, count: 0 },
        { name: 'Quantum Computing Cluster', cost: 500000, linesPerSecond: 10000, count: 0 },
        { name: 'Autonomous Dev Division', cost: 1000000, linesPerSecond: 25000, count: 0 },

        // Click (click-based upgrades)
        { name: 'Better Keyboard', cost: 200, linesPerClick: 1, count: 0 },
        { name: 'Dual Monitor Setup', cost: 600, linesPerClick: 5, count: 0 },
        { name: 'Mechanical Keyboard', cost: 2000, linesPerClick: 10, count: 0 },
        { name: 'Ergonomic Chair', cost: 10000, linesPerClick: 25, count: 0 },
        { name: 'Quantum Dev Tools', cost: 50000, linesPerClick: 50, count: 0 },
        { name: 'Neural Interface', cost: 200000, linesPerClick: 100, count: 0 },
        { name: 'Thought-to-Code Translator', cost: 750000, linesPerClick: 250, count: 0 },

        // Infrastructure (hybrid)
        { name: 'Cloud IDE', cost: 30000, linesPerSecond: 300, linesPerClick: 10, count: 0, unlockAt: 0 },
        { name: 'On-call DevOps', cost: 100000, linesPerSecond: 1200, linesPerClick: 25, count: 0, unlockAt: 0 },
        { name: 'Serverless Architecture', cost: 300000, linesPerSecond: 3000, linesPerClick: 50, count: 0, unlockAt: 50000 },
        { name: 'Global CDN Network', cost: 750000, linesPerSecond: 7500, linesPerClick: 100, count: 0, unlockAt: 100000 },

        // Support (functional upgrades)
        { name: 'Faster Bonus Engine', cost: 50000, count: 0, unlockAt: 200, type: 'functional' },
        { name: 'Code Optimizer', cost: 100000, count: 0, unlockAt: 10000, type: 'functional' },
        { name: 'Automated Testing', cost: 200000, count: 0, unlockAt: 25000, type: 'functional' },
        { name: 'Continuous Integration', cost: 400000, count: 0, unlockAt: 50000, type: 'functional' },
    ])

    const savedUpgrades = JSON.parse(localStorage.getItem('upgrades') || '[]')

    const upgrades = ref<Upgrade[]>(
        defaultUpgrades.value.map(defaultUpg => {
            const saved = savedUpgrades.find((u: Upgrade) => u.name === defaultUpg.name)
            return saved ? { ...defaultUpg, ...saved } : defaultUpg
        })
    )

    const achievements = ref<Achievement[]>([
        { text: 'First 100 LOC!', unlocked: false },
        { text: 'Own 5 Junior Devs', unlocked: false },
        { text: '1,000 LOC milestone', unlocked: false },
        { text: 'Buy an AI Assistant', unlocked: false }
    ])

    const leaderboard = ref<{ name: string; score: number }[]>(
        JSON.parse(localStorage.getItem('leaderboard') || '[]')
    )

    const toggleTheme = () => {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    const resetGame = () => {
        linesOfCode.value = 0
        upgrades.value.forEach(upg => {
            upg.count = 0
            upg.cost = Math.floor(upg.cost / Math.pow(1.5, upg.count)) // reset cost roughly
        })
        achievements.value.forEach(a => a.unlocked = false)
        themeMode.value = 'default'
        refactorPoints.value = 0
    }

    const nextRefactorCost = computed(() => 1_000_000 + refactorPoints.value * 2_000_000)
    const canRefactor = computed(() => bestScore.value >= nextRefactorCost.value)
    const refactorMultiplier = computed(() => 1 + refactorPoints.value * 0.2)

    const clickValue = computed(() =>
        (1 + upgrades.value.reduce((sum, u) => sum + (u.linesPerClick || 0) * u.count, 0)) * refactorMultiplier.value
    )

    const passiveRate = computed(() =>
        upgrades.value.reduce((sum, u) => sum + (u.linesPerSecond || 0) * u.count, 0) * refactorMultiplier.value
    )

    const multiplierActive = ref(false)
    const autoclickActive = ref(false)
    const bonuses = ref<Bonus[]>([])

    let bonusInterval: number

    const performRefactor = () => {
        if (!canRefactor.value) return

        refactorPoints.value++

        // Hard reset
        linesOfCode.value = 0
        upgrades.value.forEach(u => {
            u.count = 0
            u.cost = Math.floor(u.cost / Math.pow(1.5, u.count))
        })
        achievements.value.forEach(a => (a.unlocked = false))
        themeMode.value = 'default'
    }


    const startBonusSpawner = () => {
        clearInterval(bonusInterval)
        const engine = upgrades.value.find(u => u.name === 'Faster Bonus Engine')
        const count = engine?.count || 0
        const delay = Math.max(400, 2000 - count * 200)

        bonusInterval = window.setInterval(() => {
            bonuses.value = bonuses.value.filter(b => b.expiresAt > Date.now())
            if (Math.random() < 0.2 + count * 0.01) spawnBonus()
        }, delay)
    }

    const clickCode = () => {
        const multiplier = multiplierActive.value ? 2 : 1
        const gained = clickValue.value * multiplier
        linesOfCode.value += gained

        checkAchievements()
    }

    const spawnBonus = () => {
        const existing = bonuses.value.map(b => b.type)
        const x = Math.random() * (window.innerWidth - 100)
        const y = Math.random() * (window.innerHeight - 100)
        const now = Date.now()
        const rand = Math.random()

        if (rand < 0.6 && !existing.includes('loc')) {
            const val = Math.floor(Math.random() * 20) + 10
            bonuses.value.push({ x, y, type: 'loc', value: val, label: `+ ${val} LOC`, expiresAt: now + 4000 })
        } else if (rand < 0.85 && !existing.includes('multiplier')) {
            bonuses.value.push({ x, y, type: 'multiplier', value: 2, label: 'x2 Clicks (10s)', expiresAt: now + 4000 })
        } else if (!existing.includes('autoclick')) {
            bonuses.value.push({ x, y, type: 'autoclick', value: 10, label: 'Auto Click (10s)', expiresAt: now + 4000 })
        }
    }

    const collectBonus = (index: number) => {
        const bonus = bonuses.value[index]
        bonuses.value.splice(index, 1)

        if (bonus.type === 'loc') linesOfCode.value += bonus.value
        if (bonus.type === 'multiplier') {
            multiplierActive.value = true
            setTimeout(() => (multiplierActive.value = false), 10000)
        }
        if (bonus.type === 'autoclick') {
            autoclickActive.value = true
            const int = setInterval(() => clickCode(), 250)
            setTimeout(() => {
                autoclickActive.value = false
                clearInterval(int)
            }, 10000)
        }
    }

    const streakRewardTiers = [
        { day: 3, reward: 3000 },
        { day: 5, reward: 6000 },
        { day: 7, reward: 10000 },
        { day: 14, reward: 25000 },
        { day: 30, reward: 100000 }
    ]

    const nextStreakReward = computed(() =>
        streakRewardTiers.find(tier => streakCount.value >= tier.day && lastStreakReward.value < tier.day)
    )

    const claimStreakReward = () => {
        if (!nextStreakReward.value) return
        linesOfCode.value += nextStreakReward.value.reward
        lastStreakReward.value = nextStreakReward.value.day
        localStorage.setItem('lastStreakReward', lastStreakReward.value.toString())
    }

    // Get the count of a specific upgrade by name
    const getUpgradeCount = (name: string): number => {
        const upgrade = upgrades.value.find(u => u.name === name)
        return upgrade?.count || 0
    }

    // Calculate cost reduction based on Code Optimizer level
    const getCostReduction = (): number => {
        const optimizerLevel = getUpgradeCount('Code Optimizer')
        return Math.max(0.7, 1 - optimizerLevel * 0.05) // 5% reduction per level, min 30% of original cost
    }

    // Calculate chance reduction for negative events based on Automated Testing level
    const getNegativeEventChanceReduction = (): number => {
        const testingLevel = getUpgradeCount('Automated Testing')
        return Math.max(0.5, 1 - testingLevel * 0.1) // 10% reduction per level, min 50% of original chance
    }

    // Calculate chance increase for positive events based on Continuous Integration level
    const getPositiveEventChanceIncrease = (): number => {
        const ciLevel = getUpgradeCount('Continuous Integration')
        return 1 + ciLevel * 0.2 // 20% increase per level
    }

    const buyUpgrade = (index: number) => {
        const upgrade = upgrades.value[index]
        if (linesOfCode.value >= upgrade.cost) {
            linesOfCode.value -= upgrade.cost
            upgrade.count++

            // Apply cost reduction from Code Optimizer
            const costMultiplier = upgrade.name === 'Code Optimizer' ? 1.5 : 1.5 * getCostReduction()
            upgrade.cost = Math.floor(upgrade.cost * costMultiplier)

            // Handle special functional upgrades
            if (upgrade.name === 'Faster Bonus Engine') startBonusSpawner()
            if (upgrade.name === 'Dark Matrix Theme') themeMode.value = 'matrix'
        }
    }

    const checkAchievements = () => {
        if (linesOfCode.value >= 100) achievements.value[0].unlocked = true
        if (upgrades.value[0].count >= 5) achievements.value[1].unlocked = true
        if (linesOfCode.value >= 1000) achievements.value[2].unlocked = true
        if (upgrades.value[3].count >= 1) achievements.value[3].unlocked = true
    }

    const saveScore = (name: string) => {
        leaderboard.value.push({ name, score: linesOfCode.value })
        leaderboard.value.sort((a, b) => b.score - a.score)
        leaderboard.value = leaderboard.value.slice(0, 10)
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard.value))
    }

    const upgradeCategory = (u: Upgrade): 'click' | 'auto' | 'infrastructure' | 'visual' | 'support' => {
        if (u.type === 'cosmetic') return 'visual'
        if (u.type === 'functional') return 'support'
        if (u.linesPerClick && u.linesPerSecond) return 'infrastructure'
        if (u.linesPerClick) return 'click'
        if (u.linesPerSecond) return 'auto'
        return 'click'
    }

    const randomEvents = [
        {
            name: 'Merge Conflict',
            message: '🔥 Catastrophic merge conflict! You lost {loss} LOC!',
            chance: 0.01,
            minLOC: 500,
            percentLoss: 0.05
        },
        {
            name: 'Intern Mistake',
            message: '😱 The intern force-pushed to production! You lost {loss} LOC!',
            chance: 0.008,
            minLOC: 1000,
            percentLoss: 0.08
        },
        {
            name: 'Coffee Spill',
            message: '☕ You spilled coffee on your keyboard. Lost {loss} LOC fixing typos.',
            chance: 0.012,
            minLOC: 300,
            percentLoss: 0.03
        },
        {
            name: 'Rollback',
            message: '🔁 Production rollback! {loss} LOC reverted.',
            chance: 0.01,
            minLOC: 750,
            percentLoss: 0.06
        },
        {
            name: 'Code Review Rejection',
            message: '🛑 Lead dev rejected your changes. {loss} LOC sent back.',
            chance: 0.015,
            minLOC: 200,
            percentLoss: 0.02
        }
    ]

    const positiveEvents = [
        {
            name: 'Open Source Boost',
            message: '🎉 Your open source project went viral! You gained {gain} LOC!',
            chance: 0.01,
            minLOC: 0,
            percentGain: 0.05
        },
        {
            name: 'Hackathon Victory',
            message: '🏆 You won a hackathon and earned {gain} LOC!',
            chance: 0.008,
            minLOC: 200,
            percentGain: 0.08
        },
        {
            name: 'AI Optimizer',
            message: '🤖 Your AI assistant optimized your code. +{gain} LOC!',
            chance: 0.012,
            minLOC: 500,
            percentGain: 0.03
        },
        {
            name: 'Productivity Surge',
            message: '🚀 You hit flow state and crushed it! +{gain} LOC!',
            chance: 0.015,
            minLOC: 100,
            percentGain: 0.04
        }
    ]

    // Lifecycle
    onMounted(() => {
        setInterval(() => {
            linesOfCode.value += passiveRate.value
            checkAchievements()
        }, 1000)

        setInterval(() => {
            for (const event of randomEvents) {
                // Apply Automated Testing effect to reduce negative event chance
                const reducedChance = event.chance * getNegativeEventChanceReduction()
                if (Math.random() < reducedChance && linesOfCode.value >= event.minLOC) {
                    const loss = Math.floor(linesOfCode.value * event.percentLoss)
                    linesOfCode.value -= loss
                    alert(event.message.replace('{loss}', loss.toString()))
                    break
                }
            }
        }, 15000)

        setInterval(() => {
            for (const event of positiveEvents) {
                // Apply Continuous Integration effect to increase positive event chance
                const increasedChance = event.chance * getPositiveEventChanceIncrease()
                if (Math.random() < increasedChance && linesOfCode.value >= event.minLOC) {
                    const gain = Math.floor(linesOfCode.value * event.percentGain) || 10
                    linesOfCode.value += gain
                    alert(event.message.replace('{gain}', gain.toString()))
                    break
                }
            }
        }, 15000)

        startBonusSpawner()
    })

    watch(linesOfCode, val => {
        localStorage.setItem('linesOfCode', val.toString())
        if (val > bestScore.value) {
            bestScore.value = val
            localStorage.setItem('bestScore', val.toString())
        }
    })

    watch(refactorPoints, val => {
        localStorage.setItem('refactorPoints', val.toString())
    })

    watch(upgrades, val => {
        localStorage.setItem('upgrades', JSON.stringify(val))
    }, { deep: true })

    watch(theme, val => {
        localStorage.setItem('theme', val)
        document.body.className = val === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }, { immediate: true })

    watch(themeMode, val => {
        localStorage.setItem('themeMode', val)
        document.body.classList.toggle('matrix-theme', val === 'matrix')
    }, { immediate: true })

    return {
        linesOfCode,
        bestScore,
        upgrades,
        achievements,
        leaderboard,
        theme,
        themeMode,
        resetGame,
        lastStreakReward,
        toggleTheme,
        clickCode,
        buyUpgrade,
        saveScore,
        canRefactor,
        performRefactor,
        clickValue,
        passiveRate,
        bonuses,
        collectBonus,
        multiplierActive,
        autoclickActive,
        upgradeCategory,
        // New helper functions
        getUpgradeCount,
        claimStreakReward,
        nextStreakReward,
        streakCount,
        getCostReduction,
        getNegativeEventChanceReduction,
        getPositiveEventChanceIncrease
    }
})

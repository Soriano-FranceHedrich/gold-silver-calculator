import { ref } from 'vue'

// Philippine gold rate data (can be updated via API)
const goldRates = ref({
  gold: {
    '24': null, // 24K rate per gram
    '22': null, // 22K rate per gram
    '21': null, // 21K rate per gram
    '18': null, // 18K rate per gram
    '14': null, // 14K rate per gram
    '10': null, // 10K rate per gram
    '8': null, // 8K rate per gram
    '6': null, // 6K rate per gram
  },
  silver: {
    '99.9': null, // Fine silver rate per gram
    '92.5': null, // Sterling silver rate per gram
  },
  lastUpdated: null,
  sourceUrl: null,
})

// Reference rates (based on the provided photo; PHP per gram)
const referenceRates = {
  gold: {
    '24': 9935.78,
    '22': 9107.8,
    '21': 8693.81,
    '18': 7451.84,
    '14': 5795.87,
    '10': 4139.91,
    '8': 3307.04,
    '6': 2482.76,
  },
  silver: {
    '99.9': 85, // Fine silver per gram in PHP
    '92.5': 79, // Sterling silver per gram in PHP
  }
}

export function useGoldRate() {
  const loading = ref(false)
  const error = ref(null)

  const persistRates = (rates) => {
    try {
      localStorage.setItem('marketRates', JSON.stringify(rates))
    } catch {
      // ignore
    }
  }

  const loadPersistedRates = () => {
    try {
      const raw = localStorage.getItem('marketRates')
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const normalizeNumber = (v) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }

  const sanitizeRates = (maybe) => {
    if (!maybe || typeof maybe !== 'object') return null
    const g = maybe?.gold
    if (!g || typeof g !== 'object') return null

    // Accept only values that look like real PHP/gram (avoid bogus 24, 22, etc.)
    const pick = (k) => {
      const n = normalizeNumber(g[k])
      if (n === null) return null
      return n >= 100 ? n : null
    }

    const sanitizedGold = {
      '24': pick('24'),
      '22': pick('22'),
      '21': pick('21'),
      '18': pick('18'),
      '14': pick('14'),
      '10': pick('10'),
      '8': pick('8'),
      '6': pick('6'),
    }

    const hasAny = Object.values(sanitizedGold).some((v) => v !== null)
    if (!hasAny) return null

    return {
      gold: sanitizedGold,
      silver: { ...referenceRates.silver },
      lastUpdated: maybe?.lastUpdated ?? null,
      sourceUrl: null,
    }
  }

  // Use the photo-based reference rates as the basis
  const fetchCurrentRates = async () => {
    loading.value = true
    error.value = null

    try {
      const next = {
        gold: {
          ...referenceRates.gold,
        },
        // Silver rates are still fallback/manual unless you add a silver source.
        silver: { ...referenceRates.silver },
        lastUpdated: new Date().toISOString(),
        sourceUrl: null,
      }

      goldRates.value = next
      persistRates(next)

      return { success: true, rates: goldRates.value }
    } catch (err) {
      error.value = 'Failed to load rates. Using saved/reference rates.'
      console.error('Error fetching gold rates:', err)

      const persisted = loadPersistedRates()
      goldRates.value = persisted ?? {
        gold: { ...referenceRates.gold },
        silver: { ...referenceRates.silver },
        lastUpdated: new Date().toISOString(),
        sourceUrl: null,
      }

      return { success: false, rates: goldRates.value, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Get rate for specific metal and purity
  const getRate = (metalType, purity) => {
    const key = String(purity)
    if (metalType === 'gold') {
      return (
        normalizeNumber(goldRates.value.gold?.[key]) ??
        normalizeNumber(referenceRates.gold?.[key]) ??
        null
      )
    } else if (metalType === 'silver') {
      return (
        normalizeNumber(goldRates.value.silver?.[key]) ??
        normalizeNumber(referenceRates.silver?.[key]) ??
        null
      )
    }
    return null
  }

  // Initialize with reference rates
  const initializeRates = () => {
    const persisted = sanitizeRates(loadPersistedRates())
    goldRates.value = {
      gold: { ...referenceRates.gold, ...(persisted?.gold ?? {}) },
      silver: { ...referenceRates.silver },
      lastUpdated: persisted?.lastUpdated ?? new Date().toISOString(),
      sourceUrl: null,
    }
  }

  return {
    goldRates,
    loading,
    error,
    fetchCurrentRates,
    getRate,
    initializeRates,
    referenceRates
  }
}

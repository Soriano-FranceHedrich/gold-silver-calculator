<template>
  <div class="calculator-container">
    <header class="header">
      <div>
        <h1>Gold & Silver Price Calculator</h1>
        <p class="header-subtitle">Philippine Market Rates (PHP/₱)</p>
      </div>
      <div class="user-info">
        <span class="welcome">Welcome, {{ currentUser?.name }}</span>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </header>

    <main class="calculator-card">
      <section class="market-rates-info">
        <h3>Current Philippine Market Rates</h3>

        <div class="rates-grid">
          <div class="rate-item">
            <span class="rate-label">24K Gold</span>
            <span class="rate-value">
              ₱{{ (goldRates.gold['24'] ?? referenceRates.gold['24']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">22K Gold</span>
            <span class="rate-value">
              ₱{{ (goldRates.gold['22'] ?? referenceRates.gold['22']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">21K Gold</span>
            <span class="rate-value">
              ₱{{ (goldRates.gold['21'] ?? referenceRates.gold['21']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">18K Gold</span>
            <span class="rate-value">
              ₱{{ (goldRates.gold['18'] ?? referenceRates.gold['18']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">14K Gold</span>
            <span class="rate-value">
              ₱{{ (goldRates.gold['14'] ?? referenceRates.gold['14']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">10K Gold</span>
            <span class="rate-value">
              ₱{{ (goldRates.gold['10'] ?? referenceRates.gold['10']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">8K Gold</span>
            <span class="rate-value">
              ₱{{ (goldRates.gold['8'] ?? referenceRates.gold['8']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">6K Gold</span>
            <span class="rate-value">
              ₱{{ (goldRates.gold['6'] ?? referenceRates.gold['6']).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">99.9% Silver</span>
            <span class="rate-value">
              ₱{{ referenceRates.silver['99.9'].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
          <div class="rate-item">
            <span class="rate-label">92.5% Silver</span>
            <span class="rate-value">
              ₱{{ referenceRates.silver['92.5'].toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}/g
            </span>
          </div>
        </div>

        <p class="rates-note">
          Gold rates are based on the values from the provided photo (PHP per gram). Click “Use Current Rate” to apply the selected purity’s rate automatically.
          <span v-if="goldRates.lastUpdated"> Last updated: {{ new Date(goldRates.lastUpdated).toLocaleString() }}.</span>
        </p>
      </section>

      <section class="form">
        <div class="form-row">
          <div class="form-group">
            <label for="metalType">Metal Type</label>
            <select id="metalType" v-model="metalType" :class="{ error: pageErrors.metalType }">
              <option value="">Select Metal Type</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
            <span v-if="pageErrors.metalType" class="error-message">{{ pageErrors.metalType }}</span>
          </div>

          <div class="form-group">
            <label>Making Charge</label>
            <div class="making-charge-display">
              <span class="making-charge-value">10% (Fixed)</span>
              <span class="making-charge-note">Making charge is automatically calculated as 10% of Metal Price</span>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="global-error">
          {{ errorMessage }}
        </div>

        <div v-if="metalType" class="purity-grid">
          <div v-for="p in purityOptions" :key="p.key" class="purity-card">
            <div class="purity-card-header">
              <div class="purity-title">
                <span class="purity-badge">{{ p.label }}</span>
                <span class="purity-subtitle">{{ metalType === 'gold' ? 'Gold' : 'Silver' }}</span>
              </div>
              <button
                type="button"
                class="btn-fetch-rate"
                :disabled="rateLoading"
                @click="applySuggestedRate(p.key)"
              >
                {{ rateLoading ? 'Loading...' : 'Use Rate' }}
              </button>
            </div>

            <div class="purity-card-body">
              <div class="form-row">
                <div class="form-group">
                  <label :for="`grams-${p.key}`">Grams</label>
                  <input
                    :id="`grams-${p.key}`"
                    v-model.number="calculators[p.key].grams"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Enter grams"
                    :class="{ error: calculators[p.key].errors.grams }"
                  />
                  <span v-if="calculators[p.key].errors.grams" class="error-message">{{ calculators[p.key].errors.grams }}</span>
                </div>

                <div class="form-group">
                  <label :for="`rate-${p.key}`">Rate (₱/g)</label>
                  <input
                    :id="`rate-${p.key}`"
                    v-model.number="calculators[p.key].rate"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="Rate per gram"
                    :class="{ error: calculators[p.key].errors.rate }"
                  />
                  <span v-if="calculators[p.key].errors.rate" class="error-message">{{ calculators[p.key].errors.rate }}</span>
                  <span v-if="calculators[p.key].suggestedRate" class="rate-info">
                    Suggested: ₱{{ calculators[p.key].suggestedRate.toFixed(2) }}/g
                  </span>
                </div>
              </div>

              <button type="button" class="btn btn-primary" @click="calculatePurity(p)">
                Calculate {{ p.label }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Result Modal -->
    <div v-if="showModal && modalData" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" role="dialog" aria-modal="true" aria-label="Calculation Result">
        <div class="modal-header">
          <h2>Calculation Result</h2>
          <button @click="closeModal" class="modal-close-btn" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="result-details">
            <div class="result-row">
              <span class="label">Metal Type</span>
              <span class="value">{{ modalData.metalTypeLabel }}</span>
            </div>
            <div class="result-row">
              <span class="label">Purity</span>
              <span class="value">{{ modalData.purityLabel }}</span>
            </div>
            <div class="result-row">
              <span class="label">Weight</span>
              <span class="value">{{ modalData.grams }} g</span>
            </div>
            <div class="result-row">
              <span class="label">Market Rate</span>
              <span class="value">₱{{ modalData.rate.toFixed(2) }}/g</span>
            </div>
            <div class="result-row">
              <span class="label">Metal Price (g × rate)</span>
              <span class="value">₱{{ modalData.result.metalPrice.toFixed(2) }}</span>
            </div>
            <div class="result-row">
              <span class="label">Making Charge (10%)</span>
              <span class="value">₱{{ modalData.result.makingCharge.toFixed(2) }}</span>
            </div>
            <div class="result-row">
              <span class="label">Subtotal</span>
              <span class="value">₱{{ modalData.result.subtotal.toFixed(2) }}</span>
            </div>
            <div class="result-row">
              <span class="label">Tax (12%)</span>
              <span class="value">₱{{ modalData.result.tax.toFixed(2) }}</span>
            </div>
            <div class="result-row total">
              <span class="label">Total Amount</span>
              <span class="value">₱{{ modalData.result.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-close-modal" @click="closeModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useGoldRate } from '../composables/useGoldRate'

const router = useRouter()
const { currentUser, logout } = useAuth()
const { goldRates, fetchCurrentRates, getRate, initializeRates, loading: rateLoading, referenceRates } = useGoldRate()

const metalType = ref('')
const pageErrors = ref({})
const errorMessage = ref('')

const showModal = ref(false)
const modalData = ref(null)

const purityOptions = computed(() => {
  if (metalType.value === 'gold') {
    return [
      { key: '24', label: '24K' },
      { key: '22', label: '22K' },
      { key: '21', label: '21K' },
      { key: '18', label: '18K' },
      { key: '14', label: '14K' },
      { key: '10', label: '10K' },
      { key: '8', label: '8K' },
      { key: '6', label: '6K' },
    ]
  }
  if (metalType.value === 'silver') {
    return [
      { key: '99.9', label: '99.9%' },
      { key: '92.5', label: '92.5%' },
    ]
  }
  return []
})

const calculators = reactive({})

const ensureCalculator = (purityKey) => {
  if (!calculators[purityKey]) {
    calculators[purityKey] = reactive({
      grams: '',
      rate: '',
      suggestedRate: null,
      errors: reactive({ grams: '', rate: '' }),
    })
  }
  const suggested = getRate(metalType.value, purityKey)
  calculators[purityKey].suggestedRate = suggested ?? null
  if (!calculators[purityKey].rate && suggested) {
    calculators[purityKey].rate = suggested
  }
}

const handleKeyDown = (event) => {
  if (event.key === 'Escape' && showModal.value) closeModal()
}

onMounted(() => {
  initializeRates()
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

watch(
  () => metalType.value,
  async (mt) => {
    pageErrors.value = {}
    errorMessage.value = ''
    if (!mt) return
    // ensure rates are initialized from photo-based table
    await fetchCurrentRates()
    // init calculators for all purities
    for (const p of purityOptions.value) ensureCalculator(p.key)
  },
)

watch(
  () => purityOptions.value.map((p) => p.key).join(','),
  () => {
    for (const p of purityOptions.value) ensureCalculator(p.key)
  },
)

const applySuggestedRate = async (purityKey) => {
  errorMessage.value = ''
  if (!metalType.value) {
    pageErrors.value = { metalType: 'Please select metal type' }
    return
  }
  await fetchCurrentRates()
  ensureCalculator(purityKey)
  const suggested = getRate(metalType.value, purityKey)
  if (suggested) {
    calculators[purityKey].rate = suggested
    calculators[purityKey].suggestedRate = suggested
  }
}

const calculatePurity = (p) => {
  errorMessage.value = ''
  if (!metalType.value) {
    pageErrors.value = { metalType: 'Please select metal type' }
    return
  }

  ensureCalculator(p.key)
  const c = calculators[p.key]
  c.errors.grams = ''
  c.errors.rate = ''

  const grams = Number(c.grams)
  const rate = Number(c.rate)
  if (!grams || grams <= 0) c.errors.grams = 'Grams must be greater than 0'
  if (!rate || rate <= 0) c.errors.rate = 'Rate must be greater than 0'
  if (c.errors.grams || c.errors.rate) return

  try {
    const metalPrice = grams * rate
    const makingCharge = metalPrice * 0.10
    const subtotal = metalPrice + makingCharge
    const tax = subtotal * 0.12
    const total = subtotal + tax

    modalData.value = {
      metalType: metalType.value,
      metalTypeLabel: metalType.value.charAt(0).toUpperCase() + metalType.value.slice(1),
      purityKey: p.key,
      purityLabel: metalType.value === 'gold' ? `${p.key}K` : `${p.key}%`,
      grams,
      rate,
      result: { metalPrice, makingCharge, subtotal, tax, total },
    }

    showModal.value = true
  } catch (e) {
    errorMessage.value = 'An error occurred during calculation. Please try again.'
    console.error(e)
  }
}

const closeModal = () => {
  showModal.value = false
  modalData.value = null
}

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.calculator-container {
  min-height: 100vh;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
}

.header {
  width: 100%;
  padding: 22px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #0F172A;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.18);
}

.header h1 {
  color: #FFFFFF;
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.header-subtitle {
  color: rgba(255, 255, 255, 0.85);
  margin: 6px 0 0 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.btn-logout {
  padding: 10px 18px;
  background: #3B82F6;
  border: 1px solid #3B82F6;
  border-radius: 10px;
  color: #FFFFFF;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #2563EB;
  border-color: #2563EB;
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(59, 130, 246, 0.25);
}

.calculator-card {
  width: 100%;
  padding: 28px 40px 40px;
}

.market-rates-info {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-left: 5px solid #FACC15;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.market-rates-info h3 {
  margin: 0 0 14px 0;
  color: #0F172A;
  font-size: 18px;
  font-weight: 800;
}

.rates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
}

.rate-item {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.rate-label {
  color: #0F172A;
  font-weight: 700;
  font-size: 13px;
}

.rate-value {
  color: #FACC15;
  font-weight: 900;
  font-size: 13px;
}

.rates-note {
  margin: 14px 0 0 0;
  font-size: 12px;
  color: #475569;
  line-height: 1.5;
}

.rates-link {
  color: #3B82F6;
  font-weight: 800;
  text-decoration: none;
}

.rates-link:hover {
  text-decoration: underline;
}

.form {
  margin-top: 22px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.purity-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.purity-card {
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.purity-card-header {
  padding: 14px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.purity-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.purity-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: #0F172A;
  color: #FACC15;
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.4px;
}

.purity-subtitle {
  font-size: 12px;
  color: #475569;
  font-weight: 700;
}

.purity-card-body {
  padding: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #0F172A;
  font-weight: 700;
  font-size: 13px;
}

input,
select {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: #FFFFFF;
  color: #0F172A;
  font-family: inherit;
}

input::placeholder {
  color: #94A3B8;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

input.error,
select.error {
  border-color: #EF4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
}

.error-message {
  display: block;
  margin-top: 6px;
  color: #EF4444;
  font-size: 12px;
  font-weight: 600;
}

.rate-input-group {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.rate-input-group input {
  flex: 1;
}

.btn-fetch-rate {
  padding: 12px 16px;
  background: #3B82F6;
  border: none;
  border-radius: 12px;
  color: #FFFFFF;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 10px 22px rgba(59, 130, 246, 0.22);
}

.btn-fetch-rate:hover:not(:disabled) {
  background: #2563EB;
  transform: translateY(-1px);
}

.btn-fetch-rate:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.rate-info {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #3B82F6;
  font-weight: 700;
  padding: 10px 12px;
  background: #DBEAFE;
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.making-charge-display {
  padding: 12px 14px;
  background: #F8FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.making-charge-value {
  font-weight: 900;
  font-size: 14px;
  color: #3B82F6;
}

.making-charge-note {
  font-size: 12px;
  color: #475569;
  font-style: italic;
}

.global-error {
  margin: 14px 0;
  padding: 12px 14px;
  border-radius: 14px;
  background: #FEF2F2;
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #991B1B;
  font-weight: 700;
}

.btn {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.btn-primary {
  background: #3B82F6;
  border: 1px solid #3B82F6;
  color: #FFFFFF;
  box-shadow: 0 14px 30px rgba(59, 130, 246, 0.24);
}

.btn-primary:hover {
  background: #2563EB;
  border-color: #2563EB;
  transform: translateY(-1px);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 18px;
  backdrop-filter: blur(3px);
}

.modal-content {
  width: 100%;
  max-width: 620px;
  max-height: 92vh;
  overflow: hidden;
  background: #FFFFFF;
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.35);
  border: 1px solid #E2E8F0;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 18px 20px;
  background: #0F172A;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #FFFFFF;
  font-size: 18px;
  font-weight: 900;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: #FFFFFF;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.modal-body {
  padding: 18px 20px;
  overflow: auto;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-row {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.result-row .label {
  color: #0F172A;
  font-weight: 800;
  font-size: 13px;
}

.result-row .value {
  color: #0F172A;
  font-weight: 900;
  font-size: 14px;
}

.result-row.total {
  background: #0F172A;
  border: none;
}

.result-row.total .label {
  color: rgba(255, 255, 255, 0.9);
}

.result-row.total .value {
  color: #FACC15;
  font-size: 16px;
}

.modal-footer {
  padding: 14px 20px;
  border-top: 1px solid #E2E8F0;
  background: #F8FAFC;
  display: flex;
  justify-content: flex-end;
}

.btn-close-modal {
  padding: 10px 18px;
  background: #3B82F6;
  border: 1px solid #3B82F6;
  border-radius: 12px;
  color: #FFFFFF;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  background: #2563EB;
  border-color: #2563EB;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .header {
    padding: 18px 18px;
    justify-content: center;
    text-align: center;
  }

  .calculator-card {
    padding: 18px;
  }

  .rate-input-group {
    flex-direction: column;
  }

  .purity-grid {
    grid-template-columns: 1fr;
  }
}
</style>


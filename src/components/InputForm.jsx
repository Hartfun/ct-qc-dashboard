import { useState, useRef, useCallback, useEffect } from 'react'

// ─── Field order for Enter-key navigation ────────────────────────────────────
const FIELD_ORDER = [
  'serial_No', 'Date',
  'st15', 'st5', 'st10',
  'kv80', 'kv110', 'kv130',
  't08', 't1', 't15',
  'dhead', 'dbody',
  'lcr', 'hcr',
  'lf', 'lb', 'll', 'lr',
]

// ─── Per-field validation rules ──────────────────────────────────────────────
// min/max are plausible physical bounds — not spec tolerances (those are the model's job)
const RULES = {
  serial_No: {
    required: true,
    pattern:  /^[A-Za-z0-9\-_/]{2,30}$/,
    patternMsg: 'Use 2–30 characters: letters, numbers, hyphens, underscores or /.',
  },
  Date: {
    required:  true,
    noFuture:  true,
    maxAgeDays: 365,
  },
  // Slice thickness (mm)
  st15:  { required: true, min: 0.1,  max: 10,   unit: 'mm' },
  st5:   { required: true, min: 0.5,  max: 20,   unit: 'mm' },
  st10:  { required: true, min: 1,    max: 30,   unit: 'mm' },
  // KV accuracy
  kv80:  { required: true, min: 40,   max: 120,  unit: 'kV' },
  kv110: { required: true, min: 60,   max: 150,  unit: 'kV' },
  kv130: { required: true, min: 80,   max: 180,  unit: 'kV' },
  // Timer accuracy (s)
  t08:   { required: true, min: 0.01, max: 5,    unit: 's'  },
  t1:    { required: true, min: 0.01, max: 5,    unit: 's'  },
  t15:   { required: true, min: 0.01, max: 5,    unit: 's'  },
  // Radiation dose (mGy)
  dhead: { required: true, min: 1,    max: 100,  unit: 'mGy' },
  dbody: { required: true, min: 0.5,  max: 60,   unit: 'mGy' },
  // Contrast resolution (lp/cm)
  lcr:   { required: true, min: 0.1,  max: 20,   unit: 'lp/cm' },
  hcr:   { required: true, min: 0.1,  max: 30,   unit: 'lp/cm' },
  // Leakage (mR/hr) — zero is valid
  lf:    { required: true, min: 0,    max: 500,  unit: 'mR/hr' },
  lb:    { required: true, min: 0,    max: 500,  unit: 'mR/hr' },
  ll:    { required: true, min: 0,    max: 500,  unit: 'mR/hr' },
  lr:    { required: true, min: 0,    max: 500,  unit: 'mR/hr' },
}

function validateField(id, value) {
  const rule = RULES[id]
  if (!rule) return ''

  // ── Text / date fields ────────────────────────────────────────────────────
  if (id === 'serial_No') {
    if (!value || value.trim() === '') return 'Serial No is required.'
    if (!rule.pattern.test(value.trim())) return rule.patternMsg
    return ''
  }

  if (id === 'Date') {
    if (!value) return 'Date is required.'
    const entered = new Date(value)
    if (isNaN(entered.getTime())) return 'Enter a valid date.'
    const today = new Date(); today.setHours(23, 59, 59, 999)
    if (entered > today) return 'Date cannot be in the future.'
    const oldest = new Date(); oldest.setDate(oldest.getDate() - rule.maxAgeDays)
    if (entered < oldest) return `Date must be within the last ${rule.maxAgeDays} days.`
    return ''
  }

  // ── Numeric fields ────────────────────────────────────────────────────────
  if (value === '' || value === null || value === undefined)
    return 'This field is required.'

  const num = parseFloat(value)
  if (isNaN(num) || !isFinite(num)) return 'Enter a valid number.'
  if (rule.min !== undefined && num < rule.min)
    return `Must be ≥ ${rule.min} ${rule.unit}.`
  if (rule.max !== undefined && num > rule.max)
    return `Must be ≤ ${rule.max} ${rule.unit}. Check your reading.`
  return ''
}

// Validate all fields and return { id: errorString } map
function validateAll(form) {
  const errs = {}
  for (const id of FIELD_ORDER) {
    const msg = validateField(id, form[id])
    if (msg) errs[id] = msg
  }
  return errs
}

// ─── Inline error annotation ─────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '6px',
      marginTop: '5px', padding: '6px 10px',
      background: 'rgba(220,60,60,0.15)',
      border: '1px solid rgba(220,60,60,0.38)',
      borderRadius: '6px', fontSize: '0.73rem', lineHeight: '1.4',
      color: '#ffaaaa', animation: 'fadeUp 0.18s ease both',
    }}>
      <span style={{ flexShrink: 0 }}>⚠️</span>
      <span>{msg}</span>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function InputForm({ form, onChange, onSubmit, loading }) {
  const [touched,  setTouched]  = useState({})   // fields the user has visited
  const [errors,   setErrors]   = useState({})   // current error map
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const inputRefs = useRef({})

  // Recompute errors whenever form changes
  useEffect(() => {
    setErrors(validateAll(form))
  }, [form])

  const setRef = (id) => (el) => { inputRefs.current[id] = el }

  const markTouched = (id) => setTouched(t => ({ ...t, [id]: true }))

  // Show error only if the field has been touched OR submit was attempted
  const visibleError = (id) =>
    (touched[id] || submitAttempted) ? (errors[id] || '') : ''

  // Enter → next field (or submit on last)
  const handleKeyDown = useCallback((e, id) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const idx  = FIELD_ORDER.indexOf(id)
    const next = FIELD_ORDER[idx + 1]
    if (next && inputRefs.current[next]) {
      inputRefs.current[next].focus()
    } else {
      handleSubmitClick()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const handleSubmitClick = () => {
    setSubmitAttempted(true)
    // Mark all touched so every error becomes visible
    const all = {}
    FIELD_ORDER.forEach(id => { all[id] = true })
    setTouched(all)

    const errs = validateAll(form)
    if (Object.keys(errs).length > 0) {
      // Focus the first field that has an error
      const firstBad = FIELD_ORDER.find(id => errs[id])
      if (firstBad && inputRefs.current[firstBad]) {
        inputRefs.current[firstBad].focus()
      }
      return
    }
    onSubmit()
  }

  // Shared input style — red border when there's a visible error
  const inputStyle = (id) => visibleError(id) ? {
    borderColor: '#e05555',
    boxShadow:   '0 0 0 3px rgba(220,60,60,0.18)',
  } : {}

  // Generic field renderer
  const field = (label, id, type = 'number', placeholder = '') => (
    <div className="field" key={id}>
      <label htmlFor={id}>{label}{RULES[id]?.required && (
        <span style={{ color: '#e08888', marginLeft: '3px' }}>*</span>
      )}</label>
      <input
        id={id}
        ref={setRef(id)}
        type={type}
        step="any"
        value={form[id]}
        placeholder={placeholder}
        autoComplete="off"
        style={inputStyle(id)}
        onChange={e => {
          onChange(id, e.target.value)
          markTouched(id)
        }}
        onFocus={() => markTouched(id)}
        onBlur={e => {
          markTouched(id)
          if (type === 'number' && e.target.value !== '') {
            const n = parseFloat(e.target.value)
            if (!isNaN(n)) onChange(id, n)
          }
        }}
        onKeyDown={e => handleKeyDown(e, id)}
      />
      <FieldError msg={visibleError(id)} />
    </div>
  )

  const totalErrors   = Object.keys(errors).length
  const hasAnyVisible = submitAttempted && totalErrors > 0

  return (
    <div className="card">

      {/* ── Global validation summary (shown after first submit attempt) ── */}
      {hasAnyVisible && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 16px', marginBottom: '16px',
          background: 'rgba(220,60,60,0.15)',
          border: '1px solid rgba(220,60,60,0.40)',
          borderRadius: '8px', fontSize: '0.82rem', color: '#ffbbbb',
          animation: 'fadeUp 0.2s ease both',
        }}>
          <span style={{ fontSize: '1.1rem' }}>🚫</span>
          <span>
            {totalErrors} field{totalErrors > 1 ? 's' : ''} need{totalErrors === 1 ? 's' : ''} attention
            before analysis can run.
          </span>
        </div>
      )}

      {/* ── RECORD META ── */}
      <div className="section-group">
        <div className="section-header purple">📋 CT Scanner Test Record</div>
        <div className="section-body bg-gray-pale">
          <div className="grid mb">
            {field('Serial No', 'serial_No', 'text', 'e.g. CT-001')}
            {field('Date', 'Date', 'date')}
          </div>
        </div>
      </div>

      {/* ── SLICE THICKNESS ── */}
      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple-mid">📐 Slice Thickness (mm)</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('1.5 mm  (spec: 1.5)', 'st15', 'number', '1.5')}
            {field('5 mm  (spec: 5.0)',   'st5',  'number', '5.0')}
            {field('10 mm  (spec: 10.0)', 'st10', 'number', '10.0')}
          </div>
        </div>
      </div>

      {/* ── KV ACCURACY ── */}
      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple-dark">⚡ KV Accuracy</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('80 kV  (spec: 80)',   'kv80',  'number', '80')}
            {field('110 kV  (spec: 110)', 'kv110', 'number', '110')}
            {field('130 kV  (spec: 130)', 'kv130', 'number', '130')}
          </div>
        </div>
      </div>

      {/* ── TIMER ACCURACY ── */}
      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple">⏱ Timer Accuracy</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('0.8 s  (spec: 0.8)', 't08', 'number', '0.8')}
            {field('1.0 s  (spec: 1.0)', 't1',  'number', '1.0')}
            {field('1.5 s  (spec: 1.5)', 't15', 'number', '1.5')}
          </div>
        </div>
      </div>

      {/* ── RADIATION DOSE ── */}
      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple-dark">☢️ Radiation Dose (mGy)</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('Head  (spec: 21.50)', 'dhead', 'number', '21.50')}
            {field('Body  (spec: 10.60)', 'dbody', 'number', '10.60')}
          </div>
        </div>
      </div>

      {/* ── CONTRAST RESOLUTION ── */}
      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple-mid">🔬 Contrast Resolution (lp/cm)</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('Low Contrast  (spec: ≤5.0)', 'lcr', 'number', '5.0')}
            {field('High Contrast  (spec: 6.24)', 'hcr', 'number', '6.24')}
          </div>
        </div>
      </div>

      {/* ── LEAKAGE ── */}
      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header gray">🛡️ Radiation Leakage (mR/hr)</div>
        <div className="section-body">
          <div className="leak-grid mb">
            {field('🔼 Front', 'lf', 'number', '0.0')}
            {field('🔽 Back',  'lb', 'number', '0.0')}
            {field('◀️ Left',  'll', 'number', '0.0')}
            {field('▶️ Right', 'lr', 'number', '0.0')}
          </div>
        </div>
      </div>

      {/* ── SUBMIT ── */}
      <button
        className="btn"
        onClick={handleSubmitClick}
        disabled={loading}
        style={submitAttempted && totalErrors > 0 ? {
          background: 'rgba(255,255,255,0.12)',
          boxShadow:  'none',
          cursor:     'not-allowed',
        } : {}}
      >
        {loading
          ? <><span className="spinner" />Analysing...</>
          : submitAttempted && totalErrors > 0
            ? `🚫 Fix ${totalErrors} error${totalErrors > 1 ? 's' : ''} to continue`
            : '🔍 Run QC Analysis'}
      </button>

      <p style={{
        fontSize: '0.71rem', color: 'rgba(255,255,255,0.35)',
        textAlign: 'center', marginTop: '8px',
      }}>
        Fields marked <span style={{ color: '#e08888' }}>*</span> are required.
        Press <kbd style={{
          background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)',
          borderRadius: '3px', padding: '1px 5px', fontSize: '0.68rem',
        }}>Enter</kbd> to advance to the next field.
      </p>

    </div>
  )
}

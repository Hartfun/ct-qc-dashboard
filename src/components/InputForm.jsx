import { useState, useRef, useCallback } from 'react'

// Ordered list of every field id — defines the Enter-key navigation sequence
const FIELD_ORDER = [
  'serial_No', 'Date',
  'st15', 'st5', 'st10',
  'kv80', 'kv110', 'kv130',
  't08', 't1', 't15',
  'dhead', 'dbody',
  'lcr', 'hcr',
  'lf', 'lb', 'll', 'lr',
]

export default function InputForm({ form, onChange, onSubmit, loading }) {
  const [focused,   setFocused]   = useState(null)
  const [dateError, setDateError] = useState('')   // future-date error message
  const inputRefs = useRef({})                     // id → DOM input ref

  // Focus the next field in FIELD_ORDER when Enter is pressed
  const handleKeyDown = useCallback((e, id) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const idx  = FIELD_ORDER.indexOf(id)
    const next = FIELD_ORDER[idx + 1]
    if (next && inputRefs.current[next]) {
      inputRefs.current[next].focus()
    } else {
      // Last field — submit
      onSubmit()
    }
  }, [onSubmit])

  // Validate date: must not be in the future
  const validateDate = useCallback((val) => {
    if (!val) { setDateError(''); return }
    const entered = new Date(val)
    const today   = new Date()
    today.setHours(0, 0, 0, 0)   // compare dates only, ignore time
    if (entered > today) {
      setDateError('Date cannot be in the future — please enter the actual test date.')
    } else {
      setDateError('')
    }
  }, [])

  // Collect a ref for each input
  const setRef = (id) => (el) => { inputRefs.current[id] = el }

  // Generic field renderer
  const field = (label, id, type = 'number', placeholder = '') => (
    <div
      className="field"
      key={id}
      style={{ transform: focused === id ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.15s' }}
    >
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={setRef(id)}
        type={type}
        step="any"
        value={form[id]}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => {
          onChange(id, e.target.value)
          if (id === 'Date') validateDate(e.target.value)
        }}
        onFocus={() => setFocused(id)}
        onBlur={e => {
          setFocused(null)
          if (type === 'number') onChange(id, parseFloat(e.target.value) || '')
          if (id === 'Date') validateDate(e.target.value)
        }}
        onKeyDown={e => handleKeyDown(e, id)}
        // Red border when date is invalid
        style={id === 'Date' && dateError ? {
          borderColor: '#e05555',
          boxShadow:   '0 0 0 3px rgba(220,60,60,0.20)',
        } : {}}
      />

      {/* Future-date error annotation — only shown on the Date field */}
      {id === 'Date' && dateError && (
        <div style={{
          display:      'flex',
          alignItems:   'flex-start',
          gap:          '6px',
          marginTop:    '6px',
          padding:      '7px 10px',
          background:   'rgba(220,60,60,0.15)',
          border:       '1px solid rgba(220,60,60,0.40)',
          borderRadius: '6px',
          fontSize:     '0.75rem',
          lineHeight:   '1.4',
          color:        '#ffaaaa',
          animation:    'fadeUp 0.2s ease both',
        }}>
          <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>⚠️</span>
          <span>{dateError}</span>
        </div>
      )}
    </div>
  )

  const hasDateError = Boolean(dateError)

  return (
    <div className="card">

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

      {/* Submit — disabled while date error is active */}
      <button
        className="btn"
        onClick={onSubmit}
        disabled={loading || hasDateError}
        title={hasDateError ? 'Fix the date error before submitting' : ''}
      >
        {loading
          ? <><span className="spinner" />Analysing...</>
          : '🔍 Run QC Analysis'}
      </button>

    </div>
  )
}

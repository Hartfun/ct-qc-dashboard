import { useState } from 'react'

export default function InputForm({ form, onChange, onSubmit, loading }) {
  const [focused, setFocused] = useState(null)

  const field = (label, id, type = 'number', placeholder = '') => (
    <div
      className="field"
      key={id}
      style={{ transform: focused === id ? 'scale(1.02)' : 'scale(1)', transition: 'transform 0.15s' }}
    >
      <label>{label}</label>
      <input
        type={type} step="any" value={form[id]}
        placeholder={placeholder}
        onChange={e => onChange(id, e.target.value)}
        onFocus={() => setFocused(id)}
        onBlur={e => {
          setFocused(null)
          if (type === 'number') onChange(id, parseFloat(e.target.value) || '')
        }}
      />
    </div>
  )

  return (
    <div className="card">

      <div className="section-group">
        <div className="section-header purple">📋 CT Scanner Test Record</div>
        <div className="section-body bg-gray-pale">
          <div className="grid mb">
            {field('Serial No', 'serial_No', 'text', 'e.g. CT-001')}
            {field('Date', 'Date', 'date')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple-mid">📐 Slice Thickness (mm)</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('1.5 mm  (spec: 1.5)', 'st15', 'number', '1.5')}
            {field('5 mm  (spec: 5.0)', 'st5', 'number', '5.0')}
            {field('10 mm  (spec: 10.0)', 'st10', 'number', '10.0')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple-dark">⚡ KV Accuracy</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('80 kV  (spec: 80)', 'kv80', 'number', '80')}
            {field('110 kV  (spec: 110)', 'kv110', 'number', '110')}
            {field('130 kV  (spec: 130)', 'kv130', 'number', '130')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple">⏱ Timer Accuracy</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('0.8 s  (spec: 0.8)', 't08', 'number', '0.8')}
            {field('1.0 s  (spec: 1.0)', 't1', 'number', '1.0')}
            {field('1.5 s  (spec: 1.5)', 't15', 'number', '1.5')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple-dark">☢️ Radiation Dose (mGy)</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('Head  (spec: 21.50)', 'dhead', 'number', '21.50')}
            {field('Body  (spec: 10.60)', 'dbody', 'number', '10.60')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header purple-mid">🔬 Contrast Resolution (lp/cm)</div>
        <div className="section-body bg-purple-pale">
          <div className="grid mb">
            {field('Low Contrast  (spec: ≤5.0)', 'lcr', 'number', '5.0')}
            {field('High Contrast  (spec: 6.24)', 'hcr', 'number', '6.24')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{ marginTop: '12px' }}>
        <div className="section-header gray">🛡️ Radiation Leakage (mR/hr)</div>
        <div className="section-body">
          <div className="leak-grid mb">
            {field('🔼 Front', 'lf', 'number', '0.0')}
            {field('🔽 Back', 'lb', 'number', '0.0')}
            {field('◀️ Left', 'll', 'number', '0.0')}
            {field('▶️ Right', 'lr', 'number', '0.0')}
          </div>
        </div>
      </div>

      <button className="btn" onClick={onSubmit} disabled={loading}>
        {loading ? <><span className="spinner" />Analysing...</> : '🔍 Run QC Analysis'}
      </button>

    </div>
  )
}

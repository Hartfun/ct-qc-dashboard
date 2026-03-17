import { useState } from 'react'

export default function InputForm({ form, onChange, onSubmit, loading }) {
  const [focused, setFocused] = useState(null)

  const field = (label, id, type = 'number') => (
    <div className="field" key={id} style={{
      transform: focused === id ? 'scale(1.02)' : 'scale(1)',
      transition: 'transform 0.15s'
    }}>
      <label>{label}</label>
      <input
        type={type} step="any" value={form[id]}
        onChange={e => onChange(id, e.target.value)}
        onFocus={() => setFocused(id)}
        onBlur={e => {
          setFocused(null)
          if (type === 'number') onChange(id, parseFloat(e.target.value) || 0)
        }}
      />
    </div>
  )

  return (
    <div className="card">

      <div className="section-group">
        <div className="section-header teal">📋 CT Scanner Test Record</div>
        <div className="section-body bg-gray-pale">
          <div className="grid mb">
            {field('Serial No', 'serial_No', 'text')}
            {field('Date', 'Date', 'date')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header teal-mid">📐 Slice Thickness (mm)</div>
        <div className="section-body bg-teal-pale">
          <div className="grid mb">
            {field('1.5 mm (±0.5)', 'st15')}
            {field('5 mm (±2.5%)', 'st5')}
            {field('10 mm (±5.0)', 'st10')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header orange">⚡ KV Accuracy</div>
        <div className="section-body bg-orange-pale">
          <div className="grid mb">
            {field('80 kV (±2kV)', 'kv80')}
            {field('110 kV (±2kV)', 'kv110')}
            {field('130 kV (±2kV)', 'kv130')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header teal">⏱ Timer Accuracy</div>
        <div className="section-body bg-teal-pale">
          <div className="grid mb">
            {field('0.8s (±10%)', 't08')}
            {field('1.0s (±10%)', 't1')}
            {field('1.5s (±10%)', 't15')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header orange">☢️ Radiation Dose</div>
        <div className="section-body bg-orange-pale">
          <div className="grid mb">
            {field('Head 21.50 (±20%)', 'dhead')}
            {field('Body 10.60 (±20%)', 'dbody')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header gray">🔬 Leakage (mR/hr) — AERB Limit: 115</div>
        <div className="section-body">
          <div className="leak-grid mb">
            {field('🔼 Front', 'lf')}
            {field('🔽 Back', 'lb')}
            {field('◀️ Left', 'll')}
            {field('▶️ Right', 'lr')}
          </div>
        </div>
      </div>

      <button className="btn" onClick={onSubmit} disabled={loading}>
        {loading ? <><span className="spinner" />Analysing...</> : '🔍 Run QC Analysis'}
      </button>

    </div>
  )
}

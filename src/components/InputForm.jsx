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
            {field('1.5 mm', 'st15')}
            {field('5 mm', 'st5')}
            {field('10 mm', 'st10')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header orange">⚡ KV Accuracy</div>
        <div className="section-body bg-orange-pale">
          <div className="grid mb">
            {field('80 kV', 'kv80')}
            {field('110 kV', 'kv110')}
            {field('130 kV', 'kv130')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header teal">⏱ Timer Accuracy</div>
        <div className="section-body bg-teal-pale">
          <div className="grid mb">
            {field('0.8s', 't08')}
            {field('1.0s', 't1')}
            {field('1.5s', 't15')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header orange">☢️ Radiation Dose</div>
        <div className="section-body bg-orange-pale">
          <div className="grid mb">
            {field('Head', 'dhead')}
            {field('Body', 'dbody')}
          </div>
        </div>
      </div>

      <div className="section-group" style={{marginTop:'12px'}}>
        <div className="section-header gray">🔬 Leakage (mR/hr)</div>
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

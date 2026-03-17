import { useState, useEffect } from 'react'
import InputForm from './components/InputForm'
import ResultCard from './components/ResultCard'
import ParameterTable from './components/ParameterTable'

const API = 'https://ct-qc-ml.onrender.com'

const defaultValues = {
  serial_No: '',
  Date: '',
  st15: '', st5: '', st10: '',
  kv80: '', kv110: '', kv130: '',
  t08: '', t1: '', t15: '',
  dhead: '', dbody: '',
  lf: '', lb: '', ll: '', lr: ''
}

const placeholders = {
  serial_No: 'e.g. 138249',
  Date: '',
  st15: '1.5', st5: '5.0', st10: '10.0',
  kv80: '80', kv110: '110', kv130: '130',
  t08: '0.8', t1: '1.0', t15: '1.5',
  dhead: '21.50', dbody: '10.60',
  lf: '0.0', lb: '0.0', ll: '0.0', lr: '0.0'
}

const field = (label, id, type = 'number') => (
  <div className="field" key={id} style={{
    transform: focused === id ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 0.15s'
  }}>
    <label>{label}</label>
    <input
      type={type}
      step="any"
      value={form[id]}
      placeholder={placeholders[id] || ''}
      onChange={e => onChange(id, e.target.value)}
      onFocus={() => setFocused(id)}
      onBlur={e => {
        setFocused(null)
        if (type === 'number' && e.target.value !== '')
          onChange(id, parseFloat(e.target.value) || 0)
      }}
    />
  </div>
)

export default function App() {
  const [form, setForm]           = useState(defaultValues)
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [apiOnline, setApiOnline] = useState(false)
  const [apiMsg, setApiMsg]       = useState('Checking API...')
  const [error, setError]         = useState(null)
  const [resultKey, setResultKey] = useState(0)

  useEffect(() => {
    fetch(API + '/health')
      .then(r => r.json())
      .then(() => {
        setApiOnline(true)
        setApiMsg('API Online — ct-qc-ml.onrender.com')
      })
      .catch(() => setApiMsg('API waking up... (~30s)'))
  }, [])

  const handleChange = (id, val) => setForm(f => ({ ...f, [id]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    const body = {
      'serial No': form.serial_No,
      'Date': form.Date,
      'Slice thickness 1.5': parseFloat(form.st15),
      'Slice thickness 5': parseFloat(form.st5),
      'Slice thickness 10': parseFloat(form.st10),
      'KV accuracy 80': parseFloat(form.kv80),
      'KV accuracy 110': parseFloat(form.kv110),
      'KV accuracy 130': parseFloat(form.kv130),
      'Accuracy Timer 0.8': parseFloat(form.t08),
      'Accuracy Timer 1': parseFloat(form.t1),
      'Accuracy Timer 1.5': parseFloat(form.t15),
      'Radiation Dose Test (Head) 21.50': parseFloat(form.dhead),
      'Radiation Dose Test (Body) 10.60': parseFloat(form.dbody),
      'Radiation Leakage Levels (Front)': parseFloat(form.lf),
      'Radiation Leakage Levels (Back)': parseFloat(form.lb),
      'Radiation Leakage Levels (Left)': parseFloat(form.ll),
      'Radiation Leakage Levels (Right)': parseFloat(form.lr)
    }

    try {
      const res = await fetch(API + '/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setResultKey(k => k + 1)
      setResult(data)
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (e) {
      setError(e.message)
    }

    setLoading(false)
  }

  return (
    <>
      <header>
        <div className="header-inner">
          <div className="header-left">
            <div className="header-logo">🏥</div>
            <div>
              <h1>CT QC Anomaly Detection</h1>
              <div className="subtitle">ISO + LOF Ensemble Model &nbsp;|&nbsp; MSc Big Data 2026</div>
            </div>
          </div>
          <div className="status-bar">
            <div className={`dot ${apiOnline ? 'online' : ''}`} />
            <span>{apiMsg}</span>
          </div>
        </div>
        <div className="header-bar" />
      </header>

      <div className="container">
        <InputForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          loading={loading}
        />

        <div id="result-section">
          {error && (
            <div className="result fail">
              <h2>❌ Connection Error</h2>
              <p>{error}</p>
            </div>
          )}
          {result && <ResultCard key={resultKey} result={result} />}
          {result && <ParameterTable key={resultKey + 'table'} breakdown={result.parameter_breakdown} />}
        </div>
      </div>
    </>
  )
}

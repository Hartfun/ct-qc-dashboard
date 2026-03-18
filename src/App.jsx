import { useState, useEffect } from 'react'
import InputForm from './components/InputForm'
import ResultCard from './components/ResultCard'
import ParameterTable from './components/ParameterTable'
import logoUrl from './assets/logo_Wp.svg'

const API = 'https://ct-qc-ml.onrender.com'

const defaultValues = {
  serial_No: '', Date: '',
  st15: '', st5: '', st10: '',
  kv80: '', kv110: '', kv130: '',
  t08: '', t1: '', t15: '',
  dhead: '', dbody: '',
  lcr: '', hcr: '',          // FIX: added missing Low/High Contrast Resolution fields
  lf: '', lb: '', ll: '', lr: ''
}

export default function App() {
  const [form, setForm]             = useState(defaultValues)
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [apiOnline, setApiOnline]   = useState(false)
  const [apiMsg, setApiMsg]         = useState('Checking API...')
  const [error, setError]           = useState(null)
  const [resultKey, setResultKey]   = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    fetch(API + '/health')
      .then(r => r.json())
      .then(() => { setApiOnline(true); setApiMsg('API Online — ct-qc-ml.onrender.com') })
      .catch(() => setApiMsg('API waking up... (~30s)'))
  }, [])

  const handleChange = (id, val) => setForm(f => ({ ...f, [id]: val }))

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    setShowResult(false)

    // FIX: key is "serial_No" (underscore) to match Pydantic ScanInput field name
    // FIX: added Low Contrast Resolution and High Contrast Resolution
    const body = {
      'serial_No':                         form.serial_No,
      'Slice thickness 1.5':               parseFloat(form.st15),
      'Slice thickness 5':                 parseFloat(form.st5),
      'Slice thickness 10':                parseFloat(form.st10),
      'KV accuracy 80':                    parseFloat(form.kv80),
      'KV accuracy 110':                   parseFloat(form.kv110),
      'KV accuracy 130':                   parseFloat(form.kv130),
      'Accuracy Timer 0.8':                parseFloat(form.t08),
      'Accuracy Timer 1':                  parseFloat(form.t1),
      'Accuracy Timer 1.5':                parseFloat(form.t15),
      'Radiation Dose Test (Head) 21.50':  parseFloat(form.dhead),
      'Radiation Dose Test (Body) 10.60':  parseFloat(form.dbody),
      'Low Contrast Resolution 5.0':       parseFloat(form.lcr),
      'High Contrast Resolution 6.24':     parseFloat(form.hcr),
      'Radiation Leakage Levels (Front)':  parseFloat(form.lf),
      'Radiation Leakage Levels (Back)':   parseFloat(form.lb),
      'Radiation Leakage Levels (Left)':   parseFloat(form.ll),
      'Radiation Leakage Levels (Right)':  parseFloat(form.lr),
    }

    try {
      const res = await fetch(API + '/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      setResultKey(k => k + 1)
      setResult(data)
      setTimeout(() => {
        document.getElementById('result-section')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
            <img
              src={logoUrl} alt="Logo"
              style={{ height: '66px', width: 'auto', filter: 'brightness(0) invert(1)', objectFit: 'contain' }}
            />
            <div>
              <h1>CT QC Anomaly Detection</h1>
              <div className="subtitle">ISO + LOF Ensemble Model</div>
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
        <InputForm form={form} onChange={handleChange} onSubmit={handleSubmit} loading={loading} />

        <div id="result-section">
          {error && (
            <div className="result fail">
              <h2>❌ Connection Error</h2>
              <p>{error}</p>
            </div>
          )}

          {result && (
            <ParameterTable
              key={resultKey + 'table'}
              breakdown={result.parameter_breakdown}
              onComplete={() => setShowResult(true)}
            />
          )}

          {result && (
            <ResultCard
              key={resultKey}
              result={result}
              show={showResult}
            />
          )}
        </div>
      </div>
    </>
  )
}

import { useEffect, useState } from 'react'

function AnimatedNumber({ value, decimals = 4 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const target = parseFloat(value)
    let i = 0
    const steps = 40
    const timer = setInterval(() => {
      i++
      setDisplay(target * (i / steps))
      if (i >= steps) clearInterval(timer)
    }, 18)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display.toFixed(decimals)}</span>
}

function getDescription(d) {
  const failedParams = Object.entries(d.parameter_breakdown)
    .filter(([, v]) => !v.pass)
    .map(([k]) => k)

  const leakNote = !d.leakage_pass
    ? `Radiation leakage of ${d.leakage_max} mR/hr exceeds the AERB limit of 115 mR/hr. `
    : ''

  if (!d.overall_acceptance) {
    return `❌ This scanner was rejected. ${leakNote}${failedParams.length > 0
      ? `The following parameters exceeded their tolerance limits: ${failedParams.join(', ')}.`
      : ''} Immediate inspection and recalibration is recommended before clinical use.`
  }

  if (d.anomaly_detected) {
    const iso = d.iso_score.toFixed(3)
    const lof = d.lof_score.toFixed(3)
    return `⚠️ All individual parameters are within spec, but the ML ensemble flagged an anomaly 
    (Ensemble Score ${d.ensemble_score.toFixed(3)} < Threshold ${d.threshold.toFixed(5)}). 
    The LOF score of ${lof} indicates this scanner's readings are statistically unusual compared 
    to similar scanners in training data. Accepted for use — but recommend close monitoring at next scheduled QC.`
  }

  return `✅ This scanner passed all ${Object.keys(d.parameter_breakdown).length} parameter checks 
  with no anomalies detected by the ML model. Ensemble score of ${d.ensemble_score.toFixed(3)} is 
  above the threshold of ${d.threshold.toFixed(5)}, confirming normal operation. 
  ${d.leakage_pass ? `Max leakage of ${d.leakage_max} mR/hr is well within the 115 mR/hr AERB limit.` : ''} 
  Cleared for clinical use.`
}

export default function ResultCard({ result: d, show }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setTimeout(() => setVisible(true), 200)
    }
  }, [show])

  if (!show) return null

  const cls   = d.overall_acceptance ? (d.anomaly_detected ? 'anomaly' : 'pass') : 'fail'
  const icon  = d.overall_acceptance ? (d.anomaly_detected ? '⚠️' : '✅') : '❌'
  const title = d.overall_acceptance
    ? (d.anomaly_detected ? 'ACCEPTED — ML Anomaly Flagged' : 'ACCEPTED — All Clear')
    : 'REJECTED — Parameter Failure'

  return (
    <div
      className={`result ${cls}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'
      }}
    >
      <h2>{icon} {title}</h2>

      {/* Description */}
      <div style={{
        background: 'rgba(255,255,255,0.65)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '0.85rem',
        lineHeight: '1.65',
        color: '#333',
        marginBottom: '16px',
        borderLeft: '3px solid currentColor'
      }}>
        {getDescription(d)}
      </div>

      <div className="scores">
        {[
          { val: d.iso_score,      dec: 4, label: 'ISO Score' },
          { val: d.lof_score,      dec: 4, label: 'LOF Score' },
          { val: d.ensemble_score, dec: 4, label: 'Ensemble Score' },
          { val: d.threshold,      dec: 5, label: 'Threshold' },
        ].map(({ val, dec, label }) => (
          <div className="score-box" key={label}>
            <div className="val"><AnimatedNumber value={val} decimals={dec} /></div>
            <div className="lbl">{label}</div>
          </div>
        ))}
        <div className="score-box">
          <div className="val">
            {d.leakage_max}
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}> mR/hr</span>
          </div>
          <div className="lbl">Leakage Max {d.leakage_pass ? '✅' : '❌'}</div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

function AnimatedNumber({ value, decimals = 4 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const target = parseFloat(value)
    if (isNaN(target)) return
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
  // FIX: leakage lives in parameter_breakdown.Leakage, not at the top level of the API response
  const leakage    = d.parameter_breakdown?.Leakage ?? {}
  const leakPass   = leakage.pass    ?? true
  const leakMaxRaw = leakage.max_raw ?? 0

  const failedParams = Object.entries(d.parameter_breakdown ?? {})
    .filter(([k, v]) => k !== 'Leakage' && !v.pass)
    .map(([k]) => k)

  const leakNote = !leakPass
    ? `Radiation leakage of ${leakMaxRaw} mR/hr exceeds the AERB limit of 115 mR/hr. `
    : ''

  if (!d.overall_acceptance) {
    return `❌ This scanner was rejected. ${leakNote}${
      failedParams.length > 0
        ? `The following parameters exceeded their tolerance limits: ${failedParams.join(', ')}.`
        : ''
    } Immediate inspection and recalibration is recommended before clinical use.`
  }

  if (d.anomaly_detected) {
    return (
      `⚠️ All individual parameters are within spec, but the ML ensemble flagged an anomaly ` +
      `(Ensemble Score ${d.ensemble_score.toFixed(3)} < Threshold ${d.threshold.toFixed(5)}). ` +
      `The LOF score of ${d.lof_score.toFixed(3)} indicates this scanner's readings are statistically ` +
      `unusual compared to similar scanners in training data. ` +
      `Accepted for use — but recommend close monitoring at next scheduled QC.`
    )
  }

  const paramCount = Object.keys(d.parameter_breakdown ?? {}).length
  return (
    `✅ This scanner passed all ${paramCount} parameter checks ` +
    `with no anomalies detected by the ML model. Ensemble score of ${d.ensemble_score.toFixed(3)} ` +
    `is above the threshold of ${d.threshold.toFixed(5)}, confirming normal operation. ` +
    (leakPass ? `Max leakage of ${leakMaxRaw} mR/hr is well within the 115 mR/hr AERB limit. ` : '') +
    `Cleared for clinical use.`
  )
}

export default function ResultCard({ result: d, show }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) setTimeout(() => setVisible(true), 200)
  }, [show])

  if (!show) return null

  // FIX: pull leakage from correct nested location
  const leakage    = d.parameter_breakdown?.Leakage ?? {}
  const leakPass   = leakage.pass    ?? true
  const leakMaxRaw = leakage.max_raw ?? 0

  const cls   = d.overall_acceptance ? (d.anomaly_detected ? 'anomaly' : 'pass') : 'fail'
  const icon  = d.overall_acceptance ? (d.anomaly_detected ? '⚠️' : '✅') : '❌'
  const title = d.overall_acceptance
    ? (d.anomaly_detected ? 'ACCEPTED — ML Anomaly Flagged' : 'ACCEPTED — All Clear')
    : 'REJECTED — Parameter Failure'

  return (
    <div
      className={`result ${cls}`}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'scale(1)' : 'scale(0.95)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)'
      }}
    >
      <h2>{icon} {title}</h2>

      <div style={{
        background:   'rgba(255,255,255,0.18)',
        borderRadius: '8px',
        padding:      '12px 16px',
        fontSize:     '0.85rem',
        lineHeight:   '1.65',
        color:        'rgba(255,255,255,0.92)',
        marginBottom: '16px',
        borderLeft:   '3px solid rgba(255,255,255,0.5)'
      }}>
        {getDescription(d)}
      </div>

      <div className="scores">
        {[
          { val: d.iso_score,      dec: 4, label: 'ISO Score'      },
          { val: d.lof_score,      dec: 4, label: 'LOF Score'      },
          { val: d.ensemble_score, dec: 4, label: 'Ensemble Score' },
          { val: d.threshold,      dec: 5, label: 'Threshold'      },
        ].map(({ val, dec, label }) => (
          <div className="score-box" key={label}>
            <div className="val"><AnimatedNumber value={val} decimals={dec} /></div>
            <div className="lbl">{label}</div>
          </div>
        ))}

        <div className="score-box">
          <div className="val">
            {leakMaxRaw}
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}> mR/hr</span>
          </div>
          <div className="lbl">Leakage Max {leakPass ? '✅' : '❌'}</div>
        </div>
      </div>
    </div>
  )
}

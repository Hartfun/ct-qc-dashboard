export default function ResultCard({ result: d }) {
  const cls   = d.overall_acceptance ? (d.anomaly_detected ? 'anomaly' : 'pass') : 'fail'
  const icon  = d.overall_acceptance ? (d.anomaly_detected ? '⚠️' : '✅') : '❌'
  const title = d.overall_acceptance
    ? (d.anomaly_detected ? 'ACCEPTED — ML Anomaly Flagged' : 'ACCEPTED — All Clear')
    : 'REJECTED — Parameter Failure'

  return (
    <div className={`result ${cls}`}>
      <h2>{icon} {title}</h2>
      <div className="scores">
        <div className="score-box"><div className="val">{d.iso_score.toFixed(4)}</div><div className="lbl">ISO Score</div></div>
        <div className="score-box"><div className="val">{d.lof_score.toFixed(4)}</div><div className="lbl">LOF Score</div></div>
        <div className="score-box"><div className="val">{d.ensemble_score.toFixed(4)}</div><div className="lbl">Ensemble Score</div></div>
        <div className="score-box"><div className="val">{d.threshold.toFixed(5)}</div><div className="lbl">Threshold</div></div>
        <div className="score-box">
          <div className="val">{d.leakage_max} mR/hr</div>
          <div className="lbl">Leakage Max {d.leakage_pass ? '✅' : '❌'}</div>
        </div>
      </div>
    </div>
  )
}

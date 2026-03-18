import { useEffect, useState } from 'react'

function DevBar({ pct, tolerance }) {
  const [width, setWidth] = useState(0)
  const ratio = Math.min((Math.abs(pct) / (tolerance || 1)) * 100, 100)
  const cls   = ratio < 50 ? '' : ratio < 80 ? 'warn' : 'danger'
  useEffect(() => {
    const t = setTimeout(() => setWidth(ratio), 100)
    return () => clearTimeout(t)
  }, [ratio])
  return (
    <div>
      <span style={{ fontSize: '0.82rem' }}>{pct.toFixed(2)}%</span>
      <div className="progress-wrap">
        <div className={`progress-bar ${cls}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  )
}

export default function ParameterTable({ breakdown, onComplete }) {
  // Separate imaging params from the Leakage summary
  const entries = Object.entries(breakdown).filter(([k]) => k !== 'Leakage')
  const leakage = breakdown?.Leakage

  // Build one flat list: imaging rows + leakage row at the end
  const allRows = [
    ...entries.map(([k, v]) => ({ key: k, ...v })),
    ...(leakage ? [{
      key:           'Leakage (Max)',
      value:         leakage.max_raw,
      spec:          leakage.limit,
      tolerance:     leakage.limit,
      pct_deviation: leakage.norm != null ? ((leakage.norm - leakage.limit) / leakage.limit) * 100 : 0,
      pass:          leakage.pass,
    }] : []),
  ]

  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    setVisibleCount(0)
    let i = 0
    const timer = setInterval(() => {
      i++
      setVisibleCount(i)
      if (i >= allRows.length) {
        clearInterval(timer)
        setTimeout(() => onComplete && onComplete(), 400)
      }
    }, 280)
    return () => clearInterval(timer)
  }, [breakdown])

  return (
    <div className="card">
      <h2>📊 Parameter Breakdown</h2>

      {/* ── DESKTOP TABLE ── */}
      <div className="table-desktop">
        <table>
          <thead>
            <tr>
              <th>Parameter</th><th>Measured</th><th>Spec</th>
              <th>Tolerance</th><th>Deviation</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((v, idx) =>
              idx < visibleCount ? (
                <tr className="table-row" key={v.key} style={{ animation: 'slideIn 0.35s ease both' }}>
                  <td style={{ fontWeight: 500 }}>{v.key}</td>
                  <td><b>{v.value}</b></td>
                  <td style={{ color: '#9b89e8' }}>{v.spec}</td>
                  <td style={{ color: '#9b89e8' }}>±{v.tolerance}</td>
                  <td><DevBar pct={v.pct_deviation ?? 0} tolerance={Math.abs(v.tolerance || 1)} /></td>
                  <td><span className={`badge ${v.pass ? 'pass' : 'fail'}`}>{v.pass ? '✅ PASS' : '❌ FAIL'}</span></td>
                </tr>
              ) : (
                <tr key={v.key} style={{ opacity: 0.12 }}>
                  <td style={{ color: '#555', fontWeight: 500 }}>{v.key}</td>
                  <td colSpan={5}>
                    <div style={{
                      height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px',
                      margin: '6px 0', animation: 'shimmer 1.2s ease-in-out infinite',
                      width: `${40 + (idx * 17) % 40}%`
                    }} />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="table-mobile">
        {allRows.map((v, idx) =>
          idx < visibleCount ? (
            <div key={v.key} className="param-card" style={{ animation: 'slideIn 0.35s ease both' }}>
              <div className="param-name">{v.key}</div>
              <div className="param-row">
                <div className="param-cell">
                  <span className="param-label">Measured</span>
                  <span className="param-value"><b>{v.value}</b></span>
                </div>
                <div className="param-cell">
                  <span className="param-label">Spec</span>
                  <span className="param-value">{v.spec}</span>
                </div>
                <div className="param-cell">
                  <span className="param-label">Tolerance</span>
                  <span className="param-value">±{v.tolerance}</span>
                </div>
              </div>
              <div className="param-full-row">
                <span className="param-label">Deviation</span>
                <DevBar pct={v.pct_deviation ?? 0} tolerance={Math.abs(v.tolerance || 1)} />
              </div>
              <div className="param-full-row param-status-row">
                <span className="param-label">Status</span>
                <span className={`badge ${v.pass ? 'pass' : 'fail'}`}>{v.pass ? '✅ PASS' : '❌ FAIL'}</span>
              </div>
            </div>
          ) : (
            <div key={v.key} className="param-card" style={{ opacity: 0.15 }}>
              <div className="param-name" style={{ color: 'rgba(255,255,255,0.2)' }}>{v.key}</div>
              <div style={{
                height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px',
                margin: '8px 0', animation: 'shimmer 1.2s ease-in-out infinite',
                width: `${40 + (idx * 17) % 40}%`
              }} />
            </div>
          )
        )}
      </div>

      {/* ── Progress ── */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '6px' }}>
          <span>Checking parameters...</span>
          <span>{Math.min(visibleCount, allRows.length)} / {allRows.length}</span>
        </div>
        <div className="progress-wrap" style={{ height: '7px' }}>
          <div className="progress-bar" style={{
            width: `${(Math.min(visibleCount, allRows.length) / allRows.length) * 100}%`,
            transition: 'width 0.3s ease',
            background: visibleCount >= allRows.length ? '#6a5acd' : '#9b89e8'
          }} />
        </div>
      </div>
    </div>
  )
}

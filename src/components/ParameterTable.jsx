import { useEffect, useState } from 'react'

// oneSided=true means the metric has an upper limit only (lower = better, e.g. Low Contrast).
// For one-sided: bar fills red when pct > 0 (above limit), green when pct <= 0 (below limit).
// For two-sided (default): bar fills based on |pct| vs tolerance bands.
function DevBar({ pct, tolerance, oneSided = false }) {
  const [width, setWidth] = useState(0)
  let ratio, cls
  if (oneSided) {
    // Show how far above/below the upper limit the reading is (cap at 100%)
    ratio = Math.min(Math.abs(pct), 100)
    cls   = pct > 0 ? 'danger' : ''   // above limit = red, at/below = green (no class = teal)
  } else {
    ratio = Math.min((Math.abs(pct) / (tolerance || 1)) * 100, 100)
    cls   = ratio < 50 ? '' : ratio < 80 ? 'warn' : 'danger'
  }
  useEffect(() => {
    const t = setTimeout(() => setWidth(ratio), 100)
    return () => clearTimeout(t)
  }, [ratio])
  const label = oneSided
    ? (pct > 0 ? `+${pct.toFixed(2)}% above limit` : `${pct.toFixed(2)}% (within limit)`)
    : `${pct.toFixed(2)}%`
  return (
    <div>
      <span style={{ fontSize: '0.82rem', color: oneSided && pct > 0 ? '#ffaaaa' : 'inherit' }}>
        {label}
      </span>
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
      key:           'Leakage (mR/hr)',
      // Show raw max reading as the primary value. Norm shown in parentheses for reference.
      value:         `${leakage.max_raw} (norm: ${leakage.norm?.toFixed(3)})`,
      spec:          leakage.raw_limit ?? 115,   // AERB gate: 115 mR/hr
      tolerance:     leakage.raw_limit ?? 115,
      // pct_deviation = how far raw is from the 115 mR/hr AERB limit
      pct_deviation: leakage.max_raw != null
        ? ((leakage.max_raw - (leakage.raw_limit ?? 115)) / (leakage.raw_limit ?? 115)) * 100
        : 0,
      pass:          leakage.pass,
      one_sided:     true,   // one-sided upper limit: lower raw = better
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
                  <td style={{ color: '#9b89e8' }}>{v.one_sided ? `≤${v.tolerance}` : `±${v.tolerance}`}</td>
                  <td><DevBar pct={v.pct_deviation ?? 0} tolerance={Math.abs(v.tolerance || 1)} oneSided={v.one_sided ?? false} /></td>
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
                  <span className="param-value">{v.one_sided ? `≤${v.tolerance}` : `±${v.tolerance}`}</span>
                </div>
              </div>
              <div className="param-full-row">
                <span className="param-label">Deviation</span>
                <DevBar pct={v.pct_deviation ?? 0} tolerance={Math.abs(v.tolerance || 1)} oneSided={v.one_sided ?? false} />
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

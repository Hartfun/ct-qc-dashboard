import { useEffect, useState } from 'react'

function DevBar({ pct, tolerance }) {
  const [width, setWidth] = useState(0)
  const ratio = Math.min((Math.abs(pct) / tolerance) * 100, 100)
  const cls = ratio < 50 ? '' : ratio < 80 ? 'warn' : 'danger'
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
  const entries = Object.entries(breakdown)
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    setVisibleCount(0)
    let i = 0
    const timer = setInterval(() => {
      i++
      setVisibleCount(i)
      if (i >= entries.length) {
        clearInterval(timer)
        // Notify parent all rows done
        setTimeout(() => onComplete && onComplete(), 400)
      }
    }, 280)
    return () => clearInterval(timer)
  }, [breakdown])

  return (
    <div className="card">
      <h2>📊 Parameter Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Measured</th>
            <th>Spec</th>
            <th>Tolerance</th>
            <th>Deviation</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([k, v], idx) => (
            idx < visibleCount ? (
              <tr className="table-row" key={k} style={{
                animation: 'slideIn 0.35s ease both',
                opacity: 1
              }}>
                <td style={{ fontWeight: 500 }}>{k}</td>
                <td><b>{v.value}</b></td>
                <td style={{ color: '#64748b' }}>{v.spec}</td>
                <td style={{ color: '#64748b' }}>±{v.tolerance}</td>
                <td><DevBar pct={v.pct_deviation} tolerance={v.tolerance} /></td>
                <td>
                  <span className={`badge ${v.pass ? 'pass' : 'fail'}`}>
                    {v.pass ? '✅ PASS' : '❌ FAIL'}
                  </span>
                </td>
              </tr>
            ) : (
              <tr key={k} style={{ opacity: 0.12 }}>
                <td style={{ fontWeight: 500, color: '#ccc' }}>{k}</td>
                <td colSpan={5}>
                  <div style={{
                    height: '8px', background: '#E8E8E8',
                    borderRadius: '99px', margin: '6px 0',
                    animation: 'shimmer 1.2s ease-in-out infinite',
                    width: `${40 + (idx * 17) % 40}%`
                  }} />
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      {/* Progress indicator */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#888', marginBottom: '6px' }}>
          <span>Checking parameters...</span>
          <span>{visibleCount} / {entries.length}</span>
        </div>
        <div className="progress-wrap" style={{ height: '7px' }}>
          <div
            className="progress-bar"
            style={{
              width: `${(visibleCount / entries.length) * 100}%`,
              transition: 'width 0.3s ease',
              background: visibleCount === entries.length ? 'var(--teal)' : 'var(--orange)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

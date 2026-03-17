export default function ParameterTable({ breakdown }) {
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
            <th>% Deviation</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(breakdown).map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td><b>{v.value}</b></td>
              <td>{v.spec}</td>
              <td>±{v.tolerance}</td>
              <td>{v.pct_deviation.toFixed(3)}%</td>
              <td><span className={`badge ${v.pass ? 'pass' : 'fail'}`}>{v.pass ? '✅ PASS' : '❌ FAIL'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Simple SVG charts — modern style

export function LineChart({ data, height = 220, color = '#FF6700' }: {
  data: { label: string; value: number }[]; height?: number; color?: string;
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const width = 600;
  const paddingX = 30, paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2 - 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = paddingY + chartH - (d.value / max) * chartH;
    return { x, y, v: d.value, l: d.label };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${paddingY + chartH} Z`;

  const gradId = `grad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const y = paddingY + chartH * p;
        return <line key={p} x1={paddingX} y1={y} x2={paddingX + chartW} y2={y} stroke="var(--color-border)" strokeDasharray="3 3" opacity="0.5"/>;
      })}
      {/* Area */}
      <path d={areaD} fill={`url(#${gradId})`}/>
      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="2.5"/>
          <text x={p.x} y={height - 4} fontSize="11" fill="var(--color-text-muted)" textAnchor="middle" fontWeight="500">{p.l}</text>
          {p.v > 0 && <text x={p.x} y={p.y - 10} fontSize="10" fill="var(--color-text)" textAnchor="middle" fontWeight="700">{p.v}</text>}
        </g>
      ))}
    </svg>
  );
}

export function BarChart({ data, height = 220, colors = ['#FF6700', '#3A6EA5', '#06B6D4'] }: {
  data: { label: string; value: number }[]; height?: number; colors?: string[];
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const width = 600;
  const paddingX = 30, paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2 - 30;
  const barWidth = chartW / data.length * 0.6;
  const gap = chartW / data.length * 0.4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="xMidYMid meet">
      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`bar-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c}/>
            <stop offset="100%" stopColor={c} stopOpacity="0.6"/>
          </linearGradient>
        ))}
      </defs>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(p => {
        const y = paddingY + chartH * p;
        return <line key={p} x1={paddingX} y1={y} x2={paddingX + chartW} y2={y} stroke="var(--color-border)" strokeDasharray="3 3" opacity="0.5"/>;
      })}
      {data.map((d, i) => {
        const barH = (d.value / max) * chartH;
        const x = paddingX + i * (barWidth + gap) + gap / 2;
        const y = paddingY + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barH} fill={`url(#bar-${i % colors.length})`} rx="6"/>
            <text x={x + barWidth / 2} y={y - 6} fontSize="12" fill="var(--color-text)" textAnchor="middle" fontWeight="700">{d.value}</text>
            <text x={x + barWidth / 2} y={height - 6} fontSize="12" fill="var(--color-text-muted)" textAnchor="middle" fontWeight="500">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function PieChart({ data, size = 180 }: {
  data: { label: string; value: number; color: string }[]; size?: number;
}) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size / 2 - 10;
  let angle = -Math.PI / 2;
  const slices = data.map(d => {
    const sliceAngle = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sliceAngle;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`, color: d.color, label: d.label, pct: Math.round((d.value / total) * 100) };
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>
        <defs>
          <filter id="pie-shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
          </filter>
        </defs>
        <g filter="url(#pie-shadow)">
          {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} stroke="var(--color-surface)" strokeWidth="3"/>)}
        </g>
        <circle cx={cx} cy={cy} r={r / 2} fill="var(--color-surface)"/>
        <text x={cx} y={cy - 4} fontSize="20" fontWeight="800" fill="var(--color-text)" textAnchor="middle">{total}</text>
        <text x={cx} y={cy + 14} fontSize="10" fill="var(--color-text-muted)" textAnchor="middle" fontWeight="600">TOTAL</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: s.color, boxShadow: `0 2px 6px ${s.color}60` } as any}/>
            <span style={{ fontWeight: 500 }}>{s.label}</span>
            <strong style={{ color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{s.pct}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

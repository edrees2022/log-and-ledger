import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface LinePoint { day: string; total: number; accepted?: number }
interface LineChartProps {
  points: LinePoint[];
  height?: number;
  showAccepted?: boolean;
}

// Simple responsive SVG line chart (no external deps)
export const LineChart: React.FC<LineChartProps> = ({ points, height = 160, showAccepted = true }) => {
  const { t } = useTranslation();
  if (!points.length) {
    return <div className="text-xs text-muted-foreground p-4">{t('ai.noTrendData')}</div>;
  }
  const [hover, setHover] = useState<{ x: number; y: number; point: LinePoint; type: 'total' | 'accepted' } | null>(null);
  const padX = 32;
  const padY = 18;
  const w = Math.max(320, points.length * 40);
  const h = height;
  const maxTotal = Math.max(...points.map(p => p.total), 1);
  const maxAccepted = showAccepted ? Math.max(...points.map(p => p.accepted || 0), 1) : 1;
  const xScale = (idx: number) => padX + (idx / Math.max(points.length - 1, 1)) * (w - padX * 2);
  const yScaleTotal = (v: number) => h - padY - (v / maxTotal) * (h - padY * 2);
  const yScaleAccepted = (v: number) => h - padY - (v / maxAccepted) * (h - padY * 2);
  const path = points.map((p,i) => `${i===0?'M':'L'}${xScale(i)},${yScaleTotal(p.total)}`).join(' ');
  const pathAccepted = showAccepted ? points.map((p,i) => `${i===0?'M':'L'}${xScale(i)},${yScaleAccepted(p.accepted||0)}`).join(' ') : '';
  return (
    <div className="overflow-x-auto">
      <svg width={w} height={h} className="select-none">
        {/* Grid lines */}
        {Array.from({ length: 4 }).map((_,i) => {
          const y = padY + ((h - padY * 2) * i / 3);
          return <line key={i} x1={padX} x2={w-padX} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />;
        })}
        {/* Total line */}
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={2} />
        {/* Accepted line */}
        {showAccepted && <path d={pathAccepted} fill="none" stroke="#16a34a" strokeWidth={2} strokeDasharray="4 3" />}
        {/* Points */}
        {points.map((p,i) => (
          <circle
            key={p.day+':t'}
            cx={xScale(i)}
            cy={yScaleTotal(p.total)}
            r={3}
            fill="#2563eb"
            onMouseEnter={() => setHover({ x: xScale(i), y: yScaleTotal(p.total), point: p, type: 'total' })}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {showAccepted && points.map((p,i) => (
          <circle
            key={p.day+':a'}
            cx={xScale(i)}
            cy={yScaleAccepted(p.accepted||0)}
            r={3}
            fill="#16a34a"
            onMouseEnter={() => setHover({ x: xScale(i), y: yScaleAccepted(p.accepted||0), point: p, type: 'accepted' })}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {hover && (
          <g>
            <rect x={hover.x - 50} y={hover.y - 45} width={100} height={38} rx={6} fill="#1f2937" stroke="#111827" strokeWidth={1} />
            <text x={hover.x} y={hover.y - 28} fontSize={11} textAnchor="middle" fill="#fff">{hover.point.day}</text>
            <text x={hover.x} y={hover.y - 14} fontSize={11} textAnchor="middle" fill={hover.type==='total' ? '#2563eb' : '#16a34a'}>
              {hover.type==='total' ? t('ai.total', { value: hover.point.total }) : t('ai.accepted', { value: hover.point.accepted||0 })}
            </text>
            {showAccepted && hover.type==='total' && (
              <text x={hover.x} y={hover.y} fontSize={10} textAnchor="middle" fill="#16a34a">{t('ai.acc', { value: hover.point.accepted||0 })}</text>
            )}
          </g>
        )}
        {/* X labels */}
        {points.map((p,i) => (
          <text key={p.day+':x'} x={xScale(i)} y={h - 4} fontSize={10} textAnchor="middle" fill="#6b7280">{p.day.slice(5)}</text>
        ))}
        {/* Y max labels */}
        <text x={padX} y={10} fontSize={10} fill="#2563eb">{t('ai.max', { value: maxTotal })}</text>
        {showAccepted && <text x={padX+60} y={10} fontSize={10} fill="#16a34a">{t('ai.max', { value: maxAccepted })}</text>}
      </svg>
    </div>
  );
};

export default LineChart;
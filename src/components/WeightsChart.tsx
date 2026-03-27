import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { Portfolio, Asset } from '../lib/meanVariance';

interface WeightsChartProps {
  portfolio: Portfolio | null;
  assets: Asset[];
  title?: string;
  showShortPositions?: boolean;
}

export function WeightsChart({
  portfolio,
  assets,
  title = 'Portfolio Allocation',
  showShortPositions = true,
}: WeightsChartProps) {
  if (!portfolio) {
    return (
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">{title}</h2>
        <div className="h-[250px] flex items-center justify-center text-[hsl(var(--muted-foreground))]">
          Select a portfolio to see allocation
        </div>
      </div>
    );
  }

  const data = portfolio.weights.map((weight, i) => ({
    ticker: assets[i].ticker,
    name: assets[i].name,
    weight: weight * 100,
    color: assets[i].color,
    isShort: weight < 0,
  })).sort((a, b) => b.weight - a.weight);

  const hasShortPositions = data.some(d => d.isShort);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg p-3 shadow-xl">
          <div className="text-xs space-y-1">
            <div className="font-semibold text-[hsl(var(--foreground))]">{data.name}</div>
            <div className="text-[hsl(var(--muted-foreground))]">
              Weight:{' '}
              <span className={data.isShort ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--optimal))]'}>
                {data.weight.toFixed(2)}%
              </span>
              {data.isShort && <span className="ml-1">(Short)</span>}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h2>
        {hasShortPositions && showShortPositions && (
          <span className="text-xs text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/.1)] px-2 py-1 rounded">
            Contains Short Positions
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" horizontal={false} />
          <XAxis
            type="number"
            domain={hasShortPositions ? ['dataMin', 'dataMax'] : [0, 'dataMax']}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
          />
          <YAxis
            type="category"
            dataKey="ticker"
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          {hasShortPositions && (
            <ReferenceLine x={0} stroke="hsl(215, 20%, 40%)" />
          )}
          <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isShort ? 'hsl(0, 62%, 50%)' : entry.color}
                fillOpacity={entry.isShort ? 0.7 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[hsl(var(--border))]">
        <div className="text-center">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Long</div>
          <div className="text-sm font-mono text-[hsl(var(--optimal))]">
            {data.filter(d => !d.isShort).reduce((sum, d) => sum + d.weight, 0).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Short</div>
          <div className="text-sm font-mono text-[hsl(var(--destructive))]">
            {Math.abs(data.filter(d => d.isShort).reduce((sum, d) => sum + d.weight, 0)).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-[hsl(var(--muted-foreground))]">Net</div>
          <div className="text-sm font-mono text-[hsl(var(--foreground))]">
            {data.reduce((sum, d) => sum + d.weight, 0).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

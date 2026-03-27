import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import type { Portfolio, Asset } from '../lib/meanVariance';

interface EfficientFrontierChartProps {
  efficientFrontier: Portfolio[];
  minVariancePortfolio: Portfolio | null;
  maxSharpePortfolio: Portfolio | null;
  selectedPortfolio: Portfolio | null;
  assets: Asset[];
  riskFreeRate: number;
  capitalMarketLine: { x: number; y: number }[];
  onSelectPortfolio: (portfolio: Portfolio) => void;
}

export function EfficientFrontierChart({
  efficientFrontier,
  minVariancePortfolio,
  maxSharpePortfolio,
  selectedPortfolio,
  assets,
  riskFreeRate,
  capitalMarketLine,
  onSelectPortfolio,
}: EfficientFrontierChartProps) {
  // Convert frontier data for chart
  const frontierData = efficientFrontier.map((p, i) => ({
    volatility: p.volatility * 100,
    return: p.expectedReturn * 100,
    sharpe: p.sharpeRatio,
    index: i,
    portfolio: p,
  }));

  // Individual assets
  const assetData = assets.map((a) => ({
    volatility: a.volatility * 100,
    return: a.expectedReturn * 100,
    name: a.ticker,
    color: a.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg p-3 shadow-xl">
          <div className="text-xs space-y-1">
            {data.name && (
              <div className="font-semibold text-[hsl(var(--foreground))]">{data.name}</div>
            )}
            <div className="text-[hsl(var(--muted-foreground))]">
              Return: <span className="text-[hsl(var(--optimal))]">{data.return.toFixed(2)}%</span>
            </div>
            <div className="text-[hsl(var(--muted-foreground))]">
              Volatility: <span className="text-[hsl(var(--foreground))]">{data.volatility.toFixed(2)}%</span>
            </div>
            {data.sharpe !== undefined && (
              <div className="text-[hsl(var(--muted-foreground))]">
                Sharpe: <span className="text-[hsl(var(--primary))]">{data.sharpe.toFixed(3)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleChartClick = (e: any) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const clickedData = e.activePayload[0].payload;
      if (clickedData.portfolio) {
        onSelectPortfolio(clickedData.portfolio);
      }
    }
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
          Efficient Frontier
        </h2>
        <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[hsl(var(--frontier))]" />
            <span>Frontier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[hsl(var(--tangent))] opacity-60" style={{ borderStyle: 'dashed' }} />
            <span>CML</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--optimal))]" />
            <span>Max Sharpe</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
          onClick={handleChartClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 14%)" />
          <XAxis
            dataKey="volatility"
            type="number"
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            label={{
              value: 'Volatility (Standard Deviation)',
              position: 'bottom',
              offset: 20,
              fill: 'hsl(215, 20%, 65%)',
              fontSize: 12,
            }}
          />
          <YAxis
            dataKey="return"
            type="number"
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            stroke="hsl(215, 20%, 65%)"
            fontSize={11}
            label={{
              value: 'Expected Return',
              angle: -90,
              position: 'insideLeft',
              fill: 'hsl(215, 20%, 65%)',
              fontSize: 12,
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Risk-free rate line */}
          <ReferenceLine
            y={riskFreeRate * 100}
            stroke="hsl(215, 20%, 40%)"
            strokeDasharray="5 5"
            label={{
              value: `Rf: ${(riskFreeRate * 100).toFixed(1)}%`,
              fill: 'hsl(215, 20%, 50%)',
              fontSize: 10,
              position: 'right',
            }}
          />

          {/* Capital Market Line */}
          <Line
            data={capitalMarketLine}
            type="linear"
            dataKey="y"
            stroke="hsl(38, 92%, 50%)"
            strokeWidth={2}
            strokeDasharray="8 4"
            dot={false}
            strokeOpacity={0.6}
          />

          {/* Efficient frontier */}
          <Line
            data={frontierData}
            type="monotone"
            dataKey="return"
            stroke="hsl(262, 83%, 58%)"
            strokeWidth={3}
            dot={false}
          />

          {/* Clickable frontier points */}
          <Scatter
            data={frontierData.filter((_, i) => i % 5 === 0)}
            fill="hsl(262, 83%, 58%)"
            fillOpacity={0.5}
            r={4}
            cursor="pointer"
          />

          {/* Individual assets */}
          <Scatter
            data={assetData}
            fill="hsl(215, 20%, 65%)"
            r={8}
          />

          {/* Min variance portfolio */}
          {minVariancePortfolio && (
            <Scatter
              data={[{
                volatility: minVariancePortfolio.volatility * 100,
                return: minVariancePortfolio.expectedReturn * 100,
                sharpe: minVariancePortfolio.sharpeRatio,
                name: 'Min Variance',
              }]}
              fill="hsl(217, 91%, 60%)"
              r={10}
            />
          )}

          {/* Max Sharpe portfolio */}
          {maxSharpePortfolio && (
            <Scatter
              data={[{
                volatility: maxSharpePortfolio.volatility * 100,
                return: maxSharpePortfolio.expectedReturn * 100,
                sharpe: maxSharpePortfolio.sharpeRatio,
                name: 'Max Sharpe',
              }]}
              fill="hsl(142, 71%, 45%)"
              r={12}
            />
          )}

          {/* Selected portfolio */}
          {selectedPortfolio && (
            <Scatter
              data={[{
                volatility: selectedPortfolio.volatility * 100,
                return: selectedPortfolio.expectedReturn * 100,
                sharpe: selectedPortfolio.sharpeRatio,
                name: 'Selected',
              }]}
              fill="hsl(38, 92%, 50%)"
              r={10}
              shape="star"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 text-center">
        Click on the frontier to select a portfolio. The Capital Market Line shows optimal risk-return combinations.
      </p>
    </div>
  );
}

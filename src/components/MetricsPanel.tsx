import { TrendingUp, Shield, Zap, Target, BarChart2, Activity, AlertTriangle, Percent } from 'lucide-react';
import type { Portfolio, Asset } from '../lib/meanVariance';
import {
  calculateVaR,
  calculateCVaR,
  calculateBeta,
  calculateTreynor,
  calculateDiversificationRatio,
  generateCovarianceMatrix,
} from '../lib/meanVariance';

interface MetricsPanelProps {
  portfolio: Portfolio | null;
  assets: Asset[];
  riskFreeRate: number;
  title?: string;
}

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
  tooltip?: string;
}

function MetricCard({ label, value, subValue, icon, color }: MetricCardProps) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
          {subValue && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{subValue}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-[hsl(var(--secondary))] ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function MetricsPanel({ portfolio, assets, riskFreeRate, title = 'Portfolio Metrics' }: MetricsPanelProps) {
  if (!portfolio) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Expected Return"
            value="—"
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-[hsl(var(--optimal))]"
          />
          <MetricCard
            label="Volatility"
            value="—"
            icon={<Shield className="w-5 h-5" />}
            color="text-[hsl(var(--tangent))]"
          />
          <MetricCard
            label="Sharpe Ratio"
            value="—"
            icon={<Zap className="w-5 h-5" />}
            color="text-[hsl(var(--primary))]"
          />
          <MetricCard
            label="VaR (95%)"
            value="—"
            icon={<AlertTriangle className="w-5 h-5" />}
            color="text-[hsl(var(--destructive))]"
          />
        </div>
      </div>
    );
  }

  const covariance = generateCovarianceMatrix(assets);
  const var95 = calculateVaR(portfolio, 0.95, 1);
  const cvar95 = calculateCVaR(portfolio, 0.95, 1);
  const beta = calculateBeta(portfolio, assets, covariance);
  const treynor = calculateTreynor(portfolio, riskFreeRate, beta);
  const diversificationRatio = calculateDiversificationRatio(portfolio, assets);

  // Count positions
  const longCount = portfolio.weights.filter(w => w > 0.01).length;
  const shortCount = portfolio.weights.filter(w => w < -0.01).length;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">{title}</h2>

      {/* Primary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Expected Return"
          value={`${(portfolio.expectedReturn * 100).toFixed(2)}%`}
          subValue="Annualized"
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-[hsl(var(--optimal))]"
        />
        <MetricCard
          label="Volatility"
          value={`${(portfolio.volatility * 100).toFixed(2)}%`}
          subValue="Std. Deviation"
          icon={<Shield className="w-5 h-5" />}
          color="text-[hsl(var(--tangent))]"
        />
        <MetricCard
          label="Sharpe Ratio"
          value={portfolio.sharpeRatio.toFixed(3)}
          subValue={`Rf: ${(riskFreeRate * 100).toFixed(1)}%`}
          icon={<Zap className="w-5 h-5" />}
          color="text-[hsl(var(--primary))]"
        />
        <MetricCard
          label="VaR (95%, 1d)"
          value={`${(var95 * 100).toFixed(2)}%`}
          subValue="Value at Risk"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-[hsl(var(--destructive))]"
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="CVaR (95%)"
          value={`${(cvar95 * 100).toFixed(2)}%`}
          subValue="Expected Shortfall"
          icon={<Activity className="w-5 h-5" />}
          color="text-[hsl(var(--destructive))]"
        />
        <MetricCard
          label="Beta"
          value={beta.toFixed(2)}
          subValue={`vs ${assets[0].ticker}`}
          icon={<BarChart2 className="w-5 h-5" />}
          color="text-[hsl(var(--muted-foreground))]"
        />
        <MetricCard
          label="Treynor Ratio"
          value={treynor.toFixed(3)}
          subValue="Risk-adjusted"
          icon={<Target className="w-5 h-5" />}
          color="text-[hsl(var(--frontier))]"
        />
        <MetricCard
          label="Diversification"
          value={diversificationRatio.toFixed(2)}
          subValue={`${longCount}L / ${shortCount}S`}
          icon={<Percent className="w-5 h-5" />}
          color="text-[hsl(var(--muted-foreground))]"
        />
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { PieChart, Settings, RefreshCw } from 'lucide-react';
import { InputSlider } from './components/InputSlider';
import { EfficientFrontierChart } from './components/EfficientFrontierChart';
import { WeightsChart } from './components/WeightsChart';
import { MetricsPanel } from './components/MetricsPanel';
import { AssetTable } from './components/AssetTable';
import {
  calculateEfficientFrontier,
  SAMPLE_ASSETS,
  type Portfolio,
  type OptimizationResult,
} from './lib/meanVariance';

function App() {
  // Parameters
  const [riskFreeRate, setRiskFreeRate] = useState(0.02);
  const [allowShortSelling, setAllowShortSelling] = useState(true);
  const [numPoints, setNumPoints] = useState(100);

  // Results
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Run optimization
  const runOptimization = useCallback(() => {
    setIsCalculating(true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const optimResult = calculateEfficientFrontier(
        SAMPLE_ASSETS,
        riskFreeRate,
        numPoints,
        allowShortSelling
      );

      setResult(optimResult);
      setSelectedPortfolio(optimResult.maxSharpePortfolio);
      setIsCalculating(false);
    }, 10);
  }, [riskFreeRate, numPoints, allowShortSelling]);

  // Initial calculation
  useEffect(() => {
    runOptimization();
  }, []);

  const handleSelectPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
  };

  const selectMinVariance = () => {
    if (result) setSelectedPortfolio(result.minVariancePortfolio);
  };

  const selectMaxSharpe = () => {
    if (result) setSelectedPortfolio(result.maxSharpePortfolio);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[hsl(var(--primary))] bg-opacity-20">
              <PieChart className="w-8 h-8 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
                Mean-Variance Optimizer
              </h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Markowitz portfolio optimization with quadratic programming
              </p>
            </div>
          </div>
          <button
            onClick={runOptimization}
            disabled={isCalculating}
            className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Calculating...' : 'Recalculate'}
          </button>
        </div>

        {/* Metrics Panel */}
        <MetricsPanel
          portfolio={selectedPortfolio}
          assets={SAMPLE_ASSETS}
          riskFreeRate={riskFreeRate}
          title="Selected Portfolio Metrics"
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Parameters Card */}
            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Parameters
                </h2>
              </div>

              <InputSlider
                label="Risk-Free Rate"
                value={riskFreeRate * 100}
                onChange={(v) => setRiskFreeRate(v / 100)}
                min={0}
                max={10}
                step={0.25}
                unit="%"
                tooltip="Annual risk-free rate for Sharpe ratio calculation"
              />

              <InputSlider
                label="Frontier Points"
                value={numPoints}
                onChange={setNumPoints}
                min={20}
                max={200}
                step={10}
                tooltip="Number of points on the efficient frontier"
              />

              <div className="flex items-center justify-between pt-2">
                <label className="text-sm font-medium text-[hsl(var(--foreground))]">
                  Allow Short Selling
                </label>
                <button
                  onClick={() => setAllowShortSelling(!allowShortSelling)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    allowShortSelling
                      ? 'bg-[hsl(var(--primary))]'
                      : 'bg-[hsl(var(--secondary))]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      allowShortSelling ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {allowShortSelling
                  ? 'Unconstrained optimization allows negative weights (shorting)'
                  : 'Long-only constraint: all weights must be non-negative'}
              </p>
            </div>

            {/* Quick Select */}
            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">
                Quick Select
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={selectMinVariance}
                  className="px-3 py-2 text-sm bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors border border-[hsl(var(--border))]"
                >
                  Min Variance
                </button>
                <button
                  onClick={selectMaxSharpe}
                  className="px-3 py-2 text-sm bg-[hsl(var(--optimal))] text-[hsl(var(--primary-foreground))] rounded-lg hover:opacity-90 transition-opacity"
                >
                  Max Sharpe
                </button>
              </div>
              {result && (
                <div className="text-xs text-[hsl(var(--muted-foreground))] space-y-1">
                  <div>
                    Min Var: {(result.minVariancePortfolio.volatility * 100).toFixed(2)}% vol,{' '}
                    {(result.minVariancePortfolio.expectedReturn * 100).toFixed(2)}% ret
                  </div>
                  <div>
                    Max Sharpe: {result.maxSharpePortfolio.sharpeRatio.toFixed(3)} SR,{' '}
                    {(result.maxSharpePortfolio.expectedReturn * 100).toFixed(2)}% ret
                  </div>
                </div>
              )}
            </div>

            {/* Weights Chart */}
            <WeightsChart
              portfolio={selectedPortfolio}
              assets={SAMPLE_ASSETS}
              title="Portfolio Allocation"
              showShortPositions={allowShortSelling}
            />
          </div>

          {/* Right Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Efficient Frontier */}
            <EfficientFrontierChart
              efficientFrontier={result?.efficientFrontier || []}
              minVariancePortfolio={result?.minVariancePortfolio || null}
              maxSharpePortfolio={result?.maxSharpePortfolio || null}
              selectedPortfolio={selectedPortfolio}
              assets={SAMPLE_ASSETS}
              riskFreeRate={riskFreeRate}
              capitalMarketLine={result?.capitalMarketLine || []}
              onSelectPortfolio={handleSelectPortfolio}
            />

            {/* Asset Table */}
            <AssetTable
              assets={SAMPLE_ASSETS}
              selectedWeights={selectedPortfolio?.weights}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[hsl(var(--muted-foreground))] pt-4 space-y-1">
          <p>
            Mean-Variance optimization using Lagrange multipliers for analytical solution.
            The efficient frontier represents portfolios with minimum variance for each target return.
          </p>
          <p>
            Capital Market Line (CML) shows optimal combinations of the risk-free asset and tangency portfolio.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

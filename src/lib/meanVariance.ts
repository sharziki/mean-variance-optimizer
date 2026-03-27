// Mean-Variance Portfolio Optimization (Markowitz)

export interface Asset {
  name: string;
  ticker: string;
  expectedReturn: number;
  volatility: number;
  color: string;
}

export interface Portfolio {
  weights: number[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
}

export interface OptimizationResult {
  efficientFrontier: Portfolio[];
  minVariancePortfolio: Portfolio;
  maxSharpePortfolio: Portfolio;
  capitalMarketLine: { x: number; y: number }[];
}

// Sample assets with realistic data
export const SAMPLE_ASSETS: Asset[] = [
  { name: 'US Large Cap', ticker: 'SPY', expectedReturn: 0.10, volatility: 0.15, color: '#3b82f6' },
  { name: 'US Small Cap', ticker: 'IWM', expectedReturn: 0.12, volatility: 0.20, color: '#10b981' },
  { name: 'International', ticker: 'EFA', expectedReturn: 0.08, volatility: 0.17, color: '#f59e0b' },
  { name: 'Emerging Markets', ticker: 'EEM', expectedReturn: 0.11, volatility: 0.25, color: '#ef4444' },
  { name: 'US Bonds', ticker: 'AGG', expectedReturn: 0.04, volatility: 0.05, color: '#8b5cf6' },
  { name: 'Corporate Bonds', ticker: 'LQD', expectedReturn: 0.05, volatility: 0.07, color: '#06b6d4' },
  { name: 'REITs', ticker: 'VNQ', expectedReturn: 0.09, volatility: 0.18, color: '#ec4899' },
  { name: 'Gold', ticker: 'GLD', expectedReturn: 0.05, volatility: 0.15, color: '#eab308' },
];

// Sample correlation matrix
const CORRELATIONS: number[][] = [
  [1.00, 0.85, 0.75, 0.70, 0.05, 0.15, 0.60, 0.05],
  [0.85, 1.00, 0.70, 0.75, 0.00, 0.10, 0.65, 0.00],
  [0.75, 0.70, 1.00, 0.80, 0.10, 0.20, 0.55, 0.15],
  [0.70, 0.75, 0.80, 1.00, 0.05, 0.15, 0.50, 0.10],
  [0.05, 0.00, 0.10, 0.05, 1.00, 0.80, 0.20, 0.25],
  [0.15, 0.10, 0.20, 0.15, 0.80, 1.00, 0.25, 0.20],
  [0.60, 0.65, 0.55, 0.50, 0.20, 0.25, 1.00, 0.10],
  [0.05, 0.00, 0.15, 0.10, 0.25, 0.20, 0.10, 1.00],
];

// Generate covariance matrix from correlations and volatilities
export function generateCovarianceMatrix(assets: Asset[]): number[][] {
  const n = assets.length;
  const cov: number[][] = [];

  for (let i = 0; i < n; i++) {
    cov[i] = [];
    for (let j = 0; j < n; j++) {
      cov[i][j] = CORRELATIONS[i][j] * assets[i].volatility * assets[j].volatility;
    }
  }

  return cov;
}

// Matrix operations
function matrixVectorMultiply(m: number[][], v: number[]): number[] {
  return m.map(row => row.reduce((sum, val, i) => sum + val * v[i], 0));
}

function matrixInverse(m: number[][]): number[][] {
  const n = m.length;
  const augmented: number[][] = m.map((row, i) =>
    [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]
  );

  // Gaussian elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
        maxRow = row;
      }
    }
    [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

    // Scale pivot row
    const pivot = augmented[col][col];
    if (Math.abs(pivot) < 1e-10) {
      // Matrix is singular, add small regularization
      augmented[col][col] = 1e-10;
    }
    for (let j = 0; j < 2 * n; j++) {
      augmented[col][j] /= pivot;
    }

    // Eliminate column
    for (let row = 0; row < n; row++) {
      if (row !== col) {
        const factor = augmented[row][col];
        for (let j = 0; j < 2 * n; j++) {
          augmented[row][j] -= factor * augmented[col][j];
        }
      }
    }
  }

  return augmented.map(row => row.slice(n));
}

// Portfolio calculations
export function portfolioReturn(weights: number[], assets: Asset[]): number {
  return weights.reduce((sum, w, i) => sum + w * assets[i].expectedReturn, 0);
}

export function portfolioVolatility(weights: number[], covariance: number[][]): number {
  let variance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      variance += weights[i] * weights[j] * covariance[i][j];
    }
  }
  return Math.sqrt(Math.max(0, variance));
}

export function sharpeRatio(ret: number, vol: number, riskFreeRate: number): number {
  if (vol === 0) return 0;
  return (ret - riskFreeRate) / vol;
}

// Find minimum variance portfolio for a target return using Lagrange multipliers
function findMinVarianceForReturn(
  targetReturn: number,
  assets: Asset[],
  _covariance: number[][],
  covInverse: number[][]
): number[] {
  const n = assets.length;
  const returns = assets.map(a => a.expectedReturn);
  const ones = Array(n).fill(1);

  // Calculate key values for the analytical solution
  const invTimesOnes = matrixVectorMultiply(covInverse, ones);
  const invTimesReturns = matrixVectorMultiply(covInverse, returns);

  const A = ones.reduce((sum, _, i) => sum + invTimesOnes[i], 0);
  const B = returns.reduce((sum, r, i) => sum + invTimesOnes[i] * r, 0);
  const C = returns.reduce((sum, r, i) => sum + invTimesReturns[i] * r, 0);

  const det = A * C - B * B;

  if (Math.abs(det) < 1e-10) {
    // Fallback to equal weights
    return Array(n).fill(1 / n);
  }

  const lambda1 = (C - B * targetReturn) / det;
  const lambda2 = (A * targetReturn - B) / det;

  const weights: number[] = [];
  for (let i = 0; i < n; i++) {
    weights[i] = lambda1 * invTimesOnes[i] + lambda2 * invTimesReturns[i];
  }

  return weights;
}

// Find global minimum variance portfolio
function findGlobalMinVariance(
  assets: Asset[],
  covariance: number[][],
  covInverse: number[][]
): Portfolio {
  const n = assets.length;
  const ones = Array(n).fill(1);

  const invTimesOnes = matrixVectorMultiply(covInverse, ones);
  const sumInvTimesOnes = invTimesOnes.reduce((sum, v) => sum + v, 0);

  const weights = invTimesOnes.map(v => v / sumInvTimesOnes);
  const ret = portfolioReturn(weights, assets);
  const vol = portfolioVolatility(weights, covariance);

  return {
    weights,
    expectedReturn: ret,
    volatility: vol,
    sharpeRatio: 0, // Will be set with risk-free rate
  };
}

// Find maximum Sharpe ratio portfolio (tangency portfolio)
function findMaxSharpePortfolio(
  assets: Asset[],
  covariance: number[][],
  covInverse: number[][],
  riskFreeRate: number
): Portfolio {
  const excessReturns = assets.map(a => a.expectedReturn - riskFreeRate);

  const invTimesExcess = matrixVectorMultiply(covInverse, excessReturns);
  const sumInvTimesExcess = invTimesExcess.reduce((sum, v) => sum + v, 0);

  if (Math.abs(sumInvTimesExcess) < 1e-10) {
    // Fallback to minimum variance
    return findGlobalMinVariance(assets, covariance, covInverse);
  }

  const weights = invTimesExcess.map(v => v / sumInvTimesExcess);
  const ret = portfolioReturn(weights, assets);
  const vol = portfolioVolatility(weights, covariance);

  return {
    weights,
    expectedReturn: ret,
    volatility: vol,
    sharpeRatio: sharpeRatio(ret, vol, riskFreeRate),
  };
}

// Generate efficient frontier
export function calculateEfficientFrontier(
  assets: Asset[],
  riskFreeRate: number = 0.02,
  numPoints: number = 100,
  allowShortSelling: boolean = true
): OptimizationResult {
  const covariance = generateCovarianceMatrix(assets);
  const covInverse = matrixInverse(covariance);

  // Find key portfolios
  const minVarPortfolio = findGlobalMinVariance(assets, covariance, covInverse);
  minVarPortfolio.sharpeRatio = sharpeRatio(
    minVarPortfolio.expectedReturn,
    minVarPortfolio.volatility,
    riskFreeRate
  );

  const maxSharpePortfolio = findMaxSharpePortfolio(assets, covariance, covInverse, riskFreeRate);

  // Generate efficient frontier
  const minReturn = minVarPortfolio.expectedReturn;
  const maxReturn = Math.max(...assets.map(a => a.expectedReturn)) * 1.2;

  const efficientFrontier: Portfolio[] = [];

  for (let i = 0; i < numPoints; i++) {
    const targetReturn = minReturn + (maxReturn - minReturn) * (i / (numPoints - 1));

    let weights: number[];

    if (allowShortSelling) {
      weights = findMinVarianceForReturn(targetReturn, assets, covariance, covInverse);
    } else {
      // Use gradient descent for long-only constraint
      weights = findMinVarianceLongOnly(targetReturn, assets, covariance);
    }

    const ret = portfolioReturn(weights, assets);
    const vol = portfolioVolatility(weights, covariance);

    efficientFrontier.push({
      weights,
      expectedReturn: ret,
      volatility: vol,
      sharpeRatio: sharpeRatio(ret, vol, riskFreeRate),
    });
  }

  // Capital Market Line
  const cmlSlope = maxSharpePortfolio.sharpeRatio;
  const maxVol = Math.max(...efficientFrontier.map(p => p.volatility)) * 1.2;

  const capitalMarketLine = [
    { x: 0, y: riskFreeRate * 100 },
    { x: maxVol * 100, y: (riskFreeRate + cmlSlope * maxVol) * 100 },
  ];

  return {
    efficientFrontier,
    minVariancePortfolio: minVarPortfolio,
    maxSharpePortfolio,
    capitalMarketLine,
  };
}

// Gradient descent for long-only portfolio
function findMinVarianceLongOnly(
  targetReturn: number,
  assets: Asset[],
  covariance: number[][]
): number[] {
  const n = assets.length;
  let weights = Array(n).fill(1 / n);
  const lr = 0.01;
  const returnPenalty = 100;
  const constraintPenalty = 50;

  for (let iter = 0; iter < 2000; iter++) {
    const ret = portfolioReturn(weights, assets);

    // Gradient of variance
    const gradient: number[] = [];
    for (let i = 0; i < n; i++) {
      let g = 0;
      for (let j = 0; j < n; j++) {
        g += 2 * weights[j] * covariance[i][j];
      }
      // Penalty for return constraint
      g += returnPenalty * (ret - targetReturn) * assets[i].expectedReturn;
      // Penalty for sum constraint
      const sumWeights = weights.reduce((a, b) => a + b, 0);
      g += constraintPenalty * (sumWeights - 1);

      gradient[i] = g;
    }

    // Update weights
    for (let i = 0; i < n; i++) {
      weights[i] -= lr * gradient[i];
      weights[i] = Math.max(0, weights[i]); // Long-only constraint
    }

    // Normalize
    const sum = weights.reduce((a, b) => a + b, 0);
    if (sum > 0) {
      weights = weights.map(w => w / sum);
    }
  }

  return weights;
}

// Calculate Value at Risk
export function calculateVaR(
  portfolio: Portfolio,
  confidenceLevel: number = 0.95,
  timeHorizon: number = 1
): number {
  const z = confidenceLevel === 0.99 ? 2.326 : confidenceLevel === 0.95 ? 1.645 : 1.282;
  return portfolio.volatility * z * Math.sqrt(timeHorizon / 252);
}

// Calculate Conditional VaR (Expected Shortfall)
export function calculateCVaR(
  portfolio: Portfolio,
  confidenceLevel: number = 0.95,
  timeHorizon: number = 1
): number {
  const var_ = calculateVaR(portfolio, confidenceLevel, timeHorizon);
  // For normal distribution, CVaR ≈ VaR * 1.15 at 95% confidence
  const multiplier = confidenceLevel === 0.99 ? 1.08 : confidenceLevel === 0.95 ? 1.15 : 1.25;
  return var_ * multiplier;
}

// Calculate portfolio beta (vs first asset as benchmark)
export function calculateBeta(
  portfolio: Portfolio,
  _assets: Asset[],
  covariance: number[][]
): number {
  const benchmarkVar = covariance[0][0];
  if (benchmarkVar === 0) return 1;

  let portfolioCov = 0;
  for (let i = 0; i < portfolio.weights.length; i++) {
    portfolioCov += portfolio.weights[i] * covariance[i][0];
  }

  return portfolioCov / benchmarkVar;
}

// Calculate Treynor ratio
export function calculateTreynor(
  portfolio: Portfolio,
  riskFreeRate: number,
  beta: number
): number {
  if (beta === 0) return 0;
  return (portfolio.expectedReturn - riskFreeRate) / beta;
}

// Calculate Information ratio (vs first asset as benchmark)
export function calculateInformationRatio(
  portfolio: Portfolio,
  assets: Asset[],
  covariance: number[][]
): number {
  const benchmarkReturn = assets[0].expectedReturn;
  const activeReturn = portfolio.expectedReturn - benchmarkReturn;

  // Calculate tracking error (simplified)
  let trackingVar = portfolio.volatility ** 2 + assets[0].volatility ** 2;
  for (let i = 0; i < portfolio.weights.length; i++) {
    trackingVar -= 2 * portfolio.weights[i] * covariance[i][0];
  }

  const trackingError = Math.sqrt(Math.max(0, trackingVar));
  if (trackingError === 0) return 0;

  return activeReturn / trackingError;
}

// Calculate diversification ratio
export function calculateDiversificationRatio(
  portfolio: Portfolio,
  assets: Asset[]
): number {
  const weightedAvgVol = portfolio.weights.reduce(
    (sum, w, i) => sum + w * assets[i].volatility,
    0
  );

  if (portfolio.volatility === 0) return 1;
  return weightedAvgVol / portfolio.volatility;
}

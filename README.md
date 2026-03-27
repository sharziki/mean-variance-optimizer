# Mean-Variance Portfolio Optimizer

An interactive implementation of Markowitz Mean-Variance portfolio optimization. Explore the efficient frontier, compare portfolios, and analyze risk metrics in real-time.

## Features

- **Efficient Frontier Visualization**: Interactive chart showing the risk-return tradeoff
- **Analytical Solution**: Uses Lagrange multipliers for exact minimum-variance portfolios
- **Capital Market Line**: Shows optimal combinations with the risk-free asset
- **Key Portfolios**: Automatically identifies minimum variance and maximum Sharpe portfolios
- **Long-Only Option**: Toggle between unconstrained and long-only optimization
- **Comprehensive Metrics**: Sharpe ratio, VaR, CVaR, Beta, Treynor ratio, diversification ratio

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Recharts for data visualization
- Lucide React icons

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Theory

### Mean-Variance Optimization

The Markowitz model finds portfolios that minimize variance for a given expected return. For unconstrained optimization (allowing short selling), the analytical solution uses Lagrange multipliers:

```
min   w'Σw
s.t.  w'μ = μₜ  (target return)
      w'1 = 1   (weights sum to 1)
```

Where:
- `w` = weight vector
- `Σ` = covariance matrix
- `μ` = expected returns vector
- `μₜ` = target return

### Key Portfolios

1. **Minimum Variance Portfolio**: The portfolio with the lowest possible volatility
2. **Maximum Sharpe Portfolio (Tangency)**: The portfolio with the highest risk-adjusted return
3. **Capital Market Line**: All efficient combinations of the risk-free asset and tangency portfolio

### Risk Metrics

- **Sharpe Ratio**: (Return - Rf) / Volatility
- **VaR (Value at Risk)**: Maximum expected loss at a confidence level
- **CVaR (Conditional VaR)**: Expected loss given VaR is exceeded
- **Beta**: Sensitivity to market movements
- **Treynor Ratio**: Excess return per unit of systematic risk

## Sample Assets

The demo includes 8 diversified asset classes:
- SPY (US Large Cap), IWM (US Small Cap)
- EFA (International), EEM (Emerging Markets)
- AGG (US Bonds), LQD (Corporate Bonds)
- VNQ (REITs), GLD (Gold)

## License

MIT

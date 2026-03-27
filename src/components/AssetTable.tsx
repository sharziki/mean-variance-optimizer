import type { Asset } from '../lib/meanVariance';

interface AssetTableProps {
  assets: Asset[];
  selectedWeights?: number[];
}

export function AssetTable({ assets, selectedWeights }: AssetTableProps) {
  return (
    <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
      <div className="p-4 border-b border-[hsl(var(--border))]">
        <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Asset Universe</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary))]">
              <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Asset
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Exp. Return
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Volatility
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                Sharpe*
              </th>
              {selectedWeights && (
                <th className="px-4 py-3 text-right text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                  Weight
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {assets.map((asset, i) => {
              const standaloneSharpe = (asset.expectedReturn - 0.02) / asset.volatility;
              const weight = selectedWeights?.[i];
              const isShort = weight !== undefined && weight < 0;

              return (
                <tr
                  key={asset.ticker}
                  className="hover:bg-[hsl(var(--secondary))] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: asset.color }}
                      />
                      <div>
                        <div className="text-sm font-medium text-[hsl(var(--foreground))]">
                          {asset.ticker}
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                          {asset.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-mono text-[hsl(var(--optimal))]">
                      {(asset.expectedReturn * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-mono text-[hsl(var(--foreground))]">
                      {(asset.volatility * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-mono text-[hsl(var(--primary))]">
                      {standaloneSharpe.toFixed(2)}
                    </span>
                  </td>
                  {selectedWeights && (
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-sm font-mono ${
                          isShort
                            ? 'text-[hsl(var(--destructive))]'
                            : weight && weight > 0.01
                            ? 'text-[hsl(var(--optimal))]'
                            : 'text-[hsl(var(--muted-foreground))]'
                        }`}
                      >
                        {weight ? `${(weight * 100).toFixed(1)}%` : '0.0%'}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
        *Standalone Sharpe ratio assuming 2% risk-free rate
      </div>
    </div>
  );
}

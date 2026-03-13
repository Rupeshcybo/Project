import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { Pair } from './Dashboard';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LivePriceProps {
  pair: Pair;
}

export function LivePrice({ pair }: LivePriceProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);
        let newPrice: number;

        if (pair.symbol === 'BTC/USD') {
          const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
          if (!res.ok) throw new Error('Failed to fetch price');
          const data = await res.json();
          newPrice = parseFloat(data.price);
        } else if (pair.symbol === 'XAU/USD') {
          // Using PAXG (PAX Gold) as a proxy for XAU price since it's pegged to 1 oz of gold
          const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=PAXGUSDT');
          if (!res.ok) throw new Error('Failed to fetch price');
          const data = await res.json();
          newPrice = parseFloat(data.price);
        } else {
          // Using Frankfurter API for free live fiat forex rates
          const res = await fetch(`https://api.frankfurter.app/latest?from=${pair.base}&to=${pair.quote}`);
          if (!res.ok) throw new Error('Failed to fetch price');
          const data = await res.json();
          newPrice = data.rates[pair.quote];
        }
        
        if (isMounted) {
          setPrice(currentPrice => {
            setPrevPrice(currentPrice);
            return newPrice;
          });
        }
      } catch (err) {
        if (isMounted) {
          setError('Price unavailable');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pair.symbol]); // Re-run when pair changes

  const isUp = price && prevPrice ? price >= prevPrice : true;

  return (
    <div className="card rounded-2xl p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-zinc-400" />
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Live Market Data</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {loading && <RefreshCw className="w-3 h-3 animate-spin" />}
          <span>Auto-updates</span>
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-zinc-500 font-mono mb-1">{pair.symbol}</span>
          {error ? (
            <span className="text-2xl font-mono text-red-400">{error}</span>
          ) : price ? (
            <motion.div
              key={price}
              initial={{ opacity: 0.5, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <span className="text-4xl font-mono font-semibold tracking-tight text-zinc-100">
                {price > 1000 ? price.toFixed(2) : price.toFixed(4)}
              </span>
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
                isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              )}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isUp ? '+' : '-'}{Math.abs((price - (prevPrice || price)) / (prevPrice || price) * 100).toFixed(2)}%</span>
              </div>
            </motion.div>
          ) : (
            <span className="text-4xl font-mono text-zinc-700 animate-pulse">0.0000</span>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Target, ShieldAlert, Info, XCircle, Activity, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import { Pair } from './Dashboard';
import { motion } from 'motion/react';

interface SignalOutputProps {
  signal: {
    action: 'BUY' | 'SELL' | 'NO_TRADE';
    trend4H: string;
    trend1H: string;
    setup15M: string;
    entrySignal5M: string;
    probability: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    scalpingTarget: string;
    reasoning: string;
  };
  pair: Pair;
}

export function SignalOutput({ signal, pair }: SignalOutputProps) {
  const isBuy = signal.action === 'BUY';
  const isNoTrade = signal.action === 'NO_TRADE';

  if (isNoTrade) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full space-y-6 items-center justify-center text-center p-6"
      >
        <div className="p-4 bg-zinc-800/50 rounded-full mb-2">
          <XCircle className="w-12 h-12 text-zinc-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-300 mb-2">No Valid Setup Found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
            {signal.reasoning || "The current chart does not meet the strict criteria for a high-probability scalping setup."}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full space-y-6"
    >
      {/* Action & Probability */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl flex items-center justify-center",
            isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          )}>
            {isBuy ? <ArrowUpRight className="w-8 h-8" /> : <ArrowDownRight className="w-8 h-8" />}
          </div>
          <div>
            <h3 className={cn(
              "text-2xl font-bold tracking-tight",
              isBuy ? "text-emerald-400" : "text-red-400"
            )}>
              {signal.action} {pair.symbol}
            </h3>
            <p className="text-sm text-zinc-400">AI Scalping Signal</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-zinc-100">{signal.probability}%</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Probability</div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800 text-xs text-zinc-300">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>4H Trend: <span className="font-medium text-zinc-100">{signal.trend4H}</span></span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800 text-xs text-zinc-300">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>1H Trend: <span className="font-medium text-zinc-100">{signal.trend1H}</span></span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800 text-xs text-zinc-300">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>15M Setup: <span className="font-medium text-zinc-100">{signal.setup15M}</span></span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 rounded-lg border border-zinc-800 text-xs text-zinc-300">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Target: <span className="font-medium text-zinc-100">{signal.scalpingTarget}</span></span>
        </div>
      </div>

      {/* Trade Parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Entry</span>
          <span className="font-mono font-medium text-zinc-200">{signal.entryPrice > 1000 ? signal.entryPrice.toFixed(2) : signal.entryPrice.toFixed(4)}</span>
        </div>
        <div className="card rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <Target className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Take Profit</span>
          <span className="font-mono font-medium text-emerald-400">{signal.takeProfit > 1000 ? signal.takeProfit.toFixed(2) : signal.takeProfit.toFixed(4)}</span>
        </div>
        <div className="card rounded-xl p-3 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="w-4 h-4 text-red-400 mb-1" />
          <span className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Stop Loss</span>
          <span className="font-mono font-medium text-red-400">{signal.stopLoss > 1000 ? signal.stopLoss.toFixed(2) : signal.stopLoss.toFixed(4)}</span>
        </div>
      </div>

      {/* Reasoning */}
      <div className="card rounded-xl p-4 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-medium text-zinc-300">AI Analysis</h4>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {signal.reasoning}
        </p>
      </div>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { Pair } from './Dashboard';
import { motion, AnimatePresence } from 'motion/react';

interface PairSelectorProps {
  selected: Pair;
  onSelect: (pair: Pair) => void;
  pairs: Pair[];
}

export function PairSelector({ selected, onSelect, pairs }: PairSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 card rounded-xl hover:bg-zinc-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-400">
            {selected.base}
          </div>
          <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-[10px] font-bold text-zinc-300">
            {selected.quote}
          </div>
        </div>
        <span className="font-mono font-medium text-zinc-100">{selected.symbol}</span>
        <ChevronDown className={cn("w-4 h-4 text-zinc-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-56 card rounded-xl shadow-2xl overflow-hidden py-1"
          >
            {pairs.map((pair) => (
              <button
                key={pair.symbol}
                onClick={() => {
                  onSelect(pair);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors",
                  selected.symbol === pair.symbol
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                      {pair.base}
                    </div>
                    <div className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center text-[8px] font-bold text-zinc-300">
                      {pair.quote}
                    </div>
                  </div>
                  <span className="font-mono">{pair.symbol}</span>
                </div>
                {selected.symbol === pair.symbol && <Check className="w-4 h-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

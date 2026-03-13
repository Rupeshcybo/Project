import React, { useState } from 'react';
import { Radar, Target, ShieldAlert, TrendingUp, TrendingDown, Activity, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

interface ScanResult {
  pair: string;
  trend: string;
  signal: 'BUY' | 'SELL';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  winProbability: number;
  reason: string;
}

export function MarketScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are a professional forex trading analyst.
      Analyze the following forex pairs and identify the pair with the highest probability trade setup based on current market conditions.
      Pairs to analyze: EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, USDCHF, NZDUSD, EURGBP, EURJPY, GBPJPY, AUDJPY, XAUUSD.
      
      Use the following criteria:
      1. Multi timeframe trend alignment (1H and 4H)
      2. Support and resistance levels
      3. Momentum indicators (RSI and MACD)
      4. Market structure (breakout or pullback)
      5. Risk to reward minimum 1:2
      
      Score each pair from 0 to 100.
      Return ONLY the pair with the highest probability setup.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pair: { type: Type.STRING, description: "The winning forex pair, e.g., EURUSD" },
              trend: { type: Type.STRING, description: "Current trend direction, e.g., Bullish, Bearish, Neutral" },
              signal: { type: Type.STRING, enum: ["BUY", "SELL"], description: "Trading signal" },
              entry: { type: Type.NUMBER, description: "Suggested entry price" },
              stopLoss: { type: Type.NUMBER, description: "Suggested stop loss price" },
              takeProfit: { type: Type.NUMBER, description: "Suggested take profit price" },
              winProbability: { type: Type.INTEGER, description: "Win probability score from 0 to 100" },
              reason: { type: Type.STRING, description: "Detailed reasoning for the trade based on the 5 criteria" }
            },
            required: ["pair", "trend", "signal", "entry", "stopLoss", "takeProfit", "winProbability", "reason"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setResult(data);
      } else {
        throw new Error("No response from AI");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to scan markets");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-2">
              <Radar className="w-6 h-6 text-indigo-400" />
              Global Market Scanner
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Scans 12 major forex pairs and commodities (including XAUUSD) analyzing multi-timeframe trends, momentum, and market structure to find the single highest probability setup.
            </p>
          </div>
          
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={cn(
              "py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-all whitespace-nowrap",
              isScanning 
                ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
            )}
          >
            {isScanning ? (
              <>
                <Radar className="w-5 h-5 animate-spin" />
                Scanning Markets...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Find Top Setup
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {isScanning && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
              <Radar className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium text-zinc-200">Analyzing 12 Pairs...</p>
              <p className="text-sm text-zinc-500">Checking 1H & 4H trends, RSI, MACD, and Key Levels</p>
            </div>
          </div>
        )}

        {result && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column: Pair & Score */}
            <div className="card rounded-xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Top Setup Found</h3>
              <div className="text-5xl font-bold text-zinc-100 tracking-tight mb-6">
                {result.pair}
              </div>
              
              <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-zinc-800" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="45" fill="none" stroke="currentColor" 
                    className={cn(
                      result.winProbability >= 80 ? "text-emerald-500" : 
                      result.winProbability >= 60 ? "text-amber-500" : "text-red-500"
                    )} 
                    strokeWidth="8" 
                    strokeDasharray={`${result.winProbability * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-zinc-100">{result.winProbability}%</span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Win Prob</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">
                <Activity className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-300">Trend: <span className="text-zinc-100">{result.trend}</span></span>
              </div>
            </div>

            {/* Middle Column: Trade Parameters */}
            <div className="card rounded-xl p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-8">
                <div className={cn(
                  "p-3 rounded-xl flex items-center justify-center",
                  result.signal === 'BUY' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  {result.signal === 'BUY' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className={cn(
                    "text-2xl font-bold tracking-tight",
                    result.signal === 'BUY' ? "text-emerald-400" : "text-red-400"
                  )}>
                    {result.signal}
                  </h3>
                  <p className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Action</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-lg border border-zinc-800">
                  <span className="text-sm text-zinc-400 uppercase tracking-wider">Entry</span>
                  <span className="font-mono font-medium text-zinc-200 text-lg">
                    {result.entry > 1000 ? result.entry.toFixed(2) : result.entry.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-zinc-400 uppercase tracking-wider">Take Profit</span>
                  </div>
                  <span className="font-mono font-medium text-emerald-400 text-lg">
                    {result.takeProfit > 1000 ? result.takeProfit.toFixed(2) : result.takeProfit.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-900/80 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-zinc-400 uppercase tracking-wider">Stop Loss</span>
                  </div>
                  <span className="font-mono font-medium text-red-400 text-lg">
                    {result.stopLoss > 1000 ? result.stopLoss.toFixed(2) : result.stopLoss.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Reasoning */}
            <div className="card rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">Analysis Reasoning</h3>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {result.reason}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

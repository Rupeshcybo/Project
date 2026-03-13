import React, { useState, useEffect } from 'react';
import { Activity, BarChart2, Zap, UploadCloud, RefreshCw, TrendingUp, TrendingDown, AlertCircle, Radar } from 'lucide-react';
import { cn } from '../lib/utils';
import { PairSelector } from './PairSelector';
import { LivePrice } from './LivePrice';
import { ChartAnalysis } from './ChartAnalysis';
import { SignalOutput } from './SignalOutput';
import { MarketScanner } from './MarketScanner';
import { motion } from 'motion/react';
import { GoogleGenAI, Type } from '@google/genai';

export type Pair = {
  base: string;
  quote: string;
  symbol: string;
};

export const PAIRS: Pair[] = [
  { base: 'EUR', quote: 'USD', symbol: 'EUR/USD' },
  { base: 'GBP', quote: 'USD', symbol: 'GBP/USD' },
  { base: 'USD', quote: 'JPY', symbol: 'USD/JPY' },
  { base: 'XAU', quote: 'USD', symbol: 'XAU/USD' },
  { base: 'BTC', quote: 'USD', symbol: 'BTC/USD' },
  { base: 'AUD', quote: 'USD', symbol: 'AUD/USD' },
  { base: 'USD', quote: 'CAD', symbol: 'USD/CAD' },
  { base: 'USD', quote: 'CHF', symbol: 'USD/CHF' },
  { base: 'NZD', quote: 'USD', symbol: 'NZD/USD' },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'scanner'>('analysis');
  const [selectedPair, setSelectedPair] = useState<Pair>(PAIRS[0]);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signal, setSignal] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSignal = async () => {
    if (!chartImage) {
      setError("Please upload a chart screenshot first.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setSignal(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Extract base64 and mimeType
      const match = chartImage.match(/^data:(image\/[a-z0-9]+);base64,(.+)$/);
      if (!match) {
        throw new Error("Invalid image format");
      }
      const mimeType = match[1];
      const base64Data = match[2];

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              }
            },
            {
              text: `You are a professional forex scalping trader.

Analyze the market using multi-timeframe analysis for ${selectedPair.symbol}.

Timeframes:

4H → Identify the main market trend.
1H → Confirm trend strength and market structure.
15M → Detect pullback, breakout, or reversal setup.
5M → Predict the next price movement for scalping entry.

Rules:

1. Determine the overall trend on the 4H timeframe.
2. Confirm that the 1H trend aligns with the 4H trend.
3. On the 15M timeframe check for:
   - Pullback to EMA50 or EMA200
   - Breakout of support or resistance
   - Reversal pattern (engulfing or pin bar)
4. On the 5M timeframe find the exact entry point.
5. Ensure risk-to-reward ratio is at least 1:2.
6. Avoid signals if the market is consolidating.

Return only high probability trades above 70%.
If market volatility is low or trend is unclear, return "NO_TRADE" for the action.`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: {
                type: Type.STRING,
                description: "The trading action, either 'BUY', 'SELL', or 'NO_TRADE' if no valid setup exists",
                enum: ["BUY", "SELL", "NO_TRADE"]
              },
              trend4H: {
                type: Type.STRING,
                description: "The main trend identified on the 4H timeframe"
              },
              trend1H: {
                type: Type.STRING,
                description: "The trend identified on the 1H timeframe"
              },
              setup15M: {
                type: Type.STRING,
                description: "The setup identified on the 15M timeframe (e.g., Pullback, Breakout)"
              },
              entrySignal5M: {
                type: Type.STRING,
                description: "The entry signal identified on the 5M timeframe"
              },
              probability: {
                type: Type.INTEGER,
                description: "Probability level of the signal from 0 to 100"
              },
              entryPrice: {
                type: Type.NUMBER,
                description: "Suggested entry price"
              },
              stopLoss: {
                type: Type.NUMBER,
                description: "Suggested stop loss price"
              },
              takeProfit: {
                type: Type.NUMBER,
                description: "Suggested take profit price"
              },
              scalpingTarget: {
                type: Type.STRING,
                description: "Scalping target in pips (e.g., '5-15 pips')"
              },
              reasoning: {
                type: Type.STRING,
                description: "A brief explanation of the technical analysis and reasoning behind the signal"
              }
            },
            required: ["action", "trend4H", "trend1H", "setup15M", "entrySignal5M", "probability", "entryPrice", "stopLoss", "takeProfit", "scalpingTarget", "reasoning"]
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setSignal(result);
      } else {
        throw new Error("No response from AI");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate signal");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">AI Signal Generator</h1>
            <p className="text-sm text-zinc-400">Real-time Forex analysis powered by Gemini</p>
          </div>
        </div>
        
        {activeTab === 'analysis' && (
          <div className="flex items-center gap-4">
            <PairSelector selected={selectedPair} onSelect={setSelectedPair} pairs={PAIRS} />
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 card p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('analysis')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === 'analysis' ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <BarChart2 className="w-4 h-4" />
          Chart Analysis
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
            activeTab === 'scanner' ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          <Radar className="w-4 h-4" />
          Market Scanner
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'analysis' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Data & Input */}
          <div className="lg:col-span-2 space-y-6">
            <LivePrice pair={selectedPair} />
            
            <ChartAnalysis 
              image={chartImage} 
              onImageUpload={setChartImage} 
              onClear={() => setChartImage(null)} 
            />
          </div>

          {/* Right Column: AI Output */}
          <div className="space-y-6">
            <div className="card rounded-2xl p-6 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-medium text-zinc-100">Signal Output</h2>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex-1 flex flex-col">
                {signal ? (
                  <SignalOutput signal={signal} pair={selectedPair} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                    <BarChart2 className="w-12 h-12 text-zinc-700 mb-4" />
                    <p className="text-sm text-zinc-400 max-w-[200px]">
                      Upload a chart screenshot and generate an AI signal to see the analysis here.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerateSignal}
                disabled={isGenerating || !chartImage}
                className={cn(
                  "mt-6 w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                  isGenerating 
                    ? "bg-zinc-800 text-zinc-400 cursor-not-allowed" 
                    : !chartImage
                      ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)]"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing Chart...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate AI Signal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <MarketScanner />
      )}
    </div>
  );
}

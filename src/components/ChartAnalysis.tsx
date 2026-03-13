import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface ChartAnalysisProps {
  image: string | null;
  onImageUpload: (base64: string) => void;
  onClear: () => void;
}

export function ChartAnalysis({ image, onImageUpload, onClear }: ChartAnalysisProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  } as any);

  return (
    <div className="card rounded-2xl p-6 flex flex-col h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-zinc-400" />
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Chart Screenshot</h2>
        </div>
        {image && (
          <button
            onClick={onClear}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden bg-zinc-950/50 border border-zinc-800/50">
        {image ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative group"
          >
            <img
              src={image}
              alt="Uploaded Chart"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button
                {...getRootProps()}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg font-medium shadow-xl transition-colors"
              >
                <input {...getInputProps()} />
                Replace Image
              </button>
            </div>
          </motion.div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center p-6 border-2 border-dashed transition-all cursor-pointer",
              isDragActive
                ? "border-indigo-500 bg-indigo-500/5"
                : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-4 bg-zinc-900 rounded-full mb-4">
              <UploadCloud className={cn(
                "w-8 h-8 transition-colors",
                isDragActive ? "text-indigo-400" : "text-zinc-500"
              )} />
            </div>
            <p className="text-zinc-300 font-medium mb-1">
              {isDragActive ? "Drop chart here..." : "Upload Chart Screenshot"}
            </p>
            <p className="text-xs text-zinc-500 text-center max-w-[250px]">
              Drag & drop a screenshot of your trading chart, or click to browse.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

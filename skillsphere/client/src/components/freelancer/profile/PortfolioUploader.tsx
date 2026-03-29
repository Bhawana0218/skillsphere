import React, { useState, useCallback } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PortfolioItem {
  id: string;
  file: File | null;
  preview: string;
  title: string;
  description: string;
  projectUrl?: string;
  photo?: File | null;
  photoPreview?: string;
}

interface PortfolioUploaderProps {
  items: PortfolioItem[];
  onChange: (items: PortfolioItem[]) => void;
  maxItems?: number;
}

const PortfolioUploader: React.FC<PortfolioUploaderProps> = ({ 
  items, 
  onChange, 
  maxItems = 6 
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    addFiles(files);
  }, [items]);

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  // Add files to portfolio
  const addFiles = (files: File[]) => {
    const remainingSlots = maxItems - items.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    const newItems: PortfolioItem[] = filesToAdd.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      title: '',
      description: '',
      projectUrl: ''
    }));
    
    onChange([...items, ...newItems]);
  };

  // Update portfolio item
  const updateItem = (id: string, field: keyof PortfolioItem, value: string) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Remove portfolio item
  const removeItem = (id: string) => {
    // Revoke object URL to prevent memory leak
    const item = items.find(i => i.id === id);
    if (item?.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(item.preview);
    }
    onChange(items.filter(item => item.id !== id));
  };

  // Drag event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-cyan-500 bg-cyan-50/50' 
            : 'border-slate-300 hover:border-cyan-400 hover:bg-slate-50/50'
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={items.length >= maxItems}
        />
        
        <div className="space-y-3">
          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
            isDragging ? 'bg-cyan-100' : 'bg-slate-100'
          }`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-cyan-600' : 'text-slate-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {isDragging ? 'Drop your images here' : 'Upload Portfolio Items'}
            </p>
            <p className="text-slate-500 text-base">
              Drag & drop or click to browse • PNG, JPG, GIF • Max {maxItems} items
            </p>
          </div>
          
          {items.length >= maxItems && (
            <p className="text-amber-600 font-medium text-sm">
              Maximum {maxItems} portfolio items reached
            </p>
          )}
        </div>
      </div>

      {/* Portfolio Grid */}
      <AnimatePresence mode="popLayout">
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="relative group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Image Preview */}
                <div className="relative h-40 bg-slate-100">
                  <img 
                    src={item.preview} 
                    alt={item.title || 'Portfolio preview'} 
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <input
                      type="text"
                      placeholder="Project title"
                      value={item.title}
                      onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/95 text-slate-900 font-semibold mb-2 text-base"
                    />
                    <textarea
                      placeholder="Brief description"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="px-3 py-2 rounded-lg bg-white/95 text-slate-700 text-sm resize-none mb-2"
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        placeholder="Project URL (optional)"
                        value={item.projectUrl || ''}
                        onChange={(e) => updateItem(item.id, 'projectUrl', e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-white/95 text-slate-700 text-xs"
                      />
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeItem(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/95 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors shadow-lg z-10"
                    aria-label="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
                
                {/* Item Number Badge */}
                <div className="absolute top-3 left-3 w-7 h-7 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioUploader;
import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, Crop, Sun, Check, X, Undo, Redo } from 'lucide-react';
import { ImageEditorState, type EditorOperation } from '../../media-sdk/media-editor/ImageEditorState';

export interface ImageEditorModalProps {
  isOpen: boolean;
  imageBitmap: ImageBitmap | null;
  onClose: () => void;
  onSave: (editedBlob: Blob) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  imageBitmap,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editorState] = useState(() => new ImageEditorState());
  const [operations, setOperations] = useState<EditorOperation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync operations from the state object to React state for UI rendering
  const syncState = () => {
    setOperations(editorState.operations);
  };

  // Re-render canvas whenever operations or source image changes
  useEffect(() => {
    if (!isOpen || !imageBitmap || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fast preview render (CPU bound, fine for small previews)
    // In a full implementation, we'd use the WebWorker for preview generation too,
    // but for immediate UI feedback, a local canvas is smoother.
    
    let currentWidth = imageBitmap.width;
    let currentHeight = imageBitmap.height;

    // Calculate effective dimensions based on rotation
    const rotationOps = operations.filter(op => op.type === 'rotate').length;
    if (rotationOps % 2 !== 0) {
      currentWidth = imageBitmap.height;
      currentHeight = imageBitmap.width;
    }

    // Set canvas size for display
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.6;
    const scale = Math.min(maxWidth / currentWidth, maxHeight / currentHeight, 1);
    
    canvas.width = currentWidth * scale;
    canvas.height = currentHeight * scale;

    ctx.save();
    
    // Center and scale
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    
    // Apply operations visually
    let totalRotation = 0;
    operations.forEach(op => {
      if (op.type === 'rotate') totalRotation += Math.PI / 2;
    });
    
    ctx.rotate(totalRotation);
    
    // Draw
    ctx.drawImage(
      imageBitmap,
      -imageBitmap.width / 2,
      -imageBitmap.height / 2,
      imageBitmap.width,
      imageBitmap.height
    );
    
    ctx.restore();
  }, [isOpen, imageBitmap, operations]);

  const handleRotate = () => {
    editorState.applyOperation({ type: 'rotate', args: { angle: 90 } });
    syncState();
  };

  const handleUndo = () => {
    editorState.undo();
    syncState();
  };

  const handleRedo = () => {
    editorState.redo();
    syncState();
  };

  const handleSave = async () => {
    if (!imageBitmap || !canvasRef.current) return;
    setIsProcessing(true);
    
    try {
      // In production, dispatch this to the WorkerPool.
      // For this UI component, we just export the current canvas state directly for simplicity.
      const blob = await new Promise<Blob | null>(resolve => {
        canvasRef.current?.toBlob(resolve, 'image/jpeg', 0.9);
      });
      
      if (blob) {
        onSave(blob);
      } else {
        throw new Error('Failed to generate image blob');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen || !imageBitmap) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      <div className="w-full h-full flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-zinc-900 border-b border-white/5">
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex gap-4 items-center">
            <button 
              onClick={handleUndo} 
              disabled={!editorState.canUndo}
              className="p-2 text-white/70 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Undo className="w-5 h-5" />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={!editorState.canRedo}
              className="p-2 text-white/70 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Redo className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            onClick={() => void handleSave()}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Saving...' : (
              <>
                <Check className="w-4 h-4" /> Save
              </>
            )}
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-grow flex items-center justify-center overflow-hidden p-6 relative bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3hKhfsrIwMDAgFEA5mF8Gqhgx2AAIz4jA0M1g4IxhwEDAwMAXL0F37R2+wAAAAAASUVORK5CYII=')] bg-repeat">
          <canvas ref={canvasRef} className="shadow-2xl rounded-lg" />
        </div>

        {/* Bottom Toolbar */}
        <div className="p-6 bg-zinc-900 border-t border-white/5 flex justify-center gap-8">
          <button onClick={handleRotate} className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <RotateCw className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Rotate</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 text-white/40 cursor-not-allowed">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Crop className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Crop</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 text-white/40 cursor-not-allowed">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Adjust</span>
          </button>
        </div>
      </div>
    </div>
  );
};

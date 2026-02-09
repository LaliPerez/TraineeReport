import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  label?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = 140;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const getPos = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e: any) => {
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current!.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current!.getContext('2d');
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const clear = () => {
    const ctx = canvasRef.current!.getContext('2d');
    ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    onSave('');
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      {label && <label style={{fontSize: '12px', color: 'var(--text-muted)'}}>{label}</label>}
      <div ref={containerRef} style={{position: 'relative', background: '#000', border: '1px dashed var(--card-border)', borderRadius: '10px', height: '140px', overflow: 'hidden'}}>
        <canvas 
          ref={canvasRef} 
          onMouseDown={start} 
          onMouseMove={draw} 
          onMouseUp={() => { setIsDrawing(false); onSave(canvasRef.current!.toDataURL()); }}
          onTouchStart={start}
          onTouchMove={(e) => { e.preventDefault(); draw(e); }}
          onTouchEnd={() => { setIsDrawing(false); onSave(canvasRef.current!.toDataURL()); }}
          style={{cursor: 'crosshair', width: '100%', height: '100%'}}
        />
        <button type="button" onClick={clear} style={{position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer'}}>Borrar</button>
      </div>
    </div>
  );
};
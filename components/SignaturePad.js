import React, { useRef, useState, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

export const SignaturePad = ({ onSave, label }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && containerRef.current) {
      canvas.width = containerRef.current.clientWidth;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Fondo blanco sólido inicial
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0000ff'; // Azul oscuro clásico
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e) => {
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const clear = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onSave('');
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    onSave(canvasRef.current.toDataURL('image/png'));
  };

  return html`
    <div style=${{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      ${label && html`<label style=${{fontSize: '12px', color: 'var(--text-muted)'}}>${label}</label>`}
      <div ref=${containerRef} style=${{position: 'relative', background: '#ffffff', border: '1px dashed var(--card-border)', borderRadius: '10px', height: '160px', overflow: 'hidden'}}>
        <canvas 
          ref=${canvasRef} 
          onMouseDown=${start} 
          onMouseMove=${draw} 
          onMouseUp=${finishDrawing}
          onTouchStart=${start}
          onTouchMove=${(e) => { e.preventDefault(); draw(e); }}
          onTouchEnd=${finishDrawing}
          style=${{
            cursor: 'crosshair', 
            width: '100%', 
            height: '100%', 
            touchAction: 'none',
            display: 'block'
          }}
        />
        <button type="button" onClick=${clear} style=${{position: 'absolute', top: '8px', right: '8px', background: 'rgba(239, 68, 68, 0.8)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', zIndex: 10}}>Borrar</button>
      </div>
    </div>
  `;
};
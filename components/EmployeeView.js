import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { storage } from '../services/storage.js';
import { SignaturePad } from './SignaturePad.js';
import { Play, CheckCircle2, Download, UserCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

const html = htm.bind(React.createElement);

const EmployeeView = ({ onFinish }) => {
  const [link, setLink] = useState(null);
  const [training, setTraining] = useState(null);
  const [company, setCompany] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [viewed, setViewed] = useState([]);
  const [form, setForm] = useState({ name: '', dni: '', signature: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const hash = window.location.hash;
    const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    const ltId = params.get('lt');

    if (ltId) {
      const l = storage.getLinkedTrainings().find(x => x.id === ltId);
      if (l) {
        setLink(l);
        setTraining(storage.getTrainings().find(t => t.id === l.trainingId));
        setCompany(storage.getCompanies().find(c => c.id === l.companyId));
        setInstructor(storage.getProfile());
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hashchange', loadData);
    return () => window.removeEventListener('hashchange', loadData);
  }, []);

  const progress = (training?.links?.length > 0) 
    ? Math.round((viewed.length / training.links.length) * 100) 
    : 0;

  const handleView = (id, url) => {
    if (!viewed.includes(id)) setViewed([...viewed, id]);
    window.open(url, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (progress < 100) return alert("Completa el 100% de la capacitación visualizando todos los módulos.");
    if (!form.signature) return alert("Por favor, ingresa tu firma digital.");
    
    const rec = { 
      id: storage.generateId(), 
      linkedTrainingId: link.id,
      employeeName: form.name, 
      employeeDni: form.dni,
      signature: form.signature, 
      date: new Date().toISOString() 
    };
    storage.setRecords([...storage.getRecords(), rec]);
    setDone(true);
  };

  const downloadCert = () => {
    const doc = new jsPDF();
    const darkBlueHeader = [28, 36, 49];
    
    // Encabezado Oscuro
    doc.setFillColor(darkBlueHeader[0], darkBlueHeader[1], darkBlueHeader[2]);
    doc.rect(0, 0, 210, 48, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificado de Capacitación', 15, 30);
    
    // Cuerpo del Certificado
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Por medio de la presente, se certifica que', 15, 75);
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(form.name.toUpperCase(), 15, 90);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`con DNI N° ${form.dni}, de la empresa ${company?.name || 'N/A'} (CUIT: ${company?.cuit || 'N/A'}),`, 15, 105);
    doc.text('ha completado y aprobado la capacitación denominada:', 15, 112);
    
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`"${training?.title.toUpperCase() || 'CAPACITACIÓN'}"`, 15, 130);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Realizada en la fecha ${new Date().toLocaleDateString()}.`, 15, 148);

    // Firmas al pie
    const footerY = 255;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerY - 5, 95, footerY - 5);
    doc.line(115, footerY - 5, 195, footerY - 5);
    
    if (form.signature) {
      try { doc.addImage(form.signature, 'PNG', 30, footerY - 26, 40, 20); } catch(e){}
    }
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Firma del Asistente', 55, footerY, { align: 'center' });

    if (instructor?.signature) {
      try { doc.addImage(instructor.signature, 'PNG', 135, footerY - 26, 40, 20); } catch(e){}
    }
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(instructor?.name.toUpperCase() || 'INSTRUCTOR', 155, footerY + 2, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(instructor?.position.toUpperCase() || 'RESPONSABLE', 155, footerY + 7, { align: 'center' });

    doc.save(`Certificado_${form.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return html`<div className="login-screen">Cargando...</div>`;
  
  if (!link) return html`
    <div className="login-screen">
      <div className="card fade-in" style=${{textAlign: 'center', padding: '40px'}}>
        <h2 style=${{color: 'var(--danger)'}}>Acceso Inválido</h2>
        <p style=${{color: 'var(--text-muted)'}}>La capacitación no existe o el enlace ha caducado.</p>
        <button onClick=${onFinish} className="btn btn-primary" style=${{marginTop: '20px'}}>Volver al inicio</button>
      </div>
    </div>
  `;

  if (done) return html`
    <div className="login-screen">
      <div className="card fade-in" style=${{textAlign: 'center', padding: '40px', maxWidth: '400px'}}>
        <${CheckCircle2} size=${60} color="var(--success)" style=${{marginBottom: '20px'}} />
        <h2>¡Asistencia Registrada!</h2>
        <p style=${{marginBottom: '24px', color: 'var(--text-muted)'}}>Ya podés descargar tu comprobante oficial.</p>
        <button onClick=${downloadCert} className="btn btn-primary" style=${{width: '100%', marginBottom: '12px', padding: '16px'}}>
          <${Download} size=${18} /> Descargar Certificado
        </button>
        <button onClick=${onFinish} className="btn btn-ghost" style=${{width: '100%'}}>Cerrar Aplicación</button>
      </div>
    </div>
  `;

  return html`
    <div className="app-container" style=${{maxWidth: '700px', paddingTop: '40px'}}>
      <div className="card fade-in">
        <header style=${{textAlign: 'center', marginBottom: '32px'}}>
          <h1 style=${{fontSize: '28px', marginBottom: '8px'}}>${training?.title}</h1>
          <p style=${{color: 'var(--text-muted)'}}>Empresa: <strong style=${{color: 'white'}}>${company?.name}</strong></p>
        </header>

        <div style=${{marginBottom: '32px'}}>
          <div className="flex justify-between" style=${{marginBottom: '8px', fontSize: '14px'}}>
            <span>Progreso de Lectura</span>
            <span style=${{color: 'var(--primary)', fontWeight: 'bold'}}>${progress}%</span>
          </div>
          <div style=${{height: '10px', background: 'var(--input-bg)', borderRadius: '10px', overflow: 'hidden'}}>
            <div style=${{width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.4s ease'}}></div>
          </div>
        </div>

        <div className="flex flex-column gap-4" style=${{marginBottom: '40px'}}>
          ${training?.links.map((l, idx) => html`
            <div key=${l.id} className="card flex justify-between items-center" style=${{
              padding: '16px', 
              background: viewed.includes(l.id) ? 'rgba(16, 185, 129, 0.05)' : 'var(--input-bg)',
              border: viewed.includes(l.id) ? '1px solid var(--success)' : '1px solid var(--card-border)'
            }}>
              <div className="flex items-center" style=${{gap: '12px'}}>
                 <div style=${{width: '24px', height: '24px', borderRadius: '50%', background: viewed.includes(l.id) ? 'var(--success)' : 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'}}>
                   ${viewed.includes(l.id) ? html`<${CheckCircle2} size=${14} />` : idx + 1}
                 </div>
                 <span style=${{fontWeight: 600, color: viewed.includes(l.id) ? 'var(--text-main)' : 'var(--text-muted)'}}>${l.title}</span>
              </div>
              <button onClick=${() => handleView(l.id, l.url)} className="btn btn-ghost" style=${{padding: '8px 16px'}}>
                <${Play} size=${14} /> Ver Módulo
              </button>
            </div>
          `)}
        </div>

        <section style=${{
          opacity: progress === 100 ? 1 : 0.4, 
          pointerEvents: progress === 100 ? 'auto' : 'none', 
          borderTop: '1px dashed var(--card-border)', 
          paddingTop: '32px'
        }}>
          <div className="flex items-center" style=${{gap: '12px', marginBottom: '24px'}}>
             <${UserCheck} color="var(--primary)" />
             <h3 style=${{margin: 0}}>Formulario de Asistencia</h3>
          </div>

          <form onSubmit=${handleSubmit} className="flex flex-column gap-4">
            <div className="grid grid-md-2" style=${{gap: '16px'}}>
              <input required placeholder="Nombre y Apellido" value=${form.name} onChange=${e => setForm({...form, name: e.target.value})} className="input" />
              <input required placeholder="DNI" value=${form.dni} onChange=${e => setForm({...form, dni: e.target.value})} className="input" />
            </div>
            <${SignaturePad} label="Dibuja tu firma digital aquí" onSave=${sig => setForm({...form, signature: sig})} />
            <button type="submit" className="btn btn-primary" style=${{padding: '16px', fontSize: '16px', marginTop: '10px'}}>
              Finalizar y Registrarse
            </button>
          </form>
          
          ${progress < 100 && html`
            <p style=${{textAlign: 'center', color: 'var(--danger)', fontSize: '12px', marginTop: '16px'}}>
              * El botón de registro se habilitará al completar el 100% de la capacitación.
            </p>
          `}
        </section>
      </div>
    </div>
  `;
};

export default EmployeeView;
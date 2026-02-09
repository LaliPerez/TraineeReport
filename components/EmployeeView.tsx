import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage.ts';
import { LinkedTraining, Training, Company, AttendanceRecord, InstructorProfile } from '../types.ts';
import { Play, CheckCircle2, UserCheck, Download, ChevronRight } from 'lucide-react';
import { SignaturePad } from './SignaturePad.tsx';
import { jsPDF } from 'jspdf';

const EmployeeView: React.FC<{onFinish: () => void}> = ({ onFinish }) => {
  const [link, setLink] = useState<LinkedTraining | null>(null);
  const [training, setTraining] = useState<Training | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [viewed, setViewed] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', dni: '', signature: '' });
  const [done, setDone] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const query = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(query);
    const ltId = params.get('lt');
    
    if (ltId) {
      const allLinks = storage.getLinkedTrainings();
      const l = allLinks.find(x => x.id === ltId);
      if (l) {
        setLink(l);
        setTraining(storage.getTrainings().find(t => t.id === l.trainingId) || null);
        setCompany(storage.getCompanies().find(c => c.id === l.companyId) || null);
        setProfile(storage.getProfile());
      }
    }
  }, []);

  const progress = training ? Math.round((viewed.length / training.links.length) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (progress < 100) {
      alert("Debes completar el 100% de la capacitación visualizando todos los módulos.");
      return;
    }
    if (!form.signature) {
      alert("Por favor, ingresa tu firma digital.");
      return;
    }
    const rec: AttendanceRecord = { 
      id: storage.generateId(),
      linkedTrainingId: link!.id,
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
    const primaryColor = [59, 130, 246]; // RGB para var(--primary)
    
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 190, 277);

    doc.setFontSize(28);
    doc.setTextColor(30, 30, 30);
    doc.text('CERTIFICADO DE ASISTENCIA', 105, 50, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Se certifica formalmente que:', 105, 75, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(form.name.toUpperCase(), 105, 90, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Documento de Identidad: ${form.dni}`, 105, 100, { align: 'center' });
    
    doc.text('Ha participado y cumplimentado íntegramente la capacitación de:', 105, 120, { align: 'center' });
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(training?.title || 'Capacitación Profesional', 105, 135, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'italic');
    doc.text(`Para la organización: ${company?.name || 'Empresa Registrada'}`, 105, 145, { align: 'center' });

    const dateStr = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Emitido el día ${dateStr}`, 105, 165, { align: 'center' });

    doc.setDrawColor(220, 220, 220);
    doc.line(40, 185, 170, 185);

    if (profile) {
      if (profile.signature) {
        doc.addImage(profile.signature, 'PNG', 75, 215, 60, 25);
      }
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.line(70, 245, 140, 245);
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'bold');
      doc.text(profile.name, 105, 252, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(profile.position, 105, 258, { align: 'center' });
      doc.text('Instructor Responsable - TrainerPro', 105, 264, { align: 'center' });
    }

    doc.save(`Certificado-${form.name.replace(/\s+/g, '_')}.pdf`);
  };

  if (done) {
    return (
      <div className="login-screen">
        <div className="card login-box fade-in" style={{padding: '48px'}}>
          <div style={{color: 'var(--success)', marginBottom: '20px'}}><CheckCircle2 size={64}/></div>
          <h2>¡Proceso Completado!</h2>
          <p style={{color: 'var(--text-muted)', marginBottom: '32px'}}>Tu asistencia ha sido registrada correctamente en el sistema de TrainerPro.</p>
          <button onClick={downloadCert} className="btn btn-primary" style={{width: '100%', marginBottom: '12px'}}><Download size={18}/> Descargar Mi Certificado</button>
          <button onClick={onFinish} className="btn btn-ghost" style={{width: '100%'}}>Finalizar y Salir</button>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="login-screen">
        <div className="card fade-in" style={{textAlign: 'center'}}>
          <p>Cargando información de la capacitación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{maxWidth: '740px', paddingTop: '40px'}}>
      <div className="card fade-in">
        <header style={{textAlign: 'center', marginBottom: '40px'}}>
          <div style={{display: 'inline-block', background: 'rgba(59, 130, 246, 0.1)', padding: '8px 16px', borderRadius: '20px', color: 'var(--primary)', fontSize: '12px', fontWeight: 600, marginBottom: '16px'}}>
            Módulo de Capacitación Externa
          </div>
          <h1 style={{margin: '0 0 12px', fontSize: '32px', fontWeight: 800}}>{training?.title}</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '18px', margin: 0}}>Empresa solicitante: <span style={{color: 'white', fontWeight: 600}}>{company?.name}</span></p>
        </header>

        <section style={{marginBottom: '40px'}}>
          <div className="flex justify-between items-center" style={{marginBottom: '12px'}}>
            <h3 style={{margin: 0, fontSize: '16px'}}>Tu progreso de aprendizaje</h3>
            <span style={{fontWeight: 700, color: progress === 100 ? 'var(--success)' : 'var(--primary)'}}>{progress}%</span>
          </div>
          <div style={{height: '12px', background: 'var(--input-bg)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--card-border)'}}>
            <div style={{width: `${progress}%`, height: '100%', background: progress === 100 ? 'var(--success)' : 'linear-gradient(90deg, var(--primary), #60a5fa)', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}></div>
          </div>
        </section>

        <section style={{display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '48px'}}>
          <label style={{fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500}}>Contenidos obligatorios:</label>
          {training?.links.map((l, idx) => (
            <button 
              key={l.id} 
              onClick={() => { if (!viewed.includes(l.id)) setViewed([...viewed, l.id]); window.open(l.url, '_blank'); }}
              className="card flex justify-between items-center" 
              style={{
                padding: '20px', 
                background: viewed.includes(l.id) ? 'rgba(16, 185, 129, 0.05)' : 'var(--input-bg)', 
                border: viewed.includes(l.id) ? '1px solid var(--success)' : '1px solid var(--card-border)', 
                cursor: 'pointer', 
                textAlign: 'left', 
                width: '100%',
                transition: 'all 0.2s'
              }}
            >
              <div className="flex items-center" style={{gap: '18px'}}>
                <div style={{
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: viewed.includes(l.id) ? 'var(--success)' : 'var(--card-border)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: viewed.includes(l.id) ? 'white' : 'var(--text-muted)',
                  fontSize: '14px',
                  fontWeight: 700
                }}>
                  {viewed.includes(l.id) ? <CheckCircle2 size={18} /> : idx + 1}
                </div>
                <div>
                  <div style={{fontWeight: 600, color: viewed.includes(l.id) ? 'var(--text-main)' : 'var(--text-muted)'}}>{l.title}</div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Clic para abrir material de estudio</div>
                </div>
              </div>
              <Play size={18} color={viewed.includes(l.id) ? 'var(--success)' : 'var(--primary)'} />
            </button>
          ))}
        </section>

        <section style={{opacity: progress === 100 ? 1 : 0.4, pointerEvents: progress === 100 ? 'auto' : 'none', borderTop: '2px dashed var(--card-border)', paddingTop: '40px'}}>
          <div className="flex items-center" style={{gap: '12px', marginBottom: '24px'}}>
            <div style={{background: 'var(--primary)', padding: '8px', borderRadius: '8px'}}><UserCheck color="white" size={20}/></div>
            <h3 style={{margin: 0}}>Registro Final de Asistencia</h3>
          </div>
          
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="grid grid-md-2" style={{gap: '20px'}}>
              <div>
                <label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>Nombre y Apellido del Empleado</label>
                <input placeholder="Ej: Perez, Juan" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" />
              </div>
              <div>
                <label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>Documento (DNI)</label>
                <input placeholder="Sin puntos" required value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} className="input" />
              </div>
            </div>
            
            <SignaturePad label="Firma Digital del Empleado" onSave={sig => setForm({...form, signature: sig})} />
            
            <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '18px', fontSize: '16px', marginTop: '12px', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'}}>
              Firmar y Obtener Certificado
            </button>
          </form>
          
          {progress < 100 && (
            <p style={{textAlign: 'center', fontSize: '13px', color: 'var(--danger)', marginTop: '20px', fontWeight: 500}}>
              * El formulario se habilitará una vez visualizados todos los materiales de estudio.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default EmployeeView;
import React, { useState, useEffect } from 'react';
import { 
  User, Building2, BookOpen, Link as LinkIcon, 
  ClipboardCheck, Plus, Trash2, QrCode, Download, X
} from 'lucide-react';
import { storage } from '../services/storage.ts';
import { Company, Training, LinkedTraining, InstructorProfile, AttendanceRecord } from '../types.ts';
import { SignaturePad } from './SignaturePad.tsx';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'companies' | 'trainings' | 'links' | 'records'>('profile');
  
  const [profile, setProfile] = useState<InstructorProfile>(storage.getProfile() || { name: '', position: '', signature: '' });
  const [companies, setCompanies] = useState<Company[]>(storage.getCompanies());
  const [trainings, setTrainings] = useState<Training[]>(storage.getTrainings());
  const [links, setLinks] = useState<LinkedTraining[]>(storage.getLinkedTrainings());
  const [records, setRecords] = useState<AttendanceRecord[]>(storage.getRecords());

  const [newCompany, setNewCompany] = useState({ name: '', cuit: '' });
  const [newTraining, setNewTraining] = useState({ title: '', links: [{ title: '', url: '' }] });
  const [newLink, setNewLink] = useState({ trainingId: '', companyId: '' });
  const [filterCompany, setFilterCompany] = useState('');
  const [filterTraining, setFilterTraining] = useState('');

  useEffect(() => { storage.setProfile(profile); }, [profile]);
  useEffect(() => { storage.setCompanies(companies); }, [companies]);
  useEffect(() => { storage.setTrainings(trainings); }, [trainings]);
  useEffect(() => { storage.setLinkedTrainings(links); }, [links]);
  useEffect(() => { storage.setRecords(records); }, [records]);

  const addCompany = () => {
    if (!newCompany.name) return;
    setCompanies([...companies, { ...newCompany, id: storage.generateId() }]);
    setNewCompany({ name: '', cuit: '' });
  };

  const addTraining = () => {
    if (!newTraining.title) return;
    const processedLinks = newTraining.links
      .filter(l => l.url)
      .map(l => ({ ...l, id: storage.generateId(), title: l.title || 'Módulo' }));
    
    setTrainings([...trainings, { 
      id: storage.generateId(), 
      title: newTraining.title, 
      links: processedLinks as any 
    }]);
    setNewTraining({ title: '', links: [{ title: '', url: '' }] });
  };

  const addLink = () => {
    if (!newLink.trainingId || !newLink.companyId) return;
    setLinks([...links, { ...newLink, id: storage.generateId() }]);
  };

  const deleteRecord = (id: string) => {
    if (confirm('¿Deseas eliminar este registro de asistencia de forma permanente?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const downloadRecordsPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(20, 20, 22);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Registro de Asistencia', 15, 25);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let y = 50;
    
    doc.text(['Empleado', 'DNI', 'Empresa', 'Capacitación', 'Fecha'].join(' | '), 15, y);
    y += 5;
    doc.line(15, y, 195, y);
    y += 10;

    filteredRecords.forEach((r, i) => {
      const linkData = links.find(l => l.id === r.linkedTrainingId);
      const comp = companies.find(c => c.id === linkData?.companyId);
      const train = trainings.find(t => t.id === linkData?.trainingId);
      
      const line = `${r.employeeName} | ${r.employeeDni} | ${comp?.name || 'N/A'} | ${train?.title || 'N/A'} | ${new Date(r.date).toLocaleDateString()}`;
      doc.text(line, 15, y);
      y += 10;
      if (y > 280) { doc.addPage(); y = 20; }
    });
    doc.save('registro-asistencia-trainerpro.pdf');
  };

  const filteredRecords = records.filter(r => {
    const link = links.find(l => l.id === r.linkedTrainingId);
    if (!link) return false;
    const matchesCompany = filterCompany ? link.companyId === filterCompany : true;
    const matchesTraining = filterTraining ? link.trainingId === filterTraining : true;
    return matchesCompany && matchesTraining;
  });

  return (
    <div className="grid" style={{gridTemplateColumns: 'minmax(200px, 1fr) 4fr', gap: '32px'}}>
      <nav style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        {[
          { id: 'profile', label: 'Mi Perfil', icon: User },
          { id: 'companies', label: 'Empresas', icon: Building2 },
          { id: 'trainings', label: 'Capacitaciones', icon: BookOpen },
          { id: 'links', label: 'Vincular y QR', icon: LinkIcon },
          { id: 'records', label: 'Asistencias', icon: ClipboardCheck },
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`btn ${activeTab === item.id ? 'btn-primary' : 'btn-ghost'}`}
            style={{justifyContent: 'flex-start'}}
          >
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </nav>

      <div className="fade-in">
        {activeTab === 'profile' && (
          <div className="card">
            <h3 style={{margin: '0 0 24px'}}>Configuración del Instructor</h3>
            <div className="grid grid-md-2" style={{gap: '20px', marginBottom: '24px'}}>
              <div>
                <label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>Nombre Completo</label>
                <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="input" placeholder="Ej: Juan Pérez" />
              </div>
              <div>
                <label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>Cargo / Título</label>
                <input value={profile.position} onChange={e => setProfile({...profile, position: e.target.value})} className="input" placeholder="Ej: Especialista en Seguridad" />
              </div>
            </div>
            <SignaturePad label="Firma Digital del Instructor" onSave={sig => setProfile({...profile, signature: sig})} />
            {profile.signature && <div style={{marginTop: '10px', fontSize: '12px', color: 'var(--success)'}}>Firma configurada correctamente</div>}
          </div>
        )}

        {activeTab === 'companies' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="card">
              <h3 style={{margin: '0 0 20px'}}>Nueva Empresa</h3>
              <div className="grid grid-md-3" style={{gap: '12px'}}>
                <input placeholder="Nombre Empresa" value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} className="input" />
                <input placeholder="CUIT" value={newCompany.cuit} onChange={e => setNewCompany({...newCompany, cuit: e.target.value})} className="input" />
                <button onClick={addCompany} className="btn btn-primary"><Plus size={18} /> Agregar</button>
              </div>
            </div>
            <div className="grid grid-md-2" style={{gap: '16px'}}>
              {companies.map(c => (
                <div key={c.id} className="card flex justify-between items-center" style={{padding: '16px'}}>
                  <div>
                    <div style={{fontWeight: 'bold'}}>{c.name}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>CUIT: {c.cuit}</div>
                  </div>
                  <button onClick={() => setCompanies(companies.filter(x => x.id !== c.id))} className="btn btn-danger" style={{padding: '8px'}}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trainings' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="card">
              <h3 style={{margin: '0 0 20px'}}>Crear Capacitación</h3>
              <input placeholder="Título General (ej: Prevención de Riesgos)" value={newTraining.title} onChange={e => setNewTraining({...newTraining, title: e.target.value})} className="input" style={{marginBottom: '16px'}} />
              <label style={{fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block'}}>Enlaces de Contenido (Drive, YouTube, etc.)</label>
              {newTraining.links.map((l, i) => (
                <div key={i} className="flex gap-4" style={{marginBottom: '10px'}}>
                  <input placeholder="Título del Módulo" value={l.title} onChange={e => {
                    const next = [...newTraining.links]; next[i].title = e.target.value; setNewTraining({...newTraining, links: next});
                  }} className="input" style={{flex: 1}} />
                  <input placeholder="URL del Enlace" value={l.url} onChange={e => {
                    const next = [...newTraining.links]; next[i].url = e.target.value; setNewTraining({...newTraining, links: next});
                  }} className="input" style={{flex: 2}} />
                  {newTraining.links.length > 1 && (
                    <button onClick={() => setNewTraining({...newTraining, links: newTraining.links.filter((_, idx) => idx !== i)})} className="btn btn-danger" style={{padding: '8px'}}><X size={16}/></button>
                  )}
                </div>
              ))}
              <button onClick={() => setNewTraining({...newTraining, links: [...newTraining.links, {title:'', url:''}]})} className="btn btn-ghost" style={{marginBottom: '16px', width: '100%'}}><Plus size={16}/> Añadir otro módulo</button>
              <button onClick={addTraining} className="btn btn-primary" style={{width: '100%'}}>Guardar Capacitación</button>
            </div>
            <div className="grid grid-md-2" style={{gap: '16px'}}>
              {trainings.map(t => (
                <div key={t.id} className="card flex justify-between items-center" style={{padding: '16px'}}>
                  <div>
                    <div style={{fontWeight: 'bold'}}>{t.title}</div>
                    <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{t.links.length} módulos</div>
                  </div>
                  <button onClick={() => setTrainings(trainings.filter(x => x.id !== t.id))} className="btn btn-danger" style={{padding: '8px'}}><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="card">
              <h3 style={{margin: '0 0 20px'}}>Vincular y Generar QR</h3>
              <div className="grid grid-md-2" style={{gap: '12px', marginBottom: '16px'}}>
                <select className="input" value={newLink.trainingId} onChange={e => setNewLink({...newLink, trainingId: e.target.value})}>
                  <option value="">Seleccionar Capacitación</option>
                  {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <select className="input" value={newLink.companyId} onChange={e => setNewLink({...newLink, companyId: e.target.value})}>
                  <option value="">Seleccionar Empresa</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <button onClick={addLink} className="btn btn-primary" style={{width: '100%'}}><QrCode size={18}/> Crear QR de Acceso</button>
            </div>
            <div className="grid grid-md-3" style={{gap: '20px'}}>
              {links.map(l => {
                const t = trainings.find(x => x.id === l.trainingId);
                const c = companies.find(x => x.id === l.companyId);
                const url = `${window.location.origin}${window.location.pathname}#/view?lt=${l.id}`;
                return (
                  <div key={l.id} className="card" style={{textAlign: 'center', position: 'relative'}}>
                    <button onClick={() => setLinks(links.filter(x => x.id !== l.id))} style={{position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer'}}><Trash2 size={16}/></button>
                    <div style={{marginBottom: '4px', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={t?.title}>{t?.title}</div>
                    <div style={{marginBottom: '12px', color: 'var(--primary)', fontSize: '11px', fontWeight: 600}}>{c?.name}</div>
                    <div style={{background: 'white', padding: '10px', borderRadius: '8px', marginBottom: '12px', display: 'inline-block', cursor: 'pointer'}} onClick={() => window.open(url, '_blank')}>
                      <QRCodeSVG value={url} size={140} />
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(url); alert('Enlace copiado'); }} className="btn btn-ghost" style={{width: '100%', fontSize: '11px'}}>Copiar URL de Acceso</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="card">
             <div className="flex justify-between items-center" style={{marginBottom: '24px'}}>
               <h3 style={{margin: 0}}>Asistencias Registradas</h3>
               <div className="flex gap-4">
                 <select className="input" style={{width: '160px'}} value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                   <option value="">Empresa: Todas</option>
                   {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
                 <select className="input" style={{width: '160px'}} value={filterTraining} onChange={e => setFilterTraining(e.target.value)}>
                   <option value="">Curso: Todos</option>
                   {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                 </select>
                 <button onClick={downloadRecordsPDF} className="btn btn-ghost"><Download size={18}/> Exportar</button>
               </div>
             </div>
             <div className="table-container">
               <table>
                 <thead>
                   <tr>
                     <th>Empleado</th>
                     <th>DNI</th>
                     <th>Empresa</th>
                     <th>Capacitación</th>
                     <th>Fecha</th>
                     <th>Firma</th>
                     <th style={{textAlign: 'right'}}>Acción</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredRecords.length === 0 ? (
                     <tr><td colSpan={7} style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>No se encontraron registros.</td></tr>
                   ) : filteredRecords.map(r => {
                     const link = links.find(l => l.id === r.linkedTrainingId);
                     const train = trainings.find(t => t.id === link?.trainingId);
                     const comp = companies.find(c => c.id === link?.companyId);
                     return (
                       <tr key={r.id}>
                         <td style={{fontWeight: 500}}>{r.employeeName}</td>
                         <td>{r.employeeDni}</td>
                         <td style={{fontSize: '12px', color: 'var(--text-muted)'}}>{comp?.name}</td>
                         <td style={{fontSize: '12px'}}>{train?.title}</td>
                         <td>{new Date(r.date).toLocaleDateString()}</td>
                         <td><img src={r.signature} style={{height: '20px', filter: 'invert(1)', opacity: 0.8}} /></td>
                         <td style={{textAlign: 'right'}}>
                           <button onClick={() => deleteRecord(r.id)} className="btn btn-danger" style={{padding: '6px'}} title="Eliminar registro">
                             <Trash2 size={14} />
                           </button>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
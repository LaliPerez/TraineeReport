
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { 
  User, Building2, BookOpen, Link as LinkIcon, 
  ClipboardCheck, Plus, Trash2, QrCode, Download, X, Save
} from 'lucide-react';
import { storage } from '../services/storage.js';
import { SignaturePad } from './SignaturePad.js';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

const html = htm.bind(React.createElement);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState(storage.getProfile());
  const [saveFeedback, setSaveFeedback] = useState(false);

  const [companies, setCompanies] = useState(storage.getCompanies());
  const [trainings, setTrainings] = useState(storage.getTrainings());
  const [links, setLinks] = useState(storage.getLinkedTrainings());
  const [records, setRecords] = useState(storage.getRecords());

  const [newCompany, setNewCompany] = useState({ name: '', cuit: '' });
  const [newTraining, setNewTraining] = useState({ title: '', links: [{ title: '', url: '' }] });
  const [newLink, setNewLink] = useState({ trainingId: '', companyId: '' });
  
  const [filterCompany, setFilterCompany] = useState('');
  const [filterTraining, setFilterTraining] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Persistencia automática de datos de negocio
  useEffect(() => { storage.setCompanies(companies); }, [companies]);
  useEffect(() => { storage.setTrainings(trainings); }, [trainings]);
  useEffect(() => { storage.setLinkedTrainings(links); }, [links]);
  useEffect(() => { storage.setRecords(records); }, [records]);

  const saveProfileManually = () => {
    storage.setProfile(profile);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  const addCompany = () => {
    if (!newCompany.name) return;
    setCompanies([...companies, { ...newCompany, id: storage.generateId() }]);
    setNewCompany({ name: '', cuit: '' });
  };

  const addLinkToTraining = () => {
    setNewTraining({
      ...newTraining,
      links: [...newTraining.links, { title: '', url: '' }]
    });
  };

  const updateLinkData = (index, field, value) => {
    const updatedLinks = [...newTraining.links];
    updatedLinks[index][field] = value;
    setNewTraining({ ...newTraining, links: updatedLinks });
  };

  const saveTraining = () => {
    if (!newTraining.title || newTraining.links.some(l => !l.url)) {
      alert("Por favor, completa el título y los enlaces.");
      return;
    }
    const processedTraining = {
      id: storage.generateId(),
      title: newTraining.title,
      links: newTraining.links.map(l => ({
        ...l,
        id: storage.generateId(),
        title: l.title || 'Módulo'
      }))
    };
    setTrainings([...trainings, processedTraining]);
    setNewTraining({ title: '', links: [{ title: '', url: '' }] });
    alert("Capacitación guardada exitosamente.");
  };

  const addLink = () => {
    if (!newLink.trainingId || !newLink.companyId) return;
    const existing = links.find(lx => lx.trainingId === newLink.trainingId && lx.companyId === newLink.companyId);
    if(existing) return alert("Esta vinculación ya existe.");
    setLinks([...links, { ...newLink, id: storage.generateId() }]);
  };

  const downloadRecordsPDF = () => {
    const targetData = filteredRecords;
    if (targetData.length === 0) return alert("No hay datos para exportar.");

    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRO DE ASISTENCIAS', 15, 28);
    
    let y = 60;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    
    targetData.forEach((r) => {
      const lObj = links.find(l => l.id === r.linkedTrainingId);
      const cObj = companies.find(c => c.id === lObj?.companyId);
      const tObj = trainings.find(t => t.id === lObj?.trainingId);

      doc.setFont('helvetica', 'bold');
      doc.text(`${r.employeeName.toUpperCase()} - DNI: ${r.employeeDni}`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${tObj?.title || 'Capacitación'} | ${cObj?.name || 'Empresa'} | ${new Date(r.date).toLocaleDateString()}`, 15, y + 6);
      
      if (r.signature) {
        try { doc.addImage(r.signature, 'PNG', 160, y - 5, 30, 15); } catch(e){}
      }
      
      doc.setDrawColor(230, 230, 230);
      doc.line(15, y + 12, 195, y + 12);
      y += 22;
      if (y > 270) { doc.addPage(); y = 30; }
    });

    doc.save('asistencias_trainerpro.pdf');
  };

  const filteredRecords = records.filter(r => {
    const link = links.find(l => l.id === r.linkedTrainingId);
    if (!link) return false;
    const matchesCompany = filterCompany ? link.companyId === filterCompany : true;
    const matchesTraining = filterTraining ? link.trainingId === filterTraining : true;
    const matchesSearch = r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.employeeDni.includes(searchTerm);
    return matchesCompany && matchesTraining && matchesSearch;
  });

  return html`
    <div className="grid" style=${{gridTemplateColumns: 'minmax(200px, 1fr) 4fr', gap: '32px'}}>
      <nav style=${{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        ${[
          { id: 'profile', label: 'Mi Perfil', icon: User },
          { id: 'companies', label: 'Empresas', icon: Building2 },
          { id: 'trainings', label: 'Capacitaciones', icon: BookOpen },
          { id: 'links', label: 'Vincular y QR', icon: LinkIcon },
          { id: 'records', label: 'Asistencias', icon: ClipboardCheck },
        ].map(item => html`
          <button key=${item.id} onClick=${() => setActiveTab(item.id)} className=${`btn ${activeTab === item.id ? 'btn-primary' : 'btn-ghost'}`} style=${{justifyContent: 'flex-start'}}>
            <${item.icon} size=${18} /> ${item.label}
          </button>
        `)}
      </nav>

      <div className="fade-in">
        ${activeTab === 'profile' && html`
          <div className="card">
            <h3 style=${{marginBottom: '24px'}}>Mi Perfil Profesional</h3>
            <div className="grid grid-md-2" style=${{gap: '20px', marginBottom: '24px'}}>
              <div>
                <label style=${{fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px', display:'block'}}>Nombre y Apellido</label>
                <input value=${profile.name} onChange=${e => setProfile({...profile, name: e.target.value})} className="input" placeholder="Juan Pérez" />
              </div>
              <div>
                <label style=${{fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px', display:'block'}}>Cargo / Título</label>
                <input value=${profile.position} onChange=${e => setProfile({...profile, position: e.target.value})} className="input" placeholder="Ej: Instructor Líder" />
              </div>
            </div>

            <div style=${{marginBottom: '24px'}}>
              <label style=${{fontSize:'12px', color:'var(--text-muted)', marginBottom:'12px', display:'block'}}>Firma Digital Guardada</label>
              <div style=${{background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid var(--card-border)', minHeight: '80px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                ${profile.signature ? html`<img src=${profile.signature} style=${{maxHeight: '100px', display: 'block'}} />` : html`<span style=${{color: '#999', fontSize: '13px'}}>La firma aparecerá aquí después de guardarla</span>`}
              </div>
              
              <${SignaturePad} label="Capturar Nueva Firma" onSave=${sig => setProfile({...profile, signature: sig})} />
            </div>

            <button onClick=${saveProfileManually} className="btn btn-primary" style=${{width: '100%'}}>
              <${Save} size=${18} /> Guardar Cambios del Perfil
            </button>
            ${saveFeedback && html`<p style=${{color: 'var(--success)', textAlign: 'center', marginTop: '10px', fontWeight: 600}}>✓ Perfil actualizado correctamente</p>`}
          </div>
        `}

        ${activeTab === 'companies' && html`
          <div className="card">
            <h3>Empresas Registradas</h3>
            <div className="grid grid-md-3" style=${{gap: '12px', marginBottom: '24px'}}>
              <input placeholder="Nombre Empresa" value=${newCompany.name} onChange=${e => setNewCompany({...newCompany, name: e.target.value})} className="input" />
              <input placeholder="CUIT" value=${newCompany.cuit} onChange=${e => setNewCompany({...newCompany, cuit: e.target.value})} className="input" />
              <button onClick=${addCompany} className="btn btn-primary"><${Plus} size=${18} /> Añadir</button>
            </div>
            <div className="grid grid-md-2" style=${{gap: '16px'}}>
              ${companies.map(c => html`
                <div key=${c.id} className="card flex justify-between items-center" style=${{padding: '16px'}}>
                  <div>
                    <div style=${{fontWeight: 'bold'}}>${c.name}</div>
                    <div style=${{fontSize: '12px', color: 'var(--text-muted)'}}>CUIT: ${c.cuit}</div>
                  </div>
                  <button onClick=${() => setCompanies(companies.filter(x => x.id !== c.id))} className="btn btn-danger" style=${{padding: '8px'}}><${Trash2} size=${16}/></button>
                </div>
              `)}
            </div>
          </div>
        `}

        ${activeTab === 'trainings' && html`
          <div style=${{display: 'flex', flexDirection: 'column', gap: '24px'}}>
            <div className="card">
              <h3>Nueva Capacitación</h3>
              <input placeholder="Título General del Curso" value=${newTraining.title} onChange=${e => setNewTraining({...newTraining, title: e.target.value})} className="input" style=${{marginBottom: '20px'}} />
              ${newTraining.links.map((link, idx) => html`
                <div key=${idx} className="flex gap-4" style=${{marginBottom: '10px'}}>
                  <input placeholder="Título del Módulo" value=${link.title} onChange=${e => updateLinkData(idx, 'title', e.target.value)} className="input" style=${{flex: 1}} />
                  <input placeholder="URL (Google Drive / PDF)" value=${link.url} onChange=${e => updateLinkData(idx, 'url', e.target.value)} className="input" style=${{flex: 2}} />
                </div>
              `)}
              <div className="flex gap-4" style=${{marginTop: '16px'}}>
                <button onClick=${addLinkToTraining} className="btn btn-ghost" style=${{flex: 1}}><${Plus} size=${16} /> Agregar Módulo</button>
                <button onClick=${saveTraining} className="btn btn-primary" style=${{flex: 2}}><${Save} size=${18} /> Guardar Curso</button>
              </div>
            </div>

            <div className="grid grid-md-2" style=${{gap: '16px'}}>
              ${trainings.map(t => html`
                <div key=${t.id} className="card flex justify-between items-center" style=${{padding: '16px'}}>
                  <div>
                    <div style=${{fontWeight: 'bold'}}>${t.title}</div>
                    <div style=${{fontSize: '12px', color: 'var(--text-muted)'}}>${t.links.length} módulos cargados</div>
                  </div>
                  <button onClick=${() => setTrainings(trainings.filter(x => x.id !== t.id))} className="btn btn-danger" style=${{padding: '8px'}}><${Trash2} size=${16}/></button>
                </div>
              `)}
            </div>
          </div>
        `}

        ${activeTab === 'links' && html`
          <div className="card">
            <h3>Generador de Códigos QR</h3>
            <div className="grid grid-md-2" style=${{gap: '12px', marginBottom: '20px'}}>
              <select className="input" value=${newLink.trainingId} onChange=${e => setNewLink({...newLink, trainingId: e.target.value})}>
                <option value="">-- Seleccionar Capacitación --</option>
                ${trainings.map(t => html`<option key=${t.id} value=${t.id}>${t.title}</option>`)}
              </select>
              <select className="input" value=${newLink.companyId} onChange=${e => setNewLink({...newLink, companyId: e.target.value})}>
                <option value="">-- Seleccionar Empresa --</option>
                ${companies.map(c => html`<option key=${c.id} value=${c.id}>${c.name}</option>`)}
              </select>
            </div>
            <button onClick=${addLink} className="btn btn-primary" style=${{width: '100%'}}><${QrCode} size=${18} /> Vincular y Crear Acceso</button>
            
            <div className="grid grid-md-3" style=${{gap: '20px', marginTop: '32px'}}>
              ${links.map(l => {
                const t = trainings.find(x => x.id === l.trainingId);
                const c = companies.find(x => x.id === l.companyId);
                const baseUrl = window.location.href.split('#')[0];
                const url = `${baseUrl}#/?lt=${l.id}`;
                
                return html`
                  <div key=${l.id} className="card" style=${{textAlign: 'center', position: 'relative', border: '1px solid var(--primary)'}}>
                    <button onClick=${() => setLinks(links.filter(x => x.id !== l.id))} className="btn btn-danger" style=${{position: 'absolute', top: '10px', right: '10px', padding: '4px', zIndex: 10}}><${Trash2} size=${14}/></button>
                    <div style=${{fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', paddingRight: '20px'}}>${t?.title}</div>
                    <div style=${{fontSize: '11px', color: 'var(--primary)', marginBottom: '12px'}}>${c?.name}</div>
                    <div style=${{background: 'white', padding: '12px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'}}>
                      <${QRCodeSVG} 
                        value=${url} 
                        size=${160} 
                        level="H" 
                        includeMargin=${true}
                        onClick=${() => window.open(url, '_blank')}
                      />
                    </div>
                    <p style=${{fontSize: '10px', color: 'var(--text-muted)', marginTop: '12px', cursor: 'pointer', textDecoration: 'underline'}} onClick=${() => { navigator.clipboard.writeText(url); alert('URL copiada al portapapeles'); }}>Copiar enlace directo</p>
                  </div>
                `;
              })}
            </div>
          </div>
        `}

        ${activeTab === 'records' && html`
          <div className="card">
            <div className="flex justify-between items-center" style=${{marginBottom: '20px'}}>
              <h3>Registros de Asistencia</h3>
              <button onClick=${downloadRecordsPDF} className="btn btn-ghost"><${Download} size=${18}/> Exportar PDF</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>DNI</th>
                    <th>Firma</th>
                    <th>Fecha</th>
                    <th style=${{textAlign: 'right'}}>Gestión</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredRecords.length === 0 ? html`<tr><td colSpan="5" style=${{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>No se han registrado asistencias aún.</td></tr>` : 
                  filteredRecords.map(r => html`
                    <tr key=${r.id}>
                      <td style=${{fontWeight: 600}}>${r.employeeName}</td>
                      <td>${r.employeeDni}</td>
                      <td>${r.signature ? html`<img src=${r.signature} style=${{height: '28px', background: 'white', borderRadius: '4px', border: '1px solid #ddd'}} />` : 'N/A'}</td>
                      <td>${new Date(r.date).toLocaleDateString()}</td>
                      <td style=${{textAlign: 'right'}}><button onClick=${() => { if(confirm('¿Borrar registro?')) setRecords(records.filter(x => x.id !== r.id)) }} className="btn btn-danger" style=${{padding: '6px'}}><${Trash2} size=${14}/></button></td>
                    </tr>
                  `)}
                </tbody>
              </table>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
};

export default AdminDashboard;

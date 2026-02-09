const KEYS = {
  PROFILE: 'trainer_pro_profile',
  COMPANIES: 'trainer_pro_companies',
  TRAININGS: 'trainer_pro_trainings',
  LINKS: 'trainer_pro_links',
  RECORDS: 'trainer_pro_records',
  REMEMBER_ME: 'trainer_pro_remember_me',
  ADMIN_SESSION: 'trainer_pro_admin_session'
};

export const storage = {
  generateId: () => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  },

  getProfile: () => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : { name: '', position: '', signature: '' };
  },
  setProfile: (profile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getCompanies: () => {
    const data = localStorage.getItem(KEYS.COMPANIES);
    return data ? JSON.parse(data) : [];
  },
  setCompanies: (companies) => {
    localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies));
  },

  getTrainings: () => {
    const data = localStorage.getItem(KEYS.TRAININGS);
    return data ? JSON.parse(data) : [];
  },
  setTrainings: (trainings) => {
    localStorage.setItem(KEYS.TRAININGS, JSON.stringify(trainings));
  },

  getLinkedTrainings: () => {
    const data = localStorage.getItem(KEYS.LINKS);
    return data ? JSON.parse(data) : [];
  },
  setLinkedTrainings: (links) => {
    localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
  },

  getRecords: () => {
    const data = localStorage.getItem(KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },
  setRecords: (records) => {
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  },

  setRememberMe: (val) => {
    localStorage.setItem(KEYS.REMEMBER_ME, val ? 'true' : 'false');
  },
  getRememberMe: () => {
    return localStorage.getItem(KEYS.REMEMBER_ME) === 'true';
  },
  
  setAdminSession: (isActive) => {
    if (isActive) localStorage.setItem(KEYS.ADMIN_SESSION, 'true');
    else localStorage.removeItem(KEYS.ADMIN_SESSION);
  },
  getAdminSession: () => {
    return localStorage.getItem(KEYS.ADMIN_SESSION) === 'true';
  }
};
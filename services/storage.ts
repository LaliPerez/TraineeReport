import { 
  InstructorProfile, 
  Company, 
  Training, 
  LinkedTraining, 
  AttendanceRecord 
} from '../types.ts';

const KEYS = {
  PROFILE: 'trainer_pro_profile',
  COMPANIES: 'trainer_pro_companies',
  TRAININGS: 'trainer_pro_trainings',
  LINKS: 'trainer_pro_links',
  RECORDS: 'trainer_pro_records',
  REMEMBER_ME: 'trainer_pro_remember_me'
};

export const storage = {
  generateId: (): string => {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
  },

  getProfile: (): InstructorProfile | null => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },
  setProfile: (profile: InstructorProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getCompanies: (): Company[] => {
    const data = localStorage.getItem(KEYS.COMPANIES);
    return data ? JSON.parse(data) : [];
  },
  setCompanies: (companies: Company[]) => {
    localStorage.setItem(KEYS.COMPANIES, JSON.stringify(companies));
  },

  getTrainings: (): Training[] => {
    const data = localStorage.getItem(KEYS.TRAININGS);
    return data ? JSON.parse(data) : [];
  },
  setTrainings: (trainings: Training[]) => {
    localStorage.setItem(KEYS.TRAININGS, JSON.stringify(trainings));
  },

  getLinkedTrainings: (): LinkedTraining[] => {
    const data = localStorage.getItem(KEYS.LINKS);
    return data ? JSON.parse(data) : [];
  },
  setLinkedTrainings: (links: LinkedTraining[]) => {
    localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
  },

  getRecords: (): AttendanceRecord[] => {
    const data = localStorage.getItem(KEYS.RECORDS);
    return data ? JSON.parse(data) : [];
  },
  setRecords: (records: AttendanceRecord[]) => {
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  },

  setRememberMe: (val: boolean) => {
    localStorage.setItem(KEYS.REMEMBER_ME, val ? 'true' : 'false');
  },
  getRememberMe: (): boolean => {
    return localStorage.getItem(KEYS.REMEMBER_ME) === 'true';
  }
};

export interface InstructorProfile {
  name: string;
  position: string;
  signature: string; // base64
}

export interface Company {
  id: string;
  name: string;
  cuit: string;
}

export interface TrainingLink {
  id: string;
  title: string;
  url: string;
  viewed?: boolean;
}

export interface Training {
  id: string;
  title: string;
  links: TrainingLink[];
}

export interface LinkedTraining {
  id: string;
  trainingId: string;
  companyId: string;
}

export interface AttendanceRecord {
  id: string;
  linkedTrainingId: string;
  employeeName: string;
  employeeDni: string;
  signature: string; // base64
  date: string;
}

export type UserRole = 'admin' | 'employee' | 'guest';

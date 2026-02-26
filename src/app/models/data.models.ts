export type ServiceType =
  | 'security_management'
  | 'crowd_management'
  | 'traffic_management'
  | 'parking_access'
  | 'transportation'
  | 'government_liaison'
  | 'vip_transportation'
  | 'close_protection'
  | 'international_security';

export const SERVICE_LABELS_AR: Record<ServiceType, string> = {
  security_management: 'إدارة الأمن',
  crowd_management: 'إدارة الحشود',
  traffic_management: 'إدارة المرور',
  parking_access: 'إدارة المواقف والدخول',
  transportation: 'إدارة النقل',
  government_liaison: 'التنسيق الحكومي',
  vip_transportation: 'نقل الشخصيات',
  close_protection: 'الحماية الشخصية',
  international_security: 'الأمن الدولي',
};

export const CRITERIA_LABELS: Record<string, { en: string; ar: string }> = {
  creativity: { en: 'Creativity', ar: 'الابداع والابتكار في العمل' },
  workQuality: { en: 'Work Quality', ar: 'إنجاز العمل بالمستوى المطلوب' },
  teamwork: { en: 'Teamwork', ar: 'التعاون والعمل بروح الفريق' },
  efficiency: { en: 'Efficiency', ar: 'الكفاءة' },
  accuracy: { en: 'Accuracy', ar: 'جودة ودقة العمل' },
  punctuality: { en: 'Punctuality', ar: 'الالتزام بمواعيد العمل' },
  organization: { en: 'Organization', ar: 'الدقة والترتيب والتنظيم' },
  planning: { en: 'Planning', ar: 'القدرة على التخطيط' },
  independence: { en: 'Independence', ar: 'القدرة على العمل بدون إشراف' },
  responsibility: { en: 'Responsibility', ar: 'القدرة على تحمل المسؤولية' },
  leadership: { en: 'Leadership', ar: 'القيادة والمهارة في إدارة فرق العمل' },
  appearance: { en: 'Appearance', ar: 'المظهر واللباس المناسب' },
  assetCare: { en: 'Asset Care', ar: 'المحافظة على ممتلكات وعهد الشركة' },
};

export interface Employee {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  specialization: ServiceType;
  avatar: string;
  phone: string;
  joinDate: string;
  avgRating: number;
  totalEvents: number;
}

export interface EventService {
  id: string;
  type: ServiceType;
  projectManagerId: string;
  projectManagerName: string;
  employeeIds: string[];
  status: 'active' | 'completed' | 'upcoming';
}

export interface EventData {
  id: string;
  name: string;
  nameAr: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  services: EventService[];
  client: string;
  managerId?: string;
  managerName?: string;
}

export interface EvaluationCriteria {
  creativity: number;
  workQuality: number;
  teamwork: number;
  efficiency: number;
  accuracy: number;
  punctuality: number;
  organization: number;
  planning: number;
  independence: number;
  responsibility: number;
  leadership: number;
  appearance: number;
  assetCare: number;
}

export interface Evaluation {
  id: string;
  eventId: string;
  eventName: string;
  serviceType: ServiceType;
  employeeId: string;
  employeeName: string;
  evaluatorId: string;
  evaluatorName: string;
  date: string;
  criteria: EvaluationCriteria;
  overallRating: number;
  notes: string;
}

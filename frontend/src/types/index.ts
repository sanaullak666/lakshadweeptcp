export type RelationshipType = 'S/o' | 'D/o' | 'W/o';

export const ISLANDS_LIST = [
  'Agatti',
  'Amini',
  'Andrott',
  'Bangaram',
  'Bitra',
  'Chetlat',
  'Kadmat',
  'Kalpeni',
  'Kavaratti',
  'Kiltan',
  'Minicoy'
] as const;

export type IslandType = typeof ISLANDS_LIST[number];

export interface ApplicantFormData {
  fullName: string;
  relationship: RelationshipType;
  parentSpouseName: string;
  houseName: string;
  island: IslandType | '';
  pinCode: string;
  email: string;
  phone: string;
  place: string;
  date: string;
  signatureType: 'drawn' | 'uploaded';
  signatureData?: string; // base64
  signatureFile?: File | null;
  idempotencyKey?: string;
}

export interface GeneratedLetterInfo {
  letterNumber: number;
  title: string;
  downloadUrl: string;
  viewUrl: string;
  templateVersion?: string;
  createdAt?: string;
  finalHtml?: string;
}

export interface SubmissionResult {
  success: boolean;
  message: string;
  submissionId: string;
  accessToken: string;
  submissionDate: string;
  applicant: {
    fullName: string;
    relationship: string;
    parentSpouseName: string;
    houseName: string;
    island: string;
    pinCode: string;
    email: string;
    phone: string;
    place: string;
  };
  letters: GeneratedLetterInfo[];
  zipDownloadUrl: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface DashboardStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  statusCounts: {
    Submitted: number;
    'Under Review': number;
    Reviewed: number;
    Forwarded: number;
    Rejected: number;
  };
  islandCounts: Array<{ island: string; count: number }>;
  timeline: Array<{ date: string; count: number }>;
}

export interface SubmissionListItem {
  id: number;
  submission_id: string;
  full_name: string;
  relationship: string;
  parent_spouse_name: string;
  house_name: string;
  island: string;
  pin_code: string;
  email: string;
  phone: string;
  place: string;
  submission_date: string;
  status: string;
  created_at: string;
  access_token?: string;
}

export interface StatusHistoryItem {
  id: number;
  submission_id: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  remarks: string | null;
  created_at: string;
}

export interface AdminNoteItem {
  id: number;
  submission_id: string;
  admin_name: string;
  note: string;
  created_at: string;
}

export interface SubmissionDetailData {
  submission: {
    id: number;
    submissionId: string;
    fullName: string;
    relationship: string;
    parentSpouseName: string;
    houseName: string;
    island: string;
    pinCode: string;
    email: string;
    phone: string;
    place: string;
    submissionDate: string;
    status: string;
    submittedAt: string;
    accessToken?: string;
    signatureUrl: string;
    signatureType: 'drawn' | 'uploaded' | null;
  };
  letters: GeneratedLetterInfo[];
  zipDownloadUrl: string;
  statusHistory: StatusHistoryItem[];
  notes: AdminNoteItem[];
}

export interface LetterTemplateItem {
  id: number;
  letter_number: number;
  title: string;
  version: string;
  subject: string;
  reference: string;
  copy_to: string;
  content_html?: string;
  is_active: number | boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuditLogItem {
  id: number;
  admin_username: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

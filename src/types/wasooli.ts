export type ConnectionStatus = 'active' | 'expired' | 'suspended' | 'disconnected';
export type ConnectionType = 'PPPoE' | 'Static' | 'Hotspot' | 'CableTV';
export type PaymentMethod = 'Cash' | 'JazzCash' | 'EasyPaisa' | 'BankTransfer' | 'Nayapay';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved';

export interface PackagePlan {
  id: string;
  name: string;
  speedMbps: number;
  price: number;
  validityDays: number;
  category: 'Broadband' | 'Gaming' | 'Corporate' | 'CableTV';
  description?: string;
}

export interface AreaZone {
  id: string;
  name: string;
  city: string;
  assignedRiderId?: string;
  subscribersCount?: number;
}

export interface RecoveryRider {
  id: string;
  name: string;
  phone: string;
  areaIds: string[];
  collectedToday: number;
  cashHandedOver: number;
  targetMonthly: number;
  active: boolean;
}

export interface Subscriber {
  id: string;
  username: string; // PPPoE username / Client ID
  fullName: string;
  phone: string; // WhatsApp number
  cnic?: string;
  address: string;
  areaId: string;
  packageId: string;
  monthlyFee: number;
  discount: number;
  balanceDue: number; // Positive = owes money, 0 = clear, Negative = advance
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  expiryDate: string; // YYYY-MM-DD
  billingCycleDay: number; // e.g. 1st or 10th
  status: ConnectionStatus;
  connectionType: ConnectionType;
  ipAddress?: string;
  macAddress?: string;
  onuSerial?: string;
  opticalSignalDbm?: number; // e.g. -21.4 dBm
  splitterPort?: string;
  assignedRiderId?: string;
  notes?: string;
  createdAt: string;
  isMikroTikActive?: boolean;
}

export interface Transaction {
  id: string;
  receiptNo: string;
  subscriberId: string;
  subscriberName: string;
  subscriberUsername: string;
  amount: number;
  discount: number;
  previousBalance: number;
  remainingBalance: number;
  paymentMethod: PaymentMethod;
  collectedByRiderId?: string;
  collectedByName: string;
  timestamp: string; // ISO string
  notes?: string;
  smsSent?: boolean;
  whatsappSent?: boolean;
}

export interface Complaint {
  id: string;
  ticketNo: string;
  subscriberId: string;
  subscriberName: string;
  subscriberPhone: string;
  areaName: string;
  category: 'Fiber Cut / No Signal' | 'Slow Speed / High Ping' | 'ONU Red Light' | 'Router Config / WiFi' | 'Billing Dispute';
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
  assignedTechnician?: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'Upstream Bandwidth' | 'Staff Salaries' | 'Fuel / Generator' | 'Fiber Tools & Hardware' | 'Office Rent' | 'Other';
  amount: number;
  date: string;
  paidTo: string;
  paymentMode: PaymentMethod;
  notes?: string;
}

export interface CompanySettings {
  ispName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  ntn: string;
  jazzCashNumber: string;
  easyPaisaNumber: string;
  bankAccountTitle: string;
  bankName: string;
  bankIban: string;
  currency: string;
  thermalReceiptHeader: string;
  thermalReceiptFooter: string;
  autoLockMinutes: number; // 0 = never, 1, 5, 15, 30
  appLockPin: string;
  appLockEnabled: boolean;
  securityQuestion: string;
  securityAnswer: string;
  language: 'en' | 'ur';
}

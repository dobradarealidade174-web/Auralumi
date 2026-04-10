export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
  description?: string;
}

export interface Appointment {
  id: string;
  professionalId: string; // The business owner ID
  staffId: string; // The person performing the service (can be owner or employee)
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  finalAmount?: number;
  commissionAmount?: number;
  createdAt: string;
}

export interface Staff {
  id: string;
  professionalId: string; // Master user ID
  name: string;
  email: string;
  phone: string;
  commissionPercentage: number;
  active: boolean;
  createdAt: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  slug: string; // for the booking link
  services: Service[];
  availability: {
    [key: string]: { // day of week (0-6)
      start: string; // HH:mm
      end: string; // HH:mm
      active: boolean;
    };
  };
  gallery?: string[]; // URLs
  pixKey?: string;
  depositPercentage?: number;
  plan: 'free' | 'pro';
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  lastVisit?: string;
  totalSpent: number;
  appointmentsCount: number;
  loyaltyPoints: number;
  notes?: string;
  photos?: string[];
}

export interface Product {
  id: string;
  professionalId: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  category: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  professionalId: string;
  type: 'income' | 'expense';
  category: 'service' | 'product' | 'rent' | 'supplies' | 'other';
  amount: number;
  description: string;
  date: string; // ISO string
  relatedId?: string; // Appointment ID or Product ID
  createdAt: string;
}

export interface Automation {
  id: string;
  professionalId: string;
  name: string;
  triggerType: 'days_since_last_visit' | 'after_booking' | 'before_booking';
  triggerValue: number; // days or hours
  messageTemplate: string;
  active: boolean;
  createdAt: string;
}

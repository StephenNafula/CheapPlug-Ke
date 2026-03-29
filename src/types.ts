export interface Provider {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  whatsapp: string;
  categoryId: string;
  county: string;
  town: string;
  description: string;
  priceMin: number;
  priceMax: number;
  priceUnit: string;
  photos: string[];
  verified: boolean;
  certified: boolean;
  ratingAvg: number;
  reviewCount: number;
  isActive: boolean;
  plan: 'free' | 'pro' | 'business';
  createdAt: any;
  lat?: number;
  lng?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export interface Review {
  id: string;
  providerId: string;
  reviewerPhone: string;
  rating: number;
  comment: string;
  verifiedContact: boolean;
  createdAt: any;
}

export interface PriceReport {
  id: string;
  categoryId: string;
  county: string;
  town: string;
  reportedPrice: number;
  reportedByPhone: string;
  createdAt: any;
}

export interface Lead {
  id: string;
  providerId: string;
  contactMethod: 'whatsapp' | 'call' | 'form';
  userPhone?: string;
  createdAt: any;
}

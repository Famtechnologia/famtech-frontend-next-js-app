// ================================
// TYPE DEFINITIONS
// ================================

// types/index.ts
export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'farmer' | 'superadmin' | 'marketing' | 'finance';
  subRole?: 'admin' | 'staff' | 'finance';
  farmId?: string;
  createdAt: Date;
  isActive: boolean;
  profileImage?: string;
}

export interface Farm {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    country: string;
    state: string;
  };
  size: number;
  cropTypes: string[];
  ownerId: string;
  members: string[];
  createdAt: Date;
  isActive: boolean;
  subscriptionPlan: 'free' | 'basic' | 'premium';
}

export interface WeatherData {
  id: string;
  farmId: string;
  temperature: {
    current: number;
    high: number;
    low: number;
  };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  conditions: string;
  forecast: WeatherForecast[];
  timestamp: Date;
}

export interface WeatherForecast {
  date: string;
  temperature: { high: number; low: number };
  conditions: string;
  rainfall: number;
  humidity: number;
}

export interface CropHealth {
  id: string;
  farmId: string;
  cropType: string;
  healthScore: number;
  diseases: Disease[];
  recommendations: string[];
  lastUpdated: Date;
  imageUrl?: string;
}

export interface Disease {
  name: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  treatment: string;
  confidence: number;
}

export interface Report {
  id: string;
  farmId: string;
  type: 'monthly' | 'seasonal' | 'annual';
  period: string;
  data: {
    // i added this as strings for now
    weather: string;   // WeatherSummary
    crops: string;    // CropHealthSummary
    finances: string;  // FinancialSummary
    recommendations: string[];
  };
  generatedAt: Date;
  pdfUrl?: string;
}

export interface DashboardStats {
  totalFarms: number;
  activeFarmers: number;
  totalRevenue: number;
  healthyPlants: number;
  weatherAlerts: number;
  monthlyGrowth: number;
}

export interface ProfileResponse {
   data:object | null;
  farmProfile: object | null;
  id: string;
  uid: string;
  farmName: string;
  farmType: string;
  farmSize: number;
  farmSizeUnit: string;
  establishedYear: number;
  location: {
    country: string;
    state: string;
    city: string;
    address: string;
    coordinates: [number, number]; // [longitude, latitude] or adjust as needed
  };
  currency: string;
  timezone: string;
  primaryCrops: string[];
  farmingMethods: string[];
  seasonalPattern: string;
  language: string;
  owner: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date if you parse it
}
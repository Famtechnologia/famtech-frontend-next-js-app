// src/types/feature.ts
export interface FeatureRequest {
  id: string;
  farmId: string;
  title: string;
  description: string;
  category: 'Integration' | 'Reporting' | 'Automation' | 'Other';
  status: 'Pending' | 'In Progress' | 'Complete' | 'Rejected';
  dateRequested: string;
}
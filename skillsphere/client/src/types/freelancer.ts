export interface Skill {
  id?: string;
  name: string;
  proficiency: number;
  endorsements?: number;
  yearsExperience?: number;
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  duration: string;
  description?: string;
  isCurrently?: boolean;
}

export interface PortfolioItem {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  technologies?: string[];
}

export interface Certification {
  id?: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
  credentialId?: string;
  verified?: boolean;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface PricingConfig {
  hourlyRate: number;
  minimumHours?: number;
  fixedProjectRate?: boolean;
  projectRateMin?: number;
  projectRateMax?: number;
  milestonePayment?: boolean;
}

export interface FreelancerProfileData {
  id?: string;
  name: string;
  title: string;
  bio: string;
  location: string;
  hourlyRate: string;
  skills: Skill[];
  experience: Experience[];
  portfolio?: PortfolioItem[];
  certifications?: Certification[];
  availability?: AvailabilitySlot[];
  pricing?: PricingConfig;
  resume?: File;
  resumeUrl?: string;
  profileComplete?: boolean;
}

export interface ProfileCompletionStep {
  name: string;
  completed: boolean;
}

export interface ProgressData {
  profileCompletion: {
    current: number;
    target: number;
    steps: ProfileCompletionStep[];
  };
  earningsProgress: {
    current: number;
    goal: number;
    monthly: Array<{ month: string; amount: number; projected: number }>;
  };
  jobs: {
    completed: number;
    inProgress: number;
    total: number;
    successRate: number;
  };
  skills: {
    total: number;
    avgProficiency: number;
    topSkills: Array<{ name: string; level: number; trend: 'up' | 'down' | 'stable' }>;
  };
}
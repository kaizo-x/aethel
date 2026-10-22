export type EventType = 'wedding' | 'birthday' | 'community' | 'corporate' | 'other';

export interface BudgetSubItem {
  id: string;
  name: string;
  estimated: number;
  actual: number;
  status: 'planned' | 'deposit_paid' | 'paid_in_full';
  notes?: string;
}

export interface BudgetCategory {
  id: string;
  name: string; // e.g., "Venue & Catering", "Decor & Ambience", "Media & Sound", "Logistics/Permits", "Contingency"
  percentage: number; // 0 - 100
  allocated: number;
  locked?: boolean;
  color: string;
  iconName: string;
  items: BudgetSubItem[];
}

export interface TimelinePhase {
  id: string; // "t-6m", "t-1m", "t-1w", "day-of"
  label: string;
  description: string;
  order: number;
}

export interface TimelineTask {
  id: string;
  title: string;
  description?: string;
  phaseId: string;
  category: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeSlot?: string; // used for Day-Of schedules (e.g. "08:30 AM")
  dueDate?: string;
  assignedTo?: string;
}

export type VendorStatus = 'to_source' | 'contacted' | 'quoted' | 'booked' | 'declined';

export interface VendorInquiryTemplate {
  subject: string;
  body: string;
}

export interface Vendor {
  id: string;
  name: string;
  role: string; // e.g. "Artisanal Catering & Beverage", "Florals & Botanical Installation"
  category: string;
  contactName: string;
  email: string;
  phone: string;
  status: VendorStatus;
  estimatedCost: number;
  actualCost?: number;
  rating?: number;
  notes?: string;
  inquiryTemplate: VendorInquiryTemplate;
}

export interface MoodboardItem {
  id: string;
  title: string;
  imageUrl: string;
  caption: string;
  tag: string;
  aspect?: 'tall' | 'wide' | 'square';
}

export interface EventPlan {
  id: string;
  title: string;
  eventType: EventType;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  themeVibe: string;
  constraints: string[];
  budgetNotes?: string;
  categories: BudgetCategory[];
  phases: TimelinePhase[];
  tasks: TimelineTask[];
  vendors: Vendor[];
  moodboard: MoodboardItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AiSuggestion {
  title: string;
  description: string;
  category: 'budget' | 'timeline' | 'vendor' | 'styling' | 'contingency';
  actionLabel?: string;
  actionType?: 'apply_budget_preset' | 'add_task' | 'add_vendor' | 'rebalance_contingency';
  payload?: any;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestions?: AiSuggestion[];
}

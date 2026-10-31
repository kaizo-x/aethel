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

export interface RiskRadarItem {
  id?: string;
  risk: string;
  severity: 'High' | 'Medium' | 'Low';
  mitigation: string;
  resolved?: boolean;
}

export interface PersonalizedIdeas {
  theme: string;
  colorPalette: string[];
  decorHighlights: string[];
}

export interface GeneratedEventResponse {
  eventMeta: {
    title: string;
    eventType: 'Wedding' | 'Birthday' | 'Community' | string;
    totalBudget: number;
  };
  riskRadar: RiskRadarItem[];
  personalizedIdeas: PersonalizedIdeas;
  budgetBreakdown: {
    category: string;
    allocatedAmount: number;
    percentage: number;
  }[];
  timeline: {
    timeframe: string;
    tasks: string[];
  }[];
  rebalancedCategories?: BudgetCategory[];
  chatReply?: string;
}

// -------------------------------------------------------------
// PERSONA 1: WEDDINGS (High-Complexity / Elegance Focus)
// -------------------------------------------------------------
export interface SeatingTable {
  id: string;
  name: string; // e.g. "Table 1 — Olive Grove", "Head Table — Terra Cotta"
  shape: 'round' | 'rectangular' | 'head';
  capacity: number;
  assignedGuests: string[]; // guest names
  notes?: string;
}

export interface BridalPartyMilestone {
  id: string;
  role: string; // e.g. "Maid of Honor", "Best Man", "Bridesmaids", "Officiant", "All"
  milestone: string; // e.g. "Hair & Makeup Call Sheet", "Bouquet Toss"
  time: string; // e.g. "10:30 AM"
  completed: boolean;
  location?: string;
}

export interface RsvpGuest {
  id: string;
  name: string;
  status: 'confirmed' | 'pending' | 'declined';
  dietary: 'None' | 'Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Dairy-Free' | 'Nut Allergy' | 'Halal' | 'Kosher';
  tableId?: string;
  plusOne?: boolean;
}

export interface WeddingDetails {
  tables: SeatingTable[];
  bridalParty: BridalPartyMilestone[];
  rsvps: RsvpGuest[];
}

// -------------------------------------------------------------
// PERSONA 2: BIRTHDAYS & SOIRÉES (Vibe / Speed Focus)
// -------------------------------------------------------------
export interface PartyItineraryItem {
  id: string;
  time: string; // e.g. "06:00 PM"
  title: string; // e.g. "Doors Open & Natural Champagne Welcome"
  vibeTag: 'Warm Mellow' | 'Golden Peak' | 'High Voltage' | 'Intimate Wind-Down';
  description?: string;
  completed?: boolean;
}

export interface MusicVibeTrack {
  id: string;
  title: string;
  artist: string;
  genre: string; // e.g. "Bossa Nova Vinyl", "Deep House", "Nu-Disco", "Indie French Pop"
  bpm?: number;
  duration?: string;
  energy: 'low' | 'medium' | 'high';
  upvotes: number;
  spotifyUrl?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  category: string; // e.g. "Artisanal Barware", "Ceramics", "Experience", "Vinyl Records"
  priceEstimate: number;
  link?: string;
  claimed: boolean;
  claimedBy?: string;
}

export interface BirthdayDetails {
  itinerary: PartyItineraryItem[];
  tracks: MusicVibeTrack[];
  wishlist: WishlistItem[];
}

// -------------------------------------------------------------
// PERSONA 3: COMMUNITY DRIVES & CIVIC EVENTS (Logistics / Ops Focus)
// -------------------------------------------------------------
export interface PermitItem {
  id: string;
  permitName: string;
  authority: string; // e.g. "City Parks & Recreation", "Fire Marshal", "Police Dept"
  status: 'approved' | 'pending' | 'in_review' | 'exempt';
  filingDeadline?: string;
  permitNumber?: string;
  notes?: string;
}

export interface VolunteerShift {
  id: string;
  shiftName: string;
  timeWindow: string; // e.g. "08:00 AM - 11:00 AM"
  capacity: number;
  filled: number;
  leadName: string;
  tasksSummary: string;
}

export interface EmergencyRiskMatrixItem {
  id: string;
  hazard: string;
  probability: 'Low' | 'Moderate' | 'High' | 'Severe';
  impact: 'Low' | 'Moderate' | 'High' | 'Severe';
  mitigationProtocol: string;
  emergencyActionStep: string;
}

export interface CommunityDetails {
  permits: PermitItem[];
  shifts: VolunteerShift[];
  emergencyMatrix: EmergencyRiskMatrixItem[];
}

// -------------------------------------------------------------
// MASTER EVENT PLAN
// -------------------------------------------------------------
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
  riskRadar?: RiskRadarItem[];
  personalizedIdeas?: PersonalizedIdeas;
  // Domain Persona Specific Modules
  weddingDetails?: WeddingDetails;
  birthdayDetails?: BirthdayDetails;
  communityDetails?: CommunityDetails;
  createdAt: string;
  updatedAt: string;
}

export interface AiSuggestion {
  title: string;
  description: string;
  category: 'budget' | 'timeline' | 'vendor' | 'styling' | 'contingency';
  actionLabel?: string;
  actionType?: 'apply_budget_preset' | 'add_task' | 'add_vendor' | 'rebalance_contingency' | 'apply_rebalance';
  payload?: {
    categories?: BudgetCategory[];
    [key: string]: unknown;
  };
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestions?: AiSuggestion[];
}

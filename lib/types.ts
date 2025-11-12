/**
 * Type definitions for UI components and configurations
 */

// UI Component Types
export type ComponentType = 
  | 'grid' 
  | 'card' 
  | 'dashboard' 
  | 'advanced-grid' 
  | 'data-table' 
  | 'analytics'
  | 'markets';

// Configuration interfaces
export interface GridConfig {
  columns?: number;
  gap?: number;
  itemCount?: number;
}

export interface CardConfig {
  title?: string;
  content?: string;
  actions?: Array<{
    label: string;
    variant: 'primary' | 'secondary';
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DashboardConfig {
  // Dashboard-specific config (empty for now, can be extended)
}

export type UIConfig = GridConfig | CardConfig | DashboardConfig;

// UI Data structures
export interface GridItem {
  id: number;
  title: string;
  description: string;
  color: string;
}

export interface GridLayout {
  columns: number;
  gap: number;
  items: GridItem[];
}

export interface GridUI {
  type: 'grid';
  layout: GridLayout;
}

export interface CardAction {
  label: string;
  variant: 'primary' | 'secondary';
}

export interface CardUI {
  type: 'card';
  title: string;
  content: string;
  actions: CardAction[];
}

export interface Widget {
  type: 'stat' | 'chart';
  label: string;
  value?: string;
  trend?: string;
  data?: number[];
}

export interface DashboardUI {
  type: 'dashboard';
  widgets: Widget[];
}

export interface AdvancedGridItem extends GridItem {
  image?: string;
  features: string[];
  rating: string;
}

export interface AdvancedGridUI {
  type: 'advanced-grid';
  layout: {
    columns: number;
    rows: string;
    gap: number;
    items: AdvancedGridItem[];
  };
  animations: boolean;
  interactions: string[];
}

export interface DataColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
}

export interface DataTableUI {
  type: 'data-table';
  columns: DataColumn[];
  data: Record<string, string | number>[];
  features: string[];
}

export interface AnalyticsWidget {
  type: 'metric';
  label: string;
  value: string;
  change: string;
}

export interface AnalyticsChart {
  type: 'line' | 'bar' | 'pie';
  label: string;
  data: unknown[];
}

export interface AnalyticsSection {
  title: string;
  widgets?: AnalyticsWidget[];
  charts?: AnalyticsChart[];
}

export interface AnalyticsDashboardUI {
  type: 'analytics-dashboard';
  sections: AnalyticsSection[];
}

// Market Data Types
export interface MarketData {
  id: string;
  source: 'polymarket';
  question: string;
  title?: string;
  description?: string;
  category?: string;
  yesPrice: number;
  noPrice: number;
  yesOutcome?: string;
  noOutcome?: string;
  volume: number;
  volume24h?: number;
  liquidity: number;
  oneDayPriceChange?: number;
  oneHourPriceChange?: number;
  oneWeekPriceChange?: number;
  spread?: number;
  openTime?: string;
  closeTime?: string;
  createdAt?: string;
  active?: boolean;
  acceptingOrders?: boolean;
  polymarket?: {
    conditionId?: string;
    tokenIds?: string[];
    slug?: string;
    eventId?: string;
    eventSlug?: string;
    eventTitle?: string;
  };
  image?: string;
  icon?: string;
}

export interface MarketsUI {
  type: 'markets';
  markets: MarketData[];
  meta: {
    hoursBack: number;
    cutoffTime: string;
    polymarketCount: number;
    totalCount: number;
    x402Protected: boolean;
  };
}

export type UIData = 
  | GridUI 
  | CardUI 
  | DashboardUI 
  | AdvancedGridUI 
  | DataTableUI 
  | AnalyticsDashboardUI
  | MarketsUI;

// API Response types
export interface UIResponse {
  success: boolean;
  ui: UIData;
  tier?: 'basic' | 'premium' | 'custom';
  message: string;
}

// x402 Payment Protocol Types
export interface PaymentRequiredResponse {
  paymentRequired: true;
  price: number;
  network: string;
  asset: string;
  payTo: string;
  message?: string;
}

export interface PaymentProof {
  signature: string;
  publicKey: string;
  timestamp: number;
}


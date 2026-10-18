// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Auth Types
// ============================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  businessType: BusinessType;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ============================================
// Domain Types (re-export from Prisma for convenience)
// ============================================

export type BusinessType =
  | 'RETAIL'
  | 'WHOLESALE'
  | 'CONTRACTOR'
  | 'MANUFACTURER'
  | 'SERVICE'
  | 'MIXED';

export type Plan = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export type UnitType = 'COUNT' | 'LENGTH' | 'WEIGHT' | 'VOLUME' | 'AREA' | 'TIME';

export type MovementType =
  | 'IN'
  | 'OUT'
  | 'TRANSFER'
  | 'ADJUSTMENT'
  | 'RETURN'
  | 'DAMAGE';

export type CustomerType = 'INDIVIDUAL' | 'CORPORATE' | 'CONTRACTOR' | 'DEALER';

export type PurchaseStatus =
  | 'DRAFT'
  | 'SENT'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'RECEIVED'
  | 'PARTIALLY_RECEIVED'
  | 'CANCELLED';

export type SalesStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'INVOICED'
  | 'CANCELLED';

export type ProjectStatus =
  | 'PLANNING'
  | 'QUOTED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'INVOICED'
  | 'CANCELLED';

export type InvoiceType = 'SALES' | 'PURCHASE' | 'RETURN' | 'PROFORMA';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'SENT'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'OVERDUE'
  | 'CANCELLED';

// ============================================
// Entity Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  taxNumber?: string;
  taxOffice?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  businessType: BusinessType;
  plan: Plan;
  currency: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  isDefault: boolean;
  isActive: boolean;
  organizationId: string;
  shelves?: Shelf[];
  createdAt: string;
  updatedAt: string;
}

export interface Shelf {
  id: string;
  code: string;
  name?: string;
  warehouseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parentId?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  shortName: string;
  type: UnitType;
  organizationId: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  brandId?: string;
  unitId: string;
  purchasePrice: number;
  salePrice: number;
  vatRate: number;
  minStock: number;
  maxStock?: number;
  criticalStock: number;
  specifications?: Record<string, any>;
  imageUrl?: string;
  images?: string[];
  isActive: boolean;
  isTrackable: boolean;
  organizationId: string;
  category?: Category;
  brand?: Brand;
  unit?: Unit;
  totalStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StockLevel {
  id: string;
  productId: string;
  shelfId: string;
  quantity: number;
  reserved: number;
  shelf?: Shelf;
  product?: Product;
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  referenceType?: string;
  referenceId?: string;
  unitPrice?: number;
  totalPrice?: number;
  note?: string;
  userId: string;
  organizationId: string;
  product?: Product;
  warehouse?: Warehouse;
  user?: User;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  taxNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  type: CustomerType;
  taxNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  creditLimit?: number;
  balance: number;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  customerId: string;
  managerId?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  address?: string;
  city?: string;
  budget?: number;
  laborCost: number;
  materialCost: number;
  organizationId: string;
  customer?: Customer;
  manager?: User;
  items?: ProjectItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  productId: string;
  plannedQuantity: number;
  usedQuantity: number;
  unitPrice: number;
  isReserved: boolean;
  isDelivered: boolean;
  product?: Product;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  supplierId?: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  subtotal: number;
  vatTotal: number;
  discount: number;
  total: number;
  paidAmount: number;
  organizationId: string;
  customer?: Customer;
  items?: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
  total: number;
  product?: Product;
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  activeProjects: number;
  monthlySales: number;
  monthlyPurchases: number;
  monthlyProfit: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

import { create } from 'zustand';
import { supabase, SUPABASE_URL } from './supabase';
import { useAuthStore } from './auth-store';

// ── Types (matching DB schema, camelCased for app use) ──

export type RequestStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'purchased';
export type UrgencyLevel = 'normal' | 'urgent';
export type NeedBy = 'today' | 'tomorrow' | 'this-week' | 'next-week';
export type RequestCategory = 'materials' | 'tools' | 'equipment-rental' | 'subcontract' | 'other';
export type DeliveryMethod = 'pickup' | 'delivery';

export interface Project {
  id: string;
  name: string;
  jobNumber: string;
  address: string;
  monthlyBudget: number;
  status: 'active' | 'completed' | 'on-hold';
}

export interface CostCode {
  id: string;
  code: string;
  label: string;
  category: string;
}

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: number;
}

export interface PurchaseRequest {
  id: string;
  poNumber: string;
  projectId: string;
  requesterId: string;
  vendor: string;
  category: RequestCategory;
  costCodeId: string;
  lineItems: LineItem[];
  estimatedTotal: number;
  finalTotal?: number;
  needBy: NeedBy;
  urgency: UrgencyLevel;
  notes: string;
  attachments: string[];
  receiptAttachments: string[];
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  purchasedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface AuditEntry {
  id: string;
  requestId: string;
  action: string;
  userId: string;
  timestamp: string;
  details?: string;
}

// ── Helper: convert DB row → app type ──

function dbToRequest(row: Record<string, unknown>, lineItems: Record<string, unknown>[]): PurchaseRequest {
  return {
    id: row.id as string,
    poNumber: row.po_number as string,
    projectId: row.project_id as string,
    requesterId: row.requester_id as string,
    vendor: row.vendor as string,
    category: row.category as RequestCategory,
    costCodeId: row.cost_code_id as string,
    lineItems: lineItems.map((li) => ({
      id: li.id as string,
      name: li.name as string,
      quantity: Number(li.quantity),
      unit: li.unit as string,
      estimatedUnitCost: Number(li.estimated_unit_cost),
    })),
    estimatedTotal: Number(row.estimated_total),
    finalTotal: row.final_total != null ? Number(row.final_total) : undefined,
    needBy: row.need_by as NeedBy,
    urgency: row.urgency as UrgencyLevel,
    notes: (row.notes as string) || '',
    attachments: (row.attachments as string[]) || [],
    receiptAttachments: (row.receipt_attachments as string[]) || [],
    deliveryMethod: row.delivery_method as DeliveryMethod,
    deliveryAddress: (row.delivery_address as string) || undefined,
    status: row.status as RequestStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    approvedAt: (row.approved_at as string) || undefined,
    approvedBy: (row.approved_by as string) || undefined,
    rejectedAt: (row.rejected_at as string) || undefined,
    rejectedBy: (row.rejected_by as string) || undefined,
    rejectionReason: (row.rejection_reason as string) || undefined,
    purchasedAt: (row.purchased_at as string) || undefined,
  };
}

function dbToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string,
    jobNumber: row.job_number as string,
    address: (row.address as string) || '',
    monthlyBudget: Number(row.monthly_budget),
    status: row.status as 'active' | 'completed' | 'on-hold',
  };
}

function dbToCostCode(row: Record<string, unknown>): CostCode {
  return {
    id: row.id as string,
    code: row.code as string,
    label: row.label as string,
    category: row.category as string,
  };
}

// ── Store ──

interface DataState {
  requests: PurchaseRequest[];
  projects: Project[];
  costCodes: CostCode[];
  users: UserProfile[];

  loading: boolean;
  initialized: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  refresh: () => Promise<void>;

  // Mutations
  markPurchased: (requestId: string, finalTotal: number, receiptUri?: string, notes?: string) => Promise<void>;
  addRequest: (data: {
    projectId: string;
    vendor: string;
    category: RequestCategory;
    costCodeId: string;
    lineItems: { name: string; quantity: number; unit: string; estimatedUnitCost: number }[];
    estimatedTotal: number;
    needBy: NeedBy;
    urgency: UrgencyLevel;
    notes: string;
    deliveryMethod: DeliveryMethod;
    deliveryAddress?: string;
    attachments?: string[];
  }) => Promise<PurchaseRequest | null>;

  // Computed
  getMyRequests: () => PurchaseRequest[];
  getUserById: (id: string) => UserProfile | undefined;
  getProjectById: (id: string) => Project | undefined;
  getCostCodeById: (id: string) => CostCode | undefined;
}

export const useDataStore = create<DataState>((set, get) => ({
  requests: [],
  projects: [],
  costCodes: [],
  users: [],
  loading: true,
  initialized: false,
  error: null,

  initialize: async () => {
    if (get().initialized) return;
    set({ loading: true, error: null });
    try {
      await get().refresh();
      set({ initialized: true });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  refresh: async () => {
    const authState = useAuthStore.getState();
    const orgId = authState.organization?.id;
    if (!orgId) {
      set({ loading: false });
      return;
    }

    try {
      const [projectsRes, costCodesRes, requestsRes, lineItemsRes, profilesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('organization_id', orgId).order('name'),
        supabase.from('cost_codes').select('*').eq('organization_id', orgId).order('code'),
        supabase.from('purchase_requests').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
        supabase.from('line_items').select('*, purchase_requests!inner(organization_id)').eq('purchase_requests.organization_id', orgId),
        supabase.from('profiles').select('*').eq('organization_id', orgId),
      ]);

      // Build line items map
      const lineItemsByRequest: Record<string, Record<string, unknown>[]> = {};
      for (const li of (lineItemsRes.data || [])) {
        const reqId = li.purchase_request_id;
        if (!lineItemsByRequest[reqId]) lineItemsByRequest[reqId] = [];
        lineItemsByRequest[reqId].push(li);
      }

      for (const items of Object.values(lineItemsByRequest)) {
        items.sort((a, b) => (a.sort_order as number) - (b.sort_order as number));
      }

      const requests = (requestsRes.data || []).map((r: Record<string, unknown>) =>
        dbToRequest(r, lineItemsByRequest[r.id as string] || [])
      );

      const projects = (projectsRes.data || []).map((r: Record<string, unknown>) => dbToProject(r));
      const costCodes = (costCodesRes.data || []).map((r: Record<string, unknown>) => dbToCostCode(r));

      const users: UserProfile[] = (profilesRes.data || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: (p.full_name as string) || (p.email as string),
        email: p.email as string,
        role: '',
        avatarUrl: (p.avatar_url as string) || undefined,
      }));

      set({ requests, projects, costCodes, users, loading: false, error: null });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  // ── Mutations ──

  markPurchased: async (requestId, finalTotal, receiptUri, notes) => {
    const session = useAuthStore.getState().session;
    if (!session) return;

    const res = await fetch(`${SUPABASE_URL}/functions/v1/manage-request`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'mark_purchased', requestId, finalTotal, receiptUri, notes }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to mark purchased');
    }

    await get().refresh();
  },

  addRequest: async (data) => {
    const authState = useAuthStore.getState();
    const orgId = authState.organization?.id;
    const userId = authState.user?.id;
    if (!orgId || !userId) return null;

    const { data: inserted, error } = await supabase
      .from('purchase_requests')
      .insert({
        organization_id: orgId,
        project_id: data.projectId,
        requester_id: userId,
        vendor: data.vendor,
        category: data.category,
        cost_code_id: data.costCodeId,
        estimated_total: data.estimatedTotal,
        need_by: data.needBy,
        urgency: data.urgency,
        notes: data.notes,
        delivery_method: data.deliveryMethod,
        delivery_address: data.deliveryAddress || null,
        attachments: data.attachments || [],
        status: 'pending',
      })
      .select('*')
      .single();

    if (error || !inserted) {
      throw new Error(error?.message || 'Failed to create request');
    }

    // Insert line items
    if (data.lineItems.length > 0) {
      const lineItemRows = data.lineItems.map((li, idx) => ({
        purchase_request_id: inserted.id,
        name: li.name,
        quantity: li.quantity,
        unit: li.unit,
        estimated_unit_cost: li.estimatedUnitCost,
        sort_order: idx,
      }));

      const { error: liError } = await supabase.from('line_items').insert(lineItemRows);
      if (liError) throw new Error(liError.message);
    }

    await get().refresh();

    return get().requests.find((r) => r.id === inserted.id) || null;
  },

  // ── Computed ──

  getMyRequests: () => {
    const authState = useAuthStore.getState();
    const userId = authState.user?.id;
    if (!userId) return [];
    return get()
      .requests.filter((r) => r.requesterId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUserById: (id) => get().users.find((u) => u.id === id),
  getProjectById: (id) => get().projects.find((p) => p.id === id),
  getCostCodeById: (id) => get().costCodes.find((c) => c.id === id),
}));

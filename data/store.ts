import { create } from 'zustand';
import {
  User, Project, CostCode, PurchaseRequest, AuditEntry,
  RequestStatus, UserRole,
} from './types';
import { USERS, PROJECTS, COST_CODES, SEED_REQUESTS } from './seed';

function generateAuditEntries(requests: PurchaseRequest[]): AuditEntry[] {
  const entries: AuditEntry[] = [];
  let counter = 1;
  for (const r of requests) {
    entries.push({
      id: `a${counter++}`, requestId: r.id, action: 'submitted',
      userId: r.requesterId, timestamp: r.createdAt,
      details: `Purchase request ${r.poNumber} submitted for ${r.vendor}`,
    });
    if (r.status === 'approved' || r.status === 'purchased') {
      entries.push({
        id: `a${counter++}`, requestId: r.id, action: 'approved',
        userId: r.approvedBy!, timestamp: r.approvedAt!,
        details: `Approved ${r.poNumber}`,
      });
    }
    if (r.status === 'rejected') {
      entries.push({
        id: `a${counter++}`, requestId: r.id, action: 'rejected',
        userId: r.rejectedBy!, timestamp: r.rejectedAt!,
        details: `Rejected: ${r.rejectionReason}`,
      });
    }
    if (r.status === 'purchased') {
      entries.push({
        id: `a${counter++}`, requestId: r.id, action: 'purchased',
        userId: r.requesterId, timestamp: r.purchasedAt!,
        details: `Purchased from ${r.vendor} – $${(r.finalTotal ?? r.estimatedTotal).toLocaleString()}`,
      });
    }
  }
  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

interface AppState {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;

  users: User[];
  projects: Project[];
  costCodes: CostCode[];
  requests: PurchaseRequest[];
  auditLog: AuditEntry[];

  addRequest: (request: PurchaseRequest) => void;
  updateRequest: (id: string, updates: Partial<PurchaseRequest>) => void;
  markPurchased: (id: string, finalTotal: number, receiptUri?: string, notes?: string) => void;

  getUserById: (id: string) => User | undefined;
  getProjectById: (id: string) => Project | undefined;
  getCostCodeById: (id: string) => CostCode | undefined;
  getMyRequests: () => PurchaseRequest[];
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: USERS[0], // Mike Torres, worker (mobile default)
  users: USERS,
  projects: PROJECTS,
  costCodes: COST_CODES,
  requests: [...SEED_REQUESTS],
  auditLog: generateAuditEntries(SEED_REQUESTS),

  setCurrentUser: (user) => set({ currentUser: user }),
  switchRole: (role) => {
    const user = USERS.find((u) => u.role === role);
    if (user) set({ currentUser: user });
  },

  addRequest: (request) => {
    const state = get();
    set({
      requests: [request, ...state.requests],
      auditLog: [
        {
          id: `a${Date.now()}`,
          requestId: request.id,
          action: 'submitted',
          userId: request.requesterId,
          timestamp: request.createdAt,
          details: `Purchase request ${request.poNumber} submitted`,
        },
        ...state.auditLog,
      ],
    });
  },

  updateRequest: (id, updates) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    })),

  markPurchased: (id, finalTotal, receiptUri, notes) => {
    const state = get();
    const request = state.requests.find((r) => r.id === id);
    const now = new Date().toISOString();

    const updatedNotes = notes && notes.trim()
      ? (request?.notes ? `${request.notes}\n\nPurchase notes: ${notes}` : `Purchase notes: ${notes}`)
      : request?.notes ?? '';

    set({
      requests: state.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'purchased' as RequestStatus,
              finalTotal,
              purchasedAt: now,
              notes: updatedNotes,
              receiptAttachments: receiptUri ? [...r.receiptAttachments, receiptUri] : r.receiptAttachments,
              updatedAt: now,
            }
          : r
      ),
      auditLog: [
        {
          id: `a${Date.now()}`,
          requestId: id,
          action: 'purchased',
          userId: state.currentUser.id,
          timestamp: now,
          details: `Marked purchased – $${finalTotal.toLocaleString()}${receiptUri ? ' (receipt attached)' : ''}`,
        },
        ...state.auditLog,
      ],
    });
  },

  getUserById: (id) => get().users.find((u) => u.id === id),
  getProjectById: (id) => get().projects.find((p) => p.id === id),
  getCostCodeById: (id) => get().costCodes.find((c) => c.id === id),
  getMyRequests: () => {
    const state = get();
    return state.requests
      .filter((r) => r.requesterId === state.currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
}));

import {
  User, Project, CostCode, PurchaseRequest,
} from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'Mike Torres', email: 'mike@evenconstruction.com', role: 'worker' },
  { id: 'u2', name: 'Jake Patterson', email: 'jake@evenconstruction.com', role: 'worker' },
  { id: 'u3', name: 'Sarah Chen', email: 'sarah@evenconstruction.com', role: 'manager' },
  { id: 'u4', name: 'Tom Bradley', email: 'tom@evenconstruction.com', role: 'admin' },
  { id: 'u5', name: 'Luis Ramirez', email: 'luis@evenconstruction.com', role: 'worker' },
];

export const PROJECTS: Project[] = [
  { id: 'p1', name: 'Riverside Office Build', jobNumber: 'JOB-2024-041', address: '1200 River Rd, Austin TX 78701', monthlyBudget: 85000, status: 'active' },
  { id: 'p2', name: 'Oakmont Retail TI', jobNumber: 'JOB-2024-055', address: '340 Oakmont Blvd, Round Rock TX 78664', monthlyBudget: 42000, status: 'active' },
  { id: 'p3', name: 'Cedar Park Municipal', jobNumber: 'JOB-2024-063', address: '900 Discovery Blvd, Cedar Park TX 78613', monthlyBudget: 120000, status: 'active' },
];

export const COST_CODES: CostCode[] = [
  { id: 'cc1', code: '03-100', label: 'Concrete Formwork', category: 'Concrete' },
  { id: 'cc2', code: '03-300', label: 'Cast-in-Place Concrete', category: 'Concrete' },
  { id: 'cc3', code: '05-100', label: 'Structural Steel', category: 'Metals' },
  { id: 'cc4', code: '06-100', label: 'Rough Carpentry', category: 'Wood & Plastics' },
  { id: 'cc5', code: '07-200', label: 'Insulation', category: 'Thermal & Moisture' },
  { id: 'cc6', code: '09-250', label: 'Drywall', category: 'Finishes' },
  { id: 'cc7', code: '09-900', label: 'Painting', category: 'Finishes' },
  { id: 'cc8', code: '15-100', label: 'Plumbing', category: 'Mechanical' },
  { id: 'cc9', code: '16-100', label: 'Electrical', category: 'Electrical' },
  { id: 'cc10', code: '01-500', label: 'Temporary Facilities', category: 'General' },
  { id: 'cc11', code: '02-300', label: 'Earthwork', category: 'Site Work' },
  { id: 'cc12', code: '08-100', label: 'Doors & Frames', category: 'Openings' },
];

function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString();
}
function hoursAgo(n: number): string {
  const d = new Date(); d.setHours(d.getHours() - n); return d.toISOString();
}

let po = 1041;
function nextPO() { return `PO-${po++}`; }

export const SEED_REQUESTS: PurchaseRequest[] = [
  // ── Pending requests ─────────────────────
  {
    id: 'r1', poNumber: nextPO(), projectId: 'p1', requesterId: 'u1', vendor: 'White Cap Supply',
    category: 'materials', costCodeId: 'cc2',
    lineItems: [
      { id: 'li1', name: '80lb Concrete Mix', quantity: 40, unit: 'bags', estimatedUnitCost: 6.50 },
      { id: 'li2', name: 'Rebar #4 x 20ft', quantity: 24, unit: 'pcs', estimatedUnitCost: 14.75 },
    ],
    estimatedTotal: 614.00, needBy: 'today', urgency: 'urgent',
    notes: 'Foundation pour scheduled for tomorrow AM. Need delivered by 2pm today.',
    attachments: ['/mock/quote-whitecap.jpg'], receiptAttachments: [],
    deliveryMethod: 'delivery', deliveryAddress: '1200 River Rd, Austin TX 78701',
    status: 'pending', createdAt: hoursAgo(2), updatedAt: hoursAgo(2),
  },
  {
    id: 'r2', poNumber: nextPO(), projectId: 'p1', requesterId: 'u2', vendor: 'Sunbelt Rentals',
    category: 'equipment-rental', costCodeId: 'cc10',
    lineItems: [{ id: 'li3', name: 'Scissor Lift 26ft', quantity: 1, unit: 'week', estimatedUnitCost: 875.00 }],
    estimatedTotal: 875.00, needBy: 'tomorrow', urgency: 'normal',
    notes: 'For ceiling rough-in on 2nd floor. Need for full week starting Monday.',
    attachments: [], receiptAttachments: [], deliveryMethod: 'delivery',
    deliveryAddress: '1200 River Rd, Austin TX 78701',
    status: 'pending', createdAt: hoursAgo(5), updatedAt: hoursAgo(5),
  },
  {
    id: 'r3', poNumber: nextPO(), projectId: 'p2', requesterId: 'u5', vendor: 'Home Depot Pro',
    category: 'materials', costCodeId: 'cc6',
    lineItems: [
      { id: 'li4', name: '5/8" Drywall 4x8', quantity: 120, unit: 'sheets', estimatedUnitCost: 14.25 },
      { id: 'li5', name: 'Drywall Screws 1-5/8"', quantity: 10, unit: 'boxes', estimatedUnitCost: 8.50 },
      { id: 'li6', name: 'Joint Compound 5gal', quantity: 8, unit: 'buckets', estimatedUnitCost: 16.00 },
    ],
    estimatedTotal: 1923.00, needBy: 'this-week', urgency: 'normal',
    notes: 'Starting drywall on retail space A. Quote attached from HD Pro desk.',
    attachments: ['/mock/quote-hdpro.jpg'], receiptAttachments: [],
    deliveryMethod: 'delivery', deliveryAddress: '340 Oakmont Blvd, Round Rock TX 78664',
    status: 'pending', createdAt: hoursAgo(8), updatedAt: hoursAgo(8),
  },
  {
    id: 'r4', poNumber: nextPO(), projectId: 'p3', requesterId: 'u1', vendor: 'Fastenal',
    category: 'materials', costCodeId: 'cc3',
    lineItems: [
      { id: 'li7', name: 'Hex Bolts 3/4"x6"', quantity: 200, unit: 'pcs', estimatedUnitCost: 2.15 },
      { id: 'li8', name: 'Structural Washers 3/4"', quantity: 200, unit: 'pcs', estimatedUnitCost: 0.85 },
      { id: 'li9', name: 'Heavy Hex Nuts 3/4"', quantity: 200, unit: 'pcs', estimatedUnitCost: 0.95 },
    ],
    estimatedTotal: 790.00, needBy: 'today', urgency: 'urgent',
    notes: 'Steel erection crew on site, running low on connection hardware.',
    attachments: [], receiptAttachments: [], deliveryMethod: 'pickup',
    status: 'pending', createdAt: hoursAgo(1), updatedAt: hoursAgo(1),
  },
  {
    id: 'r5', poNumber: nextPO(), projectId: 'p2', requesterId: 'u2', vendor: 'Ferguson Enterprises',
    category: 'materials', costCodeId: 'cc8',
    lineItems: [
      { id: 'li10', name: '3/4" Copper Pipe Type L 10ft', quantity: 30, unit: 'pcs', estimatedUnitCost: 28.50 },
      { id: 'li11', name: '3/4" Copper Elbows', quantity: 50, unit: 'pcs', estimatedUnitCost: 3.25 },
      { id: 'li12', name: 'Solder & Flux Kit', quantity: 4, unit: 'kits', estimatedUnitCost: 22.00 },
    ],
    estimatedTotal: 1105.50, needBy: 'tomorrow', urgency: 'normal',
    notes: 'Plumbing rough-in for bathrooms in Suite B.',
    attachments: ['/mock/ferguson-quote.jpg'], receiptAttachments: [],
    deliveryMethod: 'delivery', deliveryAddress: '340 Oakmont Blvd, Round Rock TX 78664',
    status: 'pending', createdAt: hoursAgo(3), updatedAt: hoursAgo(3),
  },

  // ── Approved requests ────────────────────
  {
    id: 'r6', poNumber: nextPO(), projectId: 'p1', requesterId: 'u1', vendor: 'ABC Supply',
    category: 'materials', costCodeId: 'cc5',
    lineItems: [{ id: 'li13', name: 'R-19 Batt Insulation', quantity: 20, unit: 'rolls', estimatedUnitCost: 42.00 }],
    estimatedTotal: 840.00, needBy: 'this-week', urgency: 'normal',
    notes: 'Insulation for exterior walls, Building A.',
    attachments: [], receiptAttachments: [], deliveryMethod: 'delivery',
    deliveryAddress: '1200 River Rd, Austin TX 78701',
    status: 'approved', createdAt: daysAgo(2), updatedAt: daysAgo(1),
    approvedAt: daysAgo(1), approvedBy: 'u3',
  },
  {
    id: 'r7', poNumber: nextPO(), projectId: 'p3', requesterId: 'u5', vendor: 'Graybar Electric',
    category: 'materials', costCodeId: 'cc9',
    lineItems: [
      { id: 'li14', name: '12/2 Romex 250ft', quantity: 8, unit: 'rolls', estimatedUnitCost: 128.00 },
      { id: 'li15', name: 'Single Gang Boxes', quantity: 100, unit: 'pcs', estimatedUnitCost: 1.25 },
      { id: 'li16', name: '20A Breakers', quantity: 24, unit: 'pcs', estimatedUnitCost: 8.75 },
    ],
    estimatedTotal: 1359.00, needBy: 'this-week', urgency: 'normal',
    notes: 'Electrical rough-in, Phase 2 wing.',
    attachments: ['/mock/graybar-quote.jpg'], receiptAttachments: [],
    deliveryMethod: 'delivery', deliveryAddress: '900 Discovery Blvd, Cedar Park TX 78613',
    status: 'approved', createdAt: daysAgo(3), updatedAt: daysAgo(2),
    approvedAt: daysAgo(2), approvedBy: 'u3',
  },

  // ── Rejected request ─────────────────────
  {
    id: 'r8', poNumber: nextPO(), projectId: 'p2', requesterId: 'u2', vendor: 'United Rentals',
    category: 'equipment-rental', costCodeId: 'cc10',
    lineItems: [{ id: 'li17', name: 'Mini Excavator CAT 303', quantity: 1, unit: 'month', estimatedUnitCost: 4500.00 }],
    estimatedTotal: 4500.00, needBy: 'next-week', urgency: 'normal',
    notes: 'For parking lot grading.',
    attachments: [], receiptAttachments: [], deliveryMethod: 'delivery',
    deliveryAddress: '340 Oakmont Blvd, Round Rock TX 78664',
    status: 'rejected', createdAt: daysAgo(4), updatedAt: daysAgo(3),
    rejectedAt: daysAgo(3), rejectedBy: 'u3',
    rejectionReason: 'Over budget for this phase. Re-submit after Phase 1 closes out. Consider 2-week rental instead.',
  },

  // ── Purchased requests ───────────────────
  {
    id: 'r9', poNumber: nextPO(), projectId: 'p1', requesterId: 'u1', vendor: 'Sherwin-Williams',
    category: 'materials', costCodeId: 'cc7',
    lineItems: [
      { id: 'li18', name: 'ProMar 200 Interior Flat 5gal', quantity: 6, unit: 'buckets', estimatedUnitCost: 98.00 },
      { id: 'li19', name: 'Primer 5gal', quantity: 4, unit: 'buckets', estimatedUnitCost: 72.00 },
      { id: 'li20', name: 'Roller Covers 9"', quantity: 24, unit: 'pcs', estimatedUnitCost: 4.50 },
    ],
    estimatedTotal: 984.00, finalTotal: 1012.47, needBy: 'this-week', urgency: 'normal',
    notes: 'Paint for common areas, Phase 1.',
    attachments: ['/mock/sw-quote.jpg'], receiptAttachments: ['/mock/receipt-sw.jpg'],
    deliveryMethod: 'pickup',
    status: 'purchased', createdAt: daysAgo(7), updatedAt: daysAgo(5),
    approvedAt: daysAgo(6), approvedBy: 'u3', purchasedAt: daysAgo(5),
  },
  {
    id: 'r10', poNumber: nextPO(), projectId: 'p3', requesterId: 'u5', vendor: 'HD Supply',
    category: 'materials', costCodeId: 'cc4',
    lineItems: [
      { id: 'li21', name: '2x6x16 SPF #2', quantity: 200, unit: 'pcs', estimatedUnitCost: 9.85 },
      { id: 'li22', name: '2x4x8 SPF Stud', quantity: 300, unit: 'pcs', estimatedUnitCost: 4.25 },
      { id: 'li23', name: 'Simpson Strong-Tie A35', quantity: 100, unit: 'pcs', estimatedUnitCost: 1.65 },
    ],
    estimatedTotal: 3410.00, finalTotal: 3387.50, needBy: 'this-week', urgency: 'normal',
    notes: 'Framing lumber for interior partitions, Building B.',
    attachments: [], receiptAttachments: ['/mock/receipt-hdsupply.jpg'],
    deliveryMethod: 'delivery', deliveryAddress: '900 Discovery Blvd, Cedar Park TX 78613',
    status: 'purchased', createdAt: daysAgo(10), updatedAt: daysAgo(7),
    approvedAt: daysAgo(9), approvedBy: 'u3', purchasedAt: daysAgo(7),
  },
];

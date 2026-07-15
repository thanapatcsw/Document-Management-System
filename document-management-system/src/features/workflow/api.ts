// ============================================================
// Mock API functions for workflow and approvals
// ============================================================

export interface Approval {
  id: string;
  name: string;
  amount: string;
  requester: string;
  submittedDate: string;
  currentLevel: number;
  maxLevels: number;
  status: "Draft" | "Pending" | "Approved" | "Returned for Revision" | "Cancelled";
}

const MOCK_APPROVALS: Approval[] = [
  {
    id: "PR-2026-0001",
    name: "ขอซื้อวัสดุสำนักงาน Q3/2026",
    amount: "฿12,500",
    requester: "สมชาย ใจดี",
    submittedDate: "14 ก.ค. 2026",
    currentLevel: 1,
    maxLevels: 3,
    status: "Pending",
  },
  {
    id: "PO-2026-0001",
    name: "สั่งซื้อคอมพิวเตอร์ Dell Latitude 5440",
    amount: "฿64,000",
    requester: "วิภา รักดี",
    submittedDate: "13 ก.ค. 2026",
    currentLevel: 2,
    maxLevels: 3,
    status: "Pending",
  },
  {
    id: "PR-2026-0002",
    name: "ขอจัดซื้ออุปกรณ์ความปลอดภัย",
    amount: "฿8,200",
    requester: "อรทัย สุขใจ",
    submittedDate: "12 ก.ค. 2026",
    currentLevel: 1,
    maxLevels: 2,
    status: "Returned for Revision",
  },
];

export async function getApprovals(): Promise<Approval[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_APPROVALS;
}

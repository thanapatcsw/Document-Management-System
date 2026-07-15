// Document Types
export type DocumentStatus = "Draft" | "Pending" | "Approved" | "Rejected" | "Cancelled";
export type DocumentType = "PR" | "PO" | "Certificate" | "General";

export interface Document {
  id: string;
  doc_number: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  creator_name: string;
  department: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

// PR Form
export interface PRFormItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  remark?: string;
}

export interface PRForm {
  id: string;
  document_id: string;
  requested_date: string;
  required_date: string;
  requester_name: string;
  department: string;
  purpose: string;
  total_amount: number;
  items: PRFormItem[];
}

// PO Form
export interface POFormItem {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat: number;
  total_price: number;
  remark?: string;
}

export interface POForm {
  id: string;
  document_id: string;
  vendor_name: string;
  vendor_contact: string;
  delivery_date: string;
  payment_terms: string;
  total_amount: number;
  items: POFormItem[];
}

// User & Auth
export type UserRole = "Administrator" | "Manager" | "Employee";

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
  role: UserRole;
  is_active: boolean;
  signature_image_path?: string;
  created_at: string;
}

// Workflow
export type WorkflowStatus = "Pending" | "Approved" | "Rejected";

export interface WorkflowStep {
  id: string;
  step_order: number;
  approver_name: string;
  approver_role: string;
  status: WorkflowStatus;
  action_date?: string;
  comment?: string;
  signature_applied: boolean;
}

export interface Workflow {
  id: string;
  document_id: string;
  total_steps: number;
  current_step: number;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  created_at: string;
}

// Notification
export interface Notification {
  id: string;
  message: string;
  document_id: string;
  document_title: string;
  is_read: boolean;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
}

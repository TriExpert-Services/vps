export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface VPSPlan {
  id: string;
  name: string;
  description: string;
  cpu_cores: number;
  ram_gb: number;
  storage_gb: number;
  bandwidth_gb: number;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface VPSService {
  id: string;
  user_id: string;
  plan_id: string;
  proxmox_vmid: number;
  name: string;
  status: 'creating' | 'running' | 'stopped' | 'suspended' | 'error';
  ip_address?: string;
  root_password: string;
  node_name: string;
  created_at: string;
  expires_at: string;
}

export interface ProxmoxNode {
  node: string;
  status: 'online' | 'offline';
  uptime: number;
  cpu_usage: number;
  memory_total: number;
  memory_used: number;
  storage_total: number;
  storage_used: number;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  vps_service_id?: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  vps_service_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  paid_at?: string;
  created_at: string;
}
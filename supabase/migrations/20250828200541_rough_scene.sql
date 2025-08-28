/*
  # TriExpert Services - Schema Inicial

  1. Nuevas Tablas
     - `users` - Perfiles de usuario extendidos
     - `vps_plans` - Planes VPS disponibles  
     - `vps_services` - Servicios VPS activos de los usuarios
     - `support_tickets` - Tickets de soporte técnico
     - `invoices` - Facturas y pagos
     - `system_settings` - Configuración global del sistema

  2. Seguridad
     - RLS habilitado en todas las tablas
     - Políticas para usuarios y administradores
     - Acceso controlado por roles

  3. Características
     - UUID como llaves primarias
     - Timestamps automáticos
     - Valores por defecto apropiados
     - Índices para consultas frecuentes
*/

-- Tabla de usuarios extendida (conectada con auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de planes VPS
CREATE TABLE IF NOT EXISTS vps_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  cpu_cores integer NOT NULL DEFAULT 1,
  ram_gb integer NOT NULL DEFAULT 1,
  storage_gb integer NOT NULL DEFAULT 20,
  bandwidth_gb integer NOT NULL DEFAULT 1000,
  price_monthly numeric(10,2) NOT NULL,
  price_yearly numeric(10,2) NOT NULL,
  features text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de servicios VPS activos
CREATE TABLE IF NOT EXISTS vps_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES vps_plans(id),
  proxmox_vmid integer NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'creating' CHECK (status IN ('creating', 'running', 'stopped', 'suspended', 'error')),
  ip_address text,
  root_password text NOT NULL,
  node_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Tabla de tickets de soporte
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vps_service_id uuid REFERENCES vps_services(id),
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  vps_service_id uuid REFERENCES vps_services(id),
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date timestamptz NOT NULL,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(category, key)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para vps_plans
CREATE POLICY "Everyone can read active plans" ON vps_plans
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON vps_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para vps_services
CREATE POLICY "Users can read own VPS" ON vps_services
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own VPS" ON vps_services
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all VPS" ON vps_services
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para support_tickets
CREATE POLICY "Users can read own tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all tickets" ON support_tickets
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para invoices
CREATE POLICY "Users can read own invoices" ON invoices
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all invoices" ON invoices
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas RLS para system_settings
CREATE POLICY "Admins can manage settings" ON system_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_vps_services_user_id ON vps_services(user_id);
CREATE INDEX IF NOT EXISTS idx_vps_services_status ON vps_services(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- Insertar planes VPS por defecto
INSERT INTO vps_plans (name, description, cpu_cores, ram_gb, storage_gb, bandwidth_gb, price_monthly, price_yearly, features) VALUES
('VPS Starter', 'Perfecto para proyectos pequeños y desarrollo', 1, 2, 50, 2000, 9.99, 99.99, ARRAY['1 vCPU Core', '2GB RAM', '50GB SSD', '2TB Bandwidth', '1 IP Dedicada', 'Soporte 24/7']),
('VPS Professional', 'Ideal para sitios web y aplicaciones empresariales', 2, 4, 100, 4000, 19.99, 199.99, ARRAY['2 vCPU Cores', '4GB RAM', '100GB SSD', '4TB Bandwidth', '1 IP Dedicada', 'Soporte Prioritario 24/7']),
('VPS Enterprise', 'Máximo rendimiento para aplicaciones críticas', 4, 8, 200, 8000, 39.99, 399.99, ARRAY['4 vCPU Cores', '8GB RAM', '200GB SSD', '8TB Bandwidth', '2 IPs Dedicadas', 'Soporte Dedicado 24/7']);

-- Insertar configuración por defecto del sistema
INSERT INTO system_settings (category, key, value, description) VALUES
('proxmox', 'host', 'https://proxmox.triexpert.local:8006', 'URL del servidor Proxmox'),
('proxmox', 'username', 'root@pam', 'Usuario para API de Proxmox'),
('proxmox', 'default_node', 'proxmox-node-1', 'Nodo por defecto para nuevos VPS'),
('email', 'smtp_host', 'smtp.gmail.com', 'Servidor SMTP'),
('email', 'smtp_port', '587', 'Puerto SMTP'),
('email', 'from_email', 'noreply@triexpert.com', 'Email remitente'),
('email', 'from_name', 'TriExpert Services', 'Nombre remitente'),
('n8n', 'webhook_url', 'https://n8n.triexpert.com/webhook', 'URL de webhook n8n'),
('n8n', 'enabled', 'true', 'Integración n8n habilitada'),
('billing', 'currency', 'USD', 'Moneda por defecto'),
('billing', 'tax_rate', '8.5', 'Tasa de impuesto por defecto'),
('billing', 'invoice_prefix', 'TRI', 'Prefijo para números de factura');
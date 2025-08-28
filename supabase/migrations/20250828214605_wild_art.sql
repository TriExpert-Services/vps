/*
  # TriExpert Services - Schema Completo y Limpio

  1. **Tablas principales:**
     - `users` - Perfiles de usuario extendidos (conectados a auth.users)
     - `vps_plans` - Planes VPS disponibles
     - `vps_services` - Servicios VPS activos de usuarios
     - `support_tickets` - Sistema de tickets de soporte
     - `invoices` - Facturas y pagos
     - `system_settings` - Configuración global

  2. **Seguridad RLS:**
     - Políticas sin recursión infinita
     - Acceso controlado por roles
     - Políticas separadas para usuarios y administradores

  3. **Características:**
     - UUIDs como llaves primarias
     - Timestamps automáticos
     - Valores por defecto apropiados
     - Índices para optimización
     - Trigger para creación automática de perfiles
     - Datos iniciales (planes VPS y configuración)

  4. **Detección automática de administradores:**
     - Emails específicos se asignan como admin automáticamente
     - support@triexpertservice.com
     - admin@triexpertservice.com
     - admin@triexpert.com
*/

-- =====================================================
-- 1. TABLAS PRINCIPALES
-- =====================================================

-- Tabla de usuarios extendida (conectada con auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url text,
  phone text,
  company text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de planes VPS
CREATE TABLE IF NOT EXISTS vps_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  cpu_cores integer NOT NULL DEFAULT 1 CHECK (cpu_cores > 0),
  ram_gb integer NOT NULL DEFAULT 1 CHECK (ram_gb > 0),
  storage_gb integer NOT NULL DEFAULT 20 CHECK (storage_gb > 0),
  bandwidth_gb integer NOT NULL DEFAULT 1000 CHECK (bandwidth_gb > 0),
  price_monthly numeric(10,2) NOT NULL CHECK (price_monthly > 0),
  price_yearly numeric(10,2) NOT NULL CHECK (price_yearly > 0),
  features text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de servicios VPS activos
CREATE TABLE IF NOT EXISTS vps_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES vps_plans(id),
  proxmox_vmid integer UNIQUE NOT NULL,
  name text NOT NULL,
  status text DEFAULT 'creating' CHECK (status IN ('creating', 'running', 'stopped', 'suspended', 'error', 'deleting')),
  ip_address inet,
  ipv6_address inet,
  root_password text NOT NULL,
  node_name text NOT NULL,
  datacenter text DEFAULT 'us-east-1',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_status_check timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT valid_vmid CHECK (proxmox_vmid BETWEEN 100 AND 99999)
);

-- Tabla de tickets de soporte
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vps_service_id uuid REFERENCES vps_services(id),
  subject text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text DEFAULT 'general' CHECK (category IN ('general', 'technical', 'billing', 'abuse')),
  assigned_to uuid REFERENCES users(id),
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  
  -- Constraints
  CONSTRAINT closed_ticket_resolution CHECK (
    (status = 'closed' AND resolution IS NOT NULL) OR 
    (status != 'closed')
  )
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vps_service_id uuid REFERENCES vps_services(id),
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'MXN')),
  tax_amount numeric(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount numeric(10,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded')),
  description text,
  due_date timestamptz NOT NULL,
  paid_at timestamptz,
  payment_method text,
  payment_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_payment CHECK (
    (status = 'paid' AND paid_at IS NOT NULL) OR 
    (status != 'paid')
  )
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  value_type text DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Unique constraint para category + key
  UNIQUE(category, key)
);

-- =====================================================
-- 2. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_vps_plans_active ON vps_plans(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_vps_plans_price ON vps_plans(price_monthly) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vps_services_user ON vps_services(user_id);
CREATE INDEX IF NOT EXISTS idx_vps_services_status ON vps_services(status);
CREATE INDEX IF NOT EXISTS idx_vps_services_expires ON vps_services(expires_at);
CREATE INDEX IF NOT EXISTS idx_vps_services_node ON vps_services(node_name);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to);

CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. POLÍTICAS RLS PARA USERS (SIN RECURSIÓN)
-- =====================================================

-- Usuarios pueden ver su propio perfil
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Permitir inserción de perfiles (para registro)
CREATE POLICY "users_insert_profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Usuarios pueden eliminar su propio perfil
CREATE POLICY "users_delete_own" ON users
  FOR DELETE
  USING (auth.uid() = id);

-- Los administradores pueden gestionar todos los usuarios
-- NOTA: Esto se implementará después de tener al menos un admin en la tabla
CREATE POLICY "admins_manage_users" ON users
  FOR ALL
  USING (
    -- Solo aplicar si ya existen admins en el sistema
    EXISTS (SELECT 1 FROM users WHERE role = 'admin' LIMIT 1) AND
    -- El usuario actual debe ser admin
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- =====================================================
-- 5. POLÍTICAS RLS PARA OTRAS TABLAS
-- =====================================================

-- VPS Plans: Todos pueden ver planes activos, solo admins pueden gestionar
CREATE POLICY "vps_plans_select_active" ON vps_plans
  FOR SELECT
  USING (
    is_active = true OR 
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "vps_plans_admin_manage" ON vps_plans
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- VPS Services: Usuarios ven solo los suyos, admins ven todos
CREATE POLICY "vps_services_user_own" ON vps_services
  FOR ALL
  USING (
    user_id = auth.uid() OR 
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Support Tickets: Usuarios ven solo los suyos, admins ven todos
CREATE POLICY "support_tickets_user_own" ON support_tickets
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    assigned_to = auth.uid() OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "support_tickets_user_create" ON support_tickets
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "support_tickets_user_update" ON support_tickets
  FOR UPDATE
  USING (
    user_id = auth.uid() OR 
    assigned_to = auth.uid() OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "support_tickets_admin_delete" ON support_tickets
  FOR DELETE
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- Invoices: Usuarios ven solo las suyas, admins ven todas
CREATE POLICY "invoices_user_own" ON invoices
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "invoices_admin_manage" ON invoices
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- System Settings: Solo administradores
CREATE POLICY "system_settings_admin_only" ON system_settings
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- =====================================================
-- 6. FUNCIÓN Y TRIGGER PARA NUEVOS USUARIOS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
  user_role text;
BEGIN
  -- Obtener nombre del metadata o usar email como fallback
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'fullName', 
    split_part(NEW.email, '@', 1)
  );
  
  -- Determinar rol basado en email
  user_role := CASE 
    WHEN NEW.email IN (
      'support@triexpertservice.com',
      'admin@triexpertservice.com',
      'admin@triexpert.com'
    ) THEN 'admin'
    ELSE 'user'
  END;
  
  -- Insertar perfil de usuario
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    user_name, 
    user_role,
    now(),
    now()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- El usuario ya existe, actualizar datos si es necesario
    UPDATE public.users 
    SET 
      email = NEW.email,
      full_name = COALESCE(user_name, full_name),
      role = CASE 
        WHEN NEW.email IN (
          'support@triexpertservice.com',
          'admin@triexpertservice.com',
          'admin@triexpert.com'
        ) THEN 'admin'
        ELSE role
      END,
      updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN others THEN
    -- Log del error pero no fallar el registro
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 7. FUNCIÓN PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de update a todas las tablas relevantes
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vps_plans_updated_at
  BEFORE UPDATE ON vps_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vps_services_updated_at
  BEFORE UPDATE ON vps_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. DATOS INICIALES - PLANES VPS
-- =====================================================

INSERT INTO vps_plans (name, description, cpu_cores, ram_gb, storage_gb, bandwidth_gb, price_monthly, price_yearly, features, sort_order) VALUES
('VPS Starter', 'Perfecto para proyectos pequeños y desarrollo personal', 1, 2, 50, 2000, 9.99, 99.99, 
 ARRAY[
   '1 vCPU Core Intel Xeon',
   '2GB DDR4 RAM',
   '50GB SSD NVMe',
   '2TB Bandwidth',
   '1 IPv4 Dedicada',
   'Panel de Control cPanel',
   'Backup Diario',
   'Soporte 24/7',
   'Uptime 99.9%',
   'DDoS Protection'
 ], 1),

('VPS Professional', 'Ideal para sitios web y aplicaciones empresariales', 2, 4, 100, 4000, 19.99, 199.99,
 ARRAY[
   '2 vCPU Cores Intel Xeon',
   '4GB DDR4 RAM',
   '100GB SSD NVMe',
   '4TB Bandwidth',
   '1 IPv4 Dedicada',
   'Panel de Control cPanel',
   'Backup Diario Automático',
   'Soporte Prioritario 24/7',
   'Uptime 99.9%',
   'DDoS Protection Avanzado',
   'SSL Gratuito',
   'Migración Gratuita'
 ], 2),

('VPS Enterprise', 'Máximo rendimiento para aplicaciones críticas y alta demanda', 4, 8, 200, 8000, 39.99, 399.99,
 ARRAY[
   '4 vCPU Cores Intel Xeon E5',
   '8GB DDR4 RAM',
   '200GB SSD NVMe',
   '8TB Bandwidth',
   '2 IPv4 Dedicadas',
   'Panel de Control WHM/cPanel',
   'Backup Diario + Semanal',
   'Soporte Dedicado 24/7',
   'Uptime 99.99%',
   'DDoS Protection Empresarial',
   'SSL Wildcard Gratuito',
   'Migración Gratuita',
   'Monitoreo Avanzado',
   'Acceso Root Completo'
 ], 3),

('VPS Ultimate', 'Para aplicaciones de misión crítica y alta disponibilidad', 6, 16, 400, 16000, 79.99, 799.99,
 ARRAY[
   '6 vCPU Cores Intel Xeon E5',
   '16GB DDR4 RAM',
   '400GB SSD NVMe',
   '16TB Bandwidth',
   '4 IPv4 Dedicadas',
   'Panel de Control Personalizado',
   'Backup Múltiple (Diario/Semanal/Mensual)',
   'Soporte Premium 24/7',
   'Uptime 99.99%',
   'DDoS Protection Militar',
   'SSL EV Gratuito',
   'Migración Premium',
   'Monitoreo en Tiempo Real',
   'Acceso Root + Console',
   'Load Balancer Incluido',
   'CDN Global'
 ], 4);

-- =====================================================
-- 9. CONFIGURACIÓN INICIAL DEL SISTEMA
-- =====================================================

INSERT INTO system_settings (category, key, value, value_type, description) VALUES
-- Configuración de Proxmox
('proxmox', 'host', 'https://pve.triexpertservice.com:8006', 'string', 'URL del servidor Proxmox VE'),
('proxmox', 'username', 'root@pam', 'string', 'Usuario para autenticación con API de Proxmox'),
('proxmox', 'default_node', 'proxmox-node-1', 'string', 'Nodo por defecto para creación de VPS'),
('proxmox', 'storage', 'local-lvm', 'string', 'Storage por defecto para discos VPS'),
('proxmox', 'network_bridge', 'vmbr0', 'string', 'Bridge de red por defecto'),
('proxmox', 'template_id', '9000', 'number', 'ID de template base para VPS'),

-- Configuración de Email/SMTP
('email', 'smtp_host', 'smtp.gmail.com', 'string', 'Servidor SMTP para envío de emails'),
('email', 'smtp_port', '587', 'number', 'Puerto SMTP (587 para TLS, 465 para SSL)'),
('email', 'smtp_encryption', 'tls', 'string', 'Tipo de encriptación SMTP'),
('email', 'from_email', 'noreply@triexpertservice.com', 'string', 'Email remitente por defecto'),
('email', 'from_name', 'TriExpert Services', 'string', 'Nombre remitente por defecto'),
('email', 'reply_to', 'support@triexpertservice.com', 'string', 'Email de respuesta'),

-- Configuración de n8n (Automatización)
('n8n', 'webhook_url', 'https://app.n8n-tech.cloud/webhook', 'string', 'URL base para webhooks de n8n'),
('n8n', 'enabled', 'true', 'boolean', 'Habilitar integración con n8n'),
('n8n', 'timeout', '30', 'number', 'Timeout para requests a n8n (segundos)'),

-- Configuración de Facturación
('billing', 'currency', 'USD', 'string', 'Moneda por defecto del sistema'),
('billing', 'tax_rate', '8.5', 'number', 'Tasa de impuesto por defecto (%)'),
('billing', 'tax_name', 'Sales Tax', 'string', 'Nombre del impuesto'),
('billing', 'invoice_prefix', 'TRI', 'string', 'Prefijo para números de factura'),
('billing', 'payment_terms_days', '30', 'number', 'Días para vencimiento de facturas'),
('billing', 'late_fee_rate', '2.5', 'number', 'Tasa de recargo por pago tardío (%)'),

-- Configuración de Soporte
('support', 'default_priority', 'medium', 'string', 'Prioridad por defecto para nuevos tickets'),
('support', 'auto_assign', 'false', 'boolean', 'Asignación automática de tickets'),
('support', 'business_hours_start', '08:00', 'string', 'Inicio de horario comercial'),
('support', 'business_hours_end', '18:00', 'string', 'Fin de horario comercial'),
('support', 'response_sla_hours', '24', 'number', 'SLA de respuesta en horas'),

-- Configuración de VPS
('vps', 'default_datacenter', 'us-east-1', 'string', 'Datacenter por defecto'),
('vps', 'min_vmid', '1000', 'number', 'VMID mínimo para VPS'),
('vps', 'max_vmid', '9999', 'number', 'VMID máximo para VPS'),
('vps', 'default_os', 'ubuntu-20.04', 'string', 'OS por defecto para VPS'),
('vps', 'auto_start', 'true', 'boolean', 'Iniciar VPS automáticamente después de creación'),
('vps', 'backup_retention_days', '30', 'number', 'Días de retención de backups'),

-- Configuración de Seguridad
('security', 'password_min_length', '8', 'number', 'Longitud mínima de contraseñas'),
('security', 'max_login_attempts', '5', 'number', 'Máximo intentos de login antes de bloqueo'),
('security', 'lockout_duration_minutes', '15', 'number', 'Duración de bloqueo en minutos'),
('security', 'session_timeout_hours', '24', 'number', 'Timeout de sesión en horas'),

-- Configuración General
('general', 'company_name', 'TriExpert Services', 'string', 'Nombre de la empresa'),
('general', 'company_website', 'https://triexpertservice.com', 'string', 'Website de la empresa'),
('general', 'support_email', 'support@triexpertservice.com', 'string', 'Email principal de soporte'),
('general', 'support_phone', '+1-555-123-4567', 'string', 'Teléfono de soporte'),
('general', 'timezone', 'America/New_York', 'string', 'Zona horaria por defecto'),
('general', 'maintenance_mode', 'false', 'boolean', 'Modo mantenimiento habilitado');

-- =====================================================
-- 10. CREAR SECUENCIA PARA NÚMEROS DE FACTURA
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;

-- Función para generar número de factura
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  prefix text;
  next_num integer;
BEGIN
  -- Obtener prefijo de configuración
  SELECT value INTO prefix FROM system_settings 
  WHERE category = 'billing' AND key = 'invoice_prefix';
  
  -- Si no hay prefijo, usar por defecto
  IF prefix IS NULL THEN
    prefix := 'INV';
  END IF;
  
  -- Obtener siguiente número
  SELECT nextval('invoice_number_seq') INTO next_num;
  
  -- Retornar número formateado
  RETURN prefix || '-' || LPAD(next_num::text, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de factura automáticamente
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_invoice_number();

-- =====================================================
-- 11. GRANTS DE PERMISOS
-- =====================================================

-- Permisos para usuarios autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permisos para usuario anónimo (solo lectura limitada)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON vps_plans TO anon;

-- =====================================================
-- 12. COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE users IS 'Perfiles de usuario extendidos conectados a auth.users';
COMMENT ON TABLE vps_plans IS 'Planes VPS disponibles para contratar';
COMMENT ON TABLE vps_services IS 'Servicios VPS activos de los usuarios';
COMMENT ON TABLE support_tickets IS 'Sistema de tickets de soporte técnico';
COMMENT ON TABLE invoices IS 'Facturas y control de pagos';
COMMENT ON TABLE system_settings IS 'Configuración global del sistema';

COMMENT ON COLUMN users.role IS 'Rol del usuario: user o admin';
COMMENT ON COLUMN vps_services.proxmox_vmid IS 'ID único de la VM en Proxmox';
COMMENT ON COLUMN vps_services.status IS 'Estado actual del VPS';
COMMENT ON COLUMN invoices.total_amount IS 'Monto total calculado automáticamente (amount + tax_amount)';
COMMENT ON COLUMN system_settings.is_encrypted IS 'Indica si el valor está encriptado';

-- =====================================================
-- VERIFICACIONES FINALES
-- =====================================================

-- Verificar que todas las tablas fueron creadas
DO $$
BEGIN
  ASSERT (SELECT COUNT(*) FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'vps_plans', 'vps_services', 'support_tickets', 'invoices', 'system_settings')) = 6,
         'No todas las tablas fueron creadas correctamente';
  
  ASSERT (SELECT COUNT(*) FROM vps_plans WHERE is_active = true) >= 3,
         'No se insertaron suficientes planes VPS';
         
  ASSERT (SELECT COUNT(*) FROM system_settings) >= 30,
         'No se insertó suficiente configuración del sistema';
  
  RAISE NOTICE 'Schema creado correctamente: 6 tablas, % planes VPS, % configuraciones', 
    (SELECT COUNT(*) FROM vps_plans),
    (SELECT COUNT(*) FROM system_settings);
END $$;
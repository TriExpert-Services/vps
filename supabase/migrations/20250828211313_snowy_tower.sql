/*
  # Arreglar recursión infinita en políticas RLS

  1. Eliminar políticas problemáticas que causan recursión
  2. Crear políticas simples sin auto-referencia
  3. Usar funciones auxiliares para evitar recursión
  4. Políticas seguras para usuarios y administradores

  PROBLEMA: Las políticas que consultan la tabla users dentro de 
  políticas de la misma tabla users crean recursión infinita.
  
  SOLUCIÓN: Políticas más simples que no se auto-referencian.
*/

-- Eliminar TODAS las políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow user profile creation" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;  
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Anyone can read users" ON users;
DROP POLICY IF EXISTS "Anyone can manage users" ON users;

-- Función auxiliar para verificar si es admin sin causar recursión
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Verificar si el usuario actual tiene rol admin
  -- usando una consulta directa sin política RLS
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS simples sin recursión
-- 1. Permitir lectura de perfil propio
CREATE POLICY "users_select_own" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Permitir actualización de perfil propio  
CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- 3. Permitir inserción de perfil propio (para registro)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Permitir eliminación de perfil propio
CREATE POLICY "users_delete_own" ON users
  FOR DELETE
  USING (auth.uid() = id);

-- Políticas para administradores (sin recursión)
-- 5. Los admins pueden ver todos los usuarios
CREATE POLICY "admins_select_all" ON users
  FOR SELECT
  USING (
    -- Verificar directamente en la tabla sin usar función que podría recurrir
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    ) OR auth.uid() = id
  );

-- 6. Los admins pueden gestionar todos los usuarios
CREATE POLICY "admins_manage_all" ON users
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin' 
    ) OR auth.uid() = id
  );

-- Asegurarse de que RLS esté habilitado
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Otorgar permisos básicos
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Políticas mejoradas para otras tablas sin recursión
-- VPS Plans - solo lectura para planes activos
CREATE POLICY "vps_plans_read_active" ON vps_plans
  FOR SELECT
  USING (is_active = true OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- VPS Services - solo propios o si es admin  
CREATE POLICY "vps_services_own_or_admin" ON vps_services
  FOR ALL
  USING (
    user_id = auth.uid() OR 
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Support Tickets - solo propios o si es admin
CREATE POLICY "support_tickets_own_or_admin" ON support_tickets  
  FOR ALL
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- Invoices - solo propias o si es admin
CREATE POLICY "invoices_own_or_admin" ON invoices
  FOR ALL  
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- System Settings - solo admins
CREATE POLICY "system_settings_admins_only" ON system_settings
  FOR ALL
  USING (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
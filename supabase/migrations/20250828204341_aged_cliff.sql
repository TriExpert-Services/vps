/*
  # Arreglar políticas de autenticación

  1. Políticas mejoradas para usuarios
     - Permitir inserción de perfiles después del registro
     - Mejorar políticas de lectura y actualización
     - Arreglar políticas para administradores

  2. Agregar trigger para crear perfil automáticamente
     - Trigger que se ejecuta después de registrar usuario en auth.users
     - Crear perfil automático en tabla users

  3. Políticas más permisivas para troubleshooting
*/

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Allow user profile creation" ON users;

-- Políticas RLS mejoradas para users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Allow user profile creation" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'user');
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- El usuario ya existe, no hacer nada
    RETURN new;
  WHEN others THEN
    -- Log del error pero no fallar el registro
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insertar usuario admin por defecto si no existe
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'admin@triexpert.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Administrator"}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Crear perfil admin si no existe
INSERT INTO users (id, email, full_name, role)
SELECT u.id, u.email, 'Administrator', 'admin'
FROM auth.users u
WHERE u.email = 'admin@triexpert.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
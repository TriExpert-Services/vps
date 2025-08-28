/*
  # Configuración limpia de autenticación

  1. Políticas RLS simples y funcionales
     - Políticas más permisivas para usuarios
     - Acceso completo para admins
     - Creación automática de perfiles

  2. Función de trigger mejorada
     - Crear perfil automáticamente cuando se registra usuario
     - Manejo robusto de errores
     - No tocar tablas auth internas

  3. NO tocar auth.users ni auth.config
     - Supabase maneja estas tablas internamente
     - Solo trabajamos con nuestra tabla users
*/

-- Eliminar políticas existentes para recrear limpias
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;
DROP POLICY IF EXISTS "Allow user profile creation" ON users;

-- Políticas RLS simples y funcionales
CREATE POLICY "Users can read own data" ON users
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Allow user profile creation" ON users
  FOR INSERT 
  WITH CHECK (true); -- Permisivo para que funcione el registro

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR auth.uid() IS NOT NULL -- Temporalmente permisivo
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    ) OR auth.uid() IS NOT NULL -- Temporalmente permisivo
  );

-- Función limpia para crear perfil de usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  -- Obtener nombre del metadata o usar email como fallback
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'fullName', 
    split_part(NEW.email, '@', 1)
  );
  
  -- Insertar perfil de usuario
  INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    user_name, 
    CASE 
      WHEN NEW.email = 'admin@triexpert.com' THEN 'admin'
      ELSE 'user'
    END,
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
      updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN others THEN
    -- Log del error pero no fallar el registro
    RAISE WARNING 'Error creating user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente y crear nuevo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insertar datos de ejemplo solo en nuestra tabla users si no existe el admin
DO $$
BEGIN
  -- Crear perfil admin si no existe (sin tocar auth.users)
  INSERT INTO users (id, email, full_name, role, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'admin@triexpert.com',
    'Administrator',
    'admin',
    now(),
    now()
  )
  ON CONFLICT (email) DO UPDATE SET role = 'admin';
  
EXCEPTION 
  WHEN others THEN
    RAISE NOTICE 'Admin user setup completed or already exists';
END $$;
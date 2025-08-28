/*
  # Arreglar roles de administrador

  1. Actualizar usuarios existentes con roles correctos
  2. Asegurar que ciertos emails tengan rol admin
  3. Arreglar el trigger para detectar admins automáticamente
  4. Crear perfiles faltantes para usuarios de auth.users

  Emails que deben ser admin:
  - support@triexpertservice.com
  - admin@triexpertservice.com
  - admin@triexpert.com
*/

-- Primero, crear perfiles para usuarios de auth.users que no tengan perfil
INSERT INTO public.users (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'fullName',
    split_part(au.email, '@', 1)
  ) as full_name,
  CASE 
    WHEN au.email IN (
      'support@triexpertservice.com',
      'admin@triexpertservice.com', 
      'admin@triexpert.com'
    ) THEN 'admin'
    ELSE 'user'
  END as role,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- Actualizar roles de usuarios existentes que deberían ser admin
UPDATE public.users 
SET 
  role = 'admin',
  updated_at = now()
WHERE email IN (
  'support@triexpertservice.com',
  'admin@triexpertservice.com',
  'admin@triexpert.com'
) AND role != 'admin';

-- Mejorar el trigger para detectar admins automáticamente
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

-- Verificar que el trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Log de los cambios realizados
DO $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.users WHERE role = 'admin';
  RAISE NOTICE 'Roles actualizados. Total admins: %', admin_count;
END $$;
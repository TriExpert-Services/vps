import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function TestAuth() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { user } = useAuth();

  const createTestUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@triexpert.com',
        password: 'test123456',
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });
      
      if (error) {
        setTestResult(`❌ Error creando usuario: ${error.message}`);
      } else {
        setTestResult(`✅ Usuario de prueba creado: test@triexpert.com / test123456`);
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('auth.config')
        .select('*')
        .limit(1);
      
      if (error) {
        setTestResult(`ℹ️ No se puede acceder a config: ${error.message}`);
      } else {
        setTestResult(`✅ Config accesible: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      setTestResult(`❌ Error config: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Primero verificar configuración
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        setTestResult(`❌ Variables de EasyPanel faltantes:

URL: ${url ? '✅ Configurada' : '❌ NO CONFIGURADA EN EASYPANEL'}
KEY: ${key ? '✅ Configurada' : '❌ NO CONFIGURADA EN EASYPANEL'}

🔧 Para arreglar:
1. Ve a EasyPanel → tu app → Settings
2. Configura las Environment Variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
3. Redeploy la aplicación`);
        return;
      }
      
      // Verificar si la key parece válida (JWT format)
      const keyLooksValid = key.startsWith('eyJ') && key.split('.').length === 3;
      if (!keyLooksValid) {
        setTestResult(`❌ VITE_SUPABASE_ANON_KEY parece inválida:

Recibida: ${key.substring(0, 50)}...

❌ No parece ser un JWT válido (debe empezar con 'eyJ')

🔧 Para arreglar:
1. Ve a Supabase Dashboard → Settings → API
2. Copia la 'anon public' key COMPLETA  
3. Pégala en EasyPanel sin espacios extra`);
        return;
      }
      
      setTestResult(`🔧 Probando conexión con EasyPanel vars...
URL: ${url.substring(0, 30)}...
KEY: ${key.substring(0, 20)}...${key.substring(key.length - 10)}

⏳ Conectando...`);
      
      const { data, error } = await supabase.from('users').select('*').limit(1);
      if (error) {
        setTestResult(`❌ Error de conexión desde EasyPanel:

Error: ${error.message}
Código: ${error.code || 'N/A'}
Hint: ${error.hint || 'N/A'}
Details: ${error.details || 'N/A'}

🔧 Posibles causas:
1. ANON_KEY incorrecta en EasyPanel
2. URL de Supabase incorrecta
3. Políticas RLS muy restrictivas
4. Supabase project pausado/inactivo`);
      } else {
        setTestResult(`✅ Conexión exitosa desde EasyPanel!

✅ Variables configuradas correctamente
✅ Supabase responde OK  
✅ Usuarios encontrados: ${data?.length || 0}

🎉 Todo funciona perfecto!`);
      }
    } catch (err) {
      setTestResult(`❌ Error crítico desde EasyPanel:

${err}

🔧 Checklist para EasyPanel:
1. ✅ Variables configuradas en EasyPanel?
2. ✅ App re-deployed después de cambiar vars?
3. ✅ No hay espacios extra en las keys?
4. ✅ Supabase project activo?`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser }, error } = await supabase.auth.getUser();
      if (error) {
        setTestResult(`❌ Error de autenticación: ${error.message}`);
      } else if (currentUser) {
        setTestResult(`✅ Usuario autenticado: ${currentUser.email}`);
      } else {
        setTestResult('ℹ️ No hay usuario autenticado');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testUserProfile = async () => {
    setLoading(true);
    try {
      // Primero probar una consulta simple a la tabla users
      const { data: allUsers, error: listError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (listError) {
        setTestResult(`❌ Error listando usuarios: ${listError.message}`);
        setLoading(false);
        return;
      }

      setTestResult(`✅ Usuarios encontrados: ${allUsers?.length || 0}`);

      const { data: { user: currentUser }, error: currentError } = await supabase.auth.getUser();
      if (currentError) {
        setTestResult(`❌ Error auth: ${currentError.message}`);
        return;
      }
      
      if (!currentUser) {
        setTestResult('❌ No hay usuario autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        setTestResult(`❌ Error obteniendo perfil: ${error.message}`);
      } else if (data) {
        setTestResult(`✅ Perfil encontrado: ${data.full_name} (${data.role})`);
      } else {
        setTestResult('❌ Perfil no encontrado en tabla users');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async () => {
    setLoading(true);
    try {
      // Primero verificar conexión básica
      const { data: { user: currentUser }, error: currentError } = await supabase.auth.getUser();
      if (currentError) {
        setTestResult(`❌ Error auth: ${currentError.message}`);
        return;
      }
      
      if (!currentUser) {
        setTestResult('❌ No hay usuario autenticado');
        return;
      }

      setTestResult(`✅ Usuario autenticado: ${currentUser.email}`);

      // Intentar obtener perfil
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          setTestResult(`❌ Error obteniendo perfil: ${error.message}\nEmail del usuario: ${currentUser.email}\nID: ${currentUser.id}`);
        } else if (data) {
          setTestResult(`✅ Usuario: ${data.email} | Rol: ${data.role} | Nombre: ${data.full_name}`);
        } else {
          setTestResult('❌ Perfil no encontrado');
        }
      } catch (profileError) {
        setTestResult(`❌ Error de perfil: ${profileError}\nUsuario existe en auth: ${currentUser.email}`);
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const createAdminUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@triexpert.com',
        password: 'admin123456',
        options: {
          data: {
            full_name: 'Administrator'
          }
        }
      });
      
      if (error) {
        setTestResult(`❌ Error creando admin: ${error.message}`);
      } else {
        setTestResult(`✅ Admin creado: admin@triexpert.com / admin123456`);
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const forceRefreshProfile = async () => {
    setLoading(true);
    try {
      const { refreshProfile } = useAuth();
      await refreshProfile();
      setTestResult('✅ Perfil actualizado, revisa la esquina inferior');
    } catch (error) {
      setTestResult(`❌ Error actualizando perfil: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const signOutTest = async () => {
    const { signOut } = useAuth();
    await signOut();
    setTestResult('✅ Sesión cerrada');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="text-sm font-semibold mb-2">🔧 Debug Auth</h3>
      <div className="space-y-2">
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded mb-1"
        >
          🔗 Test Connection & Config
        </button>
        
        <button
          onClick={() => {
            const url = import.meta.env.VITE_SUPABASE_URL;
            const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
            setTestResult(`📋 Environment Variables:\n\nVITE_SUPABASE_URL:\n${url || 'NOT SET'}\n\nVITE_SUPABASE_ANON_KEY:\n${key ? key.substring(0, 50) + '...' : 'NOT SET'}`);
          }}
          className="w-full text-xs bg-gray-500 text-white px-2 py-1 rounded mb-1"
        >
          📋 Show Environment
        </button>
        <button
          onClick={testAuth}
          disabled={loading}
          className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded"
        >
          Test Auth
        </button>
        <button
          onClick={checkUserRole}
          disabled={loading}
          className="w-full text-xs bg-purple-500 text-white px-2 py-1 rounded mb-1"
        >
          Check Role + Profile
        </button>
        <button
          onClick={forceRefreshProfile}
          disabled={loading}
          className="w-full text-xs bg-indigo-500 text-white px-2 py-1 rounded mb-1"
        >
          Refresh Profile
        </button>
        <button
          onClick={signOutTest}
          disabled={loading}
          className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Sign Out
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-xs bg-gray-500 text-white px-2 py-1 rounded"
        >
          {showAdvanced ? 'Ocultar' : 'Mostrar'} Avanzado
        </button>
        {showAdvanced && (
          <>
            <button
              onClick={createTestUser}
              disabled={loading}
              className="w-full text-xs bg-orange-500 text-white px-2 py-1 rounded"
            >
              Crear Usuario Test
            </button>
            <button
              onClick={createAdminUser}
              disabled={loading}
              className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded"
            >
              Crear Admin
            </button>
            <button
              onClick={checkAuthConfig}
              disabled={loading}
              className="w-full text-xs bg-pink-500 text-white px-2 py-1 rounded"
            >
              Check Auth Config
            </button>
          </>
        )}
      </div>
      {testResult && (
        <div className="mt-2 p-2 text-xs bg-gray-100 rounded max-h-32 overflow-y-auto">
          {testResult}
        </div>
      )}
      {user && (
        <div className="mt-2 text-xs text-gray-600">
          <strong>Current:</strong> {user.email} ({user.role})
        </div>
      )}
    </div>
  );
}
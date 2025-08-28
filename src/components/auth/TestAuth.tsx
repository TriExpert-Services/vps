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
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        setTestResult(`Error de conexión: ${error.message}`);
      } else {
        setTestResult('✅ Conexión a Supabase exitosa');
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error) {
        setTestResult(`❌ Error de autenticación: ${error.message}`);
      } else if (authUser) {
        setTestResult(`✅ Usuario autenticado: ${authUser.email}`);
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
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        setTestResult(`❌ Error auth: ${authError.message}`);
        return;
      }
      
      if (!authUser) {
        setTestResult('❌ No hay usuario autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
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

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm z-50">
      <h3 className="text-sm font-semibold mb-2">🔧 Debug Auth</h3>
      <div className="space-y-2">
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Test DB Connection
        </button>
        <button
          onClick={testAuth}
          disabled={loading}
          className="w-full text-xs bg-green-500 text-white px-2 py-1 rounded"
        >
          Test Auth
        </button>
        <button
          onClick={testUserProfile}
          disabled={loading}
          className="w-full text-xs bg-purple-500 text-white px-2 py-1 rounded"
        >
          Test User Profile
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
          Current: {user.email} ({user.role})
        </div>
      )}
    </div>
  );
}
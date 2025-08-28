import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function TestAuth() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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
      const { data: { user: authUser } } = await supabase.auth.getUser();
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

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm">
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
      </div>
      {testResult && (
        <div className="mt-2 p-2 text-xs bg-gray-100 rounded">
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
import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { ProxmoxService } from '../../services/ProxmoxService';
import { supabase } from '../../lib/supabase';

interface SystemHealth {
  proxmox: 'online' | 'offline' | 'warning';
  database: 'online' | 'offline' | 'warning';  
  api: 'online' | 'offline' | 'warning';
  backup: 'running' | 'idle' | 'error';
}

export default function SystemHealthCard() {
  const [health, setHealth] = useState<SystemHealth>({
    proxmox: 'online',
    database: 'online', 
    api: 'online',
    backup: 'idle'
  });
  const [lastCheck, setLastCheck] = useState(new Date());
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkSystemHealth();
    // Check every 5 minutes
    const interval = setInterval(checkSystemHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSystemHealth = async () => {
    setChecking(true);
    
    try {
      // Check Proxmox
      const nodes = await ProxmoxService.getNodes();
      const proxmoxStatus = nodes.length > 0 ? 'online' : 'offline';

      // Check Database (Supabase)
      const { error: dbError } = await supabase.from('users').select('count').limit(1);
      const databaseStatus = dbError ? 'offline' : 'online';

      setHealth({
        proxmox: proxmoxStatus,
        database: databaseStatus,
        api: 'online', // API is online if we can execute this
        backup: 'idle' // Mock status
      });

      setLastCheck(new Date());
    } catch (error) {
      console.error('Error checking system health:', error);
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'idle':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'offline':
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'idle':
        return 'text-green-600 bg-green-50';
      case 'warning':
      case 'running':
        return 'text-yellow-600 bg-yellow-50';
      case 'offline':
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (component: string, status: string) => {
    if (component === 'backup') {
      switch (status) {
        case 'running': return 'Ejecutándose';
        case 'idle': return 'En Espera';
        case 'error': return 'Error';
        default: return 'Desconocido';
      }
    }
    
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline'; 
      case 'warning': return 'Advertencia';
      default: return 'Desconocido';
    }
  };

  const systemComponents = [
    { key: 'proxmox', name: 'Proxmox Cluster', status: health.proxmox },
    { key: 'database', name: 'Base de Datos', status: health.database },
    { key: 'api', name: 'API Gateway', status: health.api },
    { key: 'backup', name: 'Sistema de Backup', status: health.backup }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Estado del Sistema</h2>
        <button
          onClick={checkSystemHealth}
          disabled={checking}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <RefreshCw className={`h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-4">
        {systemComponents.map((component) => (
          <div key={component.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
            <div className="flex items-center space-x-3">
              {getStatusIcon(component.status)}
              <span className="font-medium text-gray-900">{component.name}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(component.status)}`}>
              {getStatusText(component.key, component.status)}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        Última verificación: {lastCheck.toLocaleTimeString('es-ES')}
      </div>
    </div>
  );
}
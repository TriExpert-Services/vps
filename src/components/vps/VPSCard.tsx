import React, { useState } from 'react';
import { 
  Server, 
  Play, 
  Square, 
  RotateCcw, 
  Settings, 
  Activity,
  Calendar,
  MapPin
} from 'lucide-react';
import { VPSService } from '../../types';

interface VPSCardProps {
  vps: VPSService;
}

export default function VPSCard({ vps }: VPSCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'stopped': return 'text-red-600 bg-red-50';
      case 'creating': return 'text-yellow-600 bg-yellow-50';
      case 'suspended': return 'text-orange-600 bg-orange-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Ejecutándose';
      case 'stopped': return 'Detenido';
      case 'creating': return 'Creando...';
      case 'suspended': return 'Suspendido';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  const handleVPSAction = async (action: string) => {
    setIsLoading(true);
    try {
      // Aquí se integraría con la API de Proxmox
      console.log(`Performing ${action} on VPS ${vps.id}`);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Implementar integración real con Proxmox
    } catch (error) {
      console.error('Error performing VPS action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Server className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{vps.name}</h3>
            <p className="text-sm text-gray-500">VMID: {vps.proxmox_vmid}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vps.status)}`}>
          {getStatusText(vps.status)}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {vps.ip_address && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">IP Address:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{vps.ip_address}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Nodo:
          </span>
          <span className="font-medium">{vps.node_name}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Expira:
          </span>
          <span className="font-medium">
            {new Date(vps.expires_at).toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleVPSAction('start')}
          disabled={isLoading || vps.status === 'running'}
          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-sm"
        >
          <Play className="h-4 w-4 mr-1" />
          Iniciar
        </button>
        
        <button
          onClick={() => handleVPSAction('stop')}
          disabled={isLoading || vps.status === 'stopped'}
          className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-sm"
        >
          <Square className="h-4 w-4 mr-1" />
          Detener
        </button>
        
        <button
          onClick={() => handleVPSAction('restart')}
          disabled={isLoading}
          className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center text-sm"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reiniciar
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center">
          <Settings className="h-4 w-4 mr-1" />
          Configuración Avanzada
        </button>
      </div>
    </div>
  );
}
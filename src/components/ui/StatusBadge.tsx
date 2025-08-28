import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle, Loader } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline';
}

export default function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
      case 'active':
      case 'paid':
      case 'online':
        return {
          icon: CheckCircle,
          text: 'Activo',
          colors: variant === 'outline' 
            ? 'text-green-600 border-green-200 bg-transparent' 
            : 'text-green-700 bg-green-50'
        };
      
      case 'stopped':
      case 'inactive': 
      case 'offline':
        return {
          icon: XCircle,
          text: 'Detenido',
          colors: variant === 'outline'
            ? 'text-red-600 border-red-200 bg-transparent'
            : 'text-red-700 bg-red-50'
        };
      
      case 'pending':
      case 'creating':
      case 'processing':
        return {
          icon: Loader,
          text: 'Procesando',
          colors: variant === 'outline'
            ? 'text-blue-600 border-blue-200 bg-transparent'
            : 'text-blue-700 bg-blue-50'
        };
      
      case 'suspended':
      case 'warning':
      case 'overdue':
        return {
          icon: AlertTriangle,
          text: 'Advertencia',
          colors: variant === 'outline'
            ? 'text-yellow-600 border-yellow-200 bg-transparent'
            : 'text-yellow-700 bg-yellow-50'
        };
      
      default:
        return {
          icon: Clock,
          text: 'Desconocido',
          colors: variant === 'outline'
            ? 'text-gray-600 border-gray-200 bg-transparent'
            : 'text-gray-700 bg-gray-50'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold
      ${variant === 'outline' ? 'border' : ''}
      ${config.colors}
    `}>
      <Icon className="h-3 w-3" />
      <span>{config.text}</span>
    </span>
  );
}
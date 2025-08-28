import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  CreditCard, 
  Ticket,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { VPSService } from '../../types';
import VPSCard from '../../components/vps/VPSCard';
import { supabase } from '../../lib/supabase';
import { useVPS } from '../../hooks/useVPS';

export default function UserDashboard() {
  const { user } = useAuth();
  const { vpsServices, loading } = useVPS(user?.id);

  const stats = [
    {
      title: 'VPS Activos',
      value: vpsServices.filter(vps => vps.status === 'running').length.toString(),
      icon: Server,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Total VPS',
      value: vpsServices.length.toString(),
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Facturas Pendientes',
      value: '0',
      icon: CreditCard,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      title: 'Tickets Abiertos',
      value: '0',
      icon: Ticket,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido, {user?.full_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus servicios VPS desde tu panel de control personalizado
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* VPS Services */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Mis Servicios VPS</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Contratar VPS
              </button>
            </div>
          </div>

          {vpsServices.length === 0 ? (
            <div className="p-12 text-center">
              <Server className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes servicios VPS activos</h3>
              <p className="text-gray-600 mb-6">Comienza contratando tu primer servidor virtual</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Explorar Planes
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vpsServices.map((vps) => (
                  <VPSCard key={vps.id} vps={vps} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Monitoreo</h3>
            </div>
            <p className="text-gray-600 mb-4">Ve el rendimiento en tiempo real de tus VPS</p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Ver Estadísticas →
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <CreditCard className="h-8 w-8 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Facturación</h3>
            </div>
            <p className="text-gray-600 mb-4">Gestiona tus pagos y facturas</p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Ver Facturas →
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <Ticket className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Soporte</h3>
            </div>
            <p className="text-gray-600 mb-4">¿Necesitas ayuda? Contacta a nuestro equipo</p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Crear Ticket →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
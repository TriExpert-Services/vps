import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Server, 
  TrendingUp, 
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalVPS: 0,
    monthlyRevenue: 0,
    activeTickets: 0,
    systemHealth: 'good'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data for now - would integrate with Supabase
    setDashboardData({
      totalUsers: 1250,
      totalVPS: 892,
      monthlyRevenue: 24750,
      activeTickets: 12,
      systemHealth: 'good'
    });
    setLoading(false);
  };

  const stats = [
    {
      title: 'Usuarios Totales',
      value: dashboardData.totalUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+12%'
    },
    {
      title: 'VPS Activos',
      value: dashboardData.totalVPS.toLocaleString(),
      icon: Server,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: '+8%'
    },
    {
      title: 'Ingresos Mensuales',
      value: `$${dashboardData.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      change: '+23%'
    },
    {
      title: 'Tickets Activos',
      value: dashboardData.activeTickets.toString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      change: '-5%'
    }
  ];

  const recentActivity = [
    { 
      type: 'new_user', 
      message: 'Nuevo usuario registrado: john.doe@email.com',
      time: '5 min ago',
      icon: Users
    },
    { 
      type: 'vps_created', 
      message: 'VPS creado para usuario: maria.garcia@email.com',
      time: '15 min ago',
      icon: Server
    },
    { 
      type: 'ticket_closed', 
      message: 'Ticket #1234 resuelto por el equipo de soporte',
      time: '1 hora ago',
      icon: CheckCircle
    },
    { 
      type: 'payment_received', 
      message: 'Pago recibido: $19.99 - VPS Professional',
      time: '2 horas ago',
      icon: DollarSign
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
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido al centro de control de TriExpert Services
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Estado del Sistema</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Proxmox Cluster</span>
                  </div>
                  <span className="text-green-600 text-sm font-semibold">Online</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Base de Datos</span>
                  </div>
                  <span className="text-green-600 text-sm font-semibold">Operativo</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">API Gateway</span>
                  </div>
                  <span className="text-green-600 text-sm font-semibold">Activo</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">Backup System</span>
                  </div>
                  <span className="text-yellow-600 text-sm font-semibold">Ejecutando</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <activity.icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                  Ver Todo el Historial →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Gestionar Usuarios</h3>
            </div>
            <p className="text-gray-600 mb-4">Ver y administrar cuentas de usuarios</p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Ir a Usuarios →
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <Server className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Gestionar VPS</h3>
            </div>
            <p className="text-gray-600 mb-4">Administrar servicios VPS y recursos</p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Ir a VPS →
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">Ver reportes detallados y métricas</p>
            <button className="text-blue-600 hover:text-blue-700 font-semibold">
              Ver Reportes →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Search, 
  Filter,
  Plus,
  Play,
  Square,
  RotateCcw,
  Settings,
  Trash2,
  Activity,
  AlertCircle
} from 'lucide-react';
import { VPSService } from '../../types';

export default function AdminVPS() {
  const [vpsServices, setVpsServices] = useState<VPSService[]>([]);
  const [filteredServices, setFilteredServices] = useState<VPSService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [nodeFilter, setNodeFilter] = useState('all');

  useEffect(() => {
    fetchVPSServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [vpsServices, searchTerm, statusFilter, nodeFilter]);

  const fetchVPSServices = async () => {
    // Mock data for now - would integrate with Supabase
    const mockServices: VPSService[] = [
      {
        id: 'vps-1',
        user_id: 'user-1',
        plan_id: 'plan-2',
        proxmox_vmid: 101,
        name: 'Web Server Production',
        status: 'running',
        ip_address: '192.168.1.101',
        root_password: 'encrypted_password',
        node_name: 'proxmox-node-1',
        created_at: '2025-01-01T00:00:00Z',
        expires_at: '2025-02-01T00:00:00Z'
      },
      {
        id: 'vps-2',
        user_id: 'user-2',
        plan_id: 'plan-1',
        proxmox_vmid: 102,
        name: 'Development Environment',
        status: 'stopped',
        ip_address: '192.168.1.102',
        root_password: 'encrypted_password',
        node_name: 'proxmox-node-2',
        created_at: '2025-01-05T00:00:00Z',
        expires_at: '2025-02-05T00:00:00Z'
      }
    ];
    
    setVpsServices(mockServices);
    setLoading(false);
  };

  const filterServices = () => {
    let filtered = vpsServices;

    if (searchTerm) {
      filtered = filtered.filter(vps =>
        vps.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vps.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vps.proxmox_vmid.toString().includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vps => vps.status === statusFilter);
    }

    if (nodeFilter !== 'all') {
      filtered = filtered.filter(vps => vps.node_name === nodeFilter);
    }

    setFilteredServices(filtered);
  };

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

  const stats = [
    {
      title: 'Total VPS',
      value: vpsServices.length.toString(),
      icon: Server,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'VPS Activos',
      value: vpsServices.filter(vps => vps.status === 'running').length.toString(),
      icon: Activity,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'VPS Detenidos',
      value: vpsServices.filter(vps => vps.status === 'stopped').length.toString(),
      icon: Square,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      title: 'Con Problemas',
      value: vpsServices.filter(vps => vps.status === 'error').length.toString(),
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de VPS</h1>
              <p className="text-gray-600 mt-2">
                Administra todos los servicios VPS del sistema
              </p>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Crear VPS
            </button>
          </div>
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, IP o VMID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">Todos los estados</option>
                <option value="running">Ejecutándose</option>
                <option value="stopped">Detenido</option>
                <option value="creating">Creando</option>
                <option value="suspended">Suspendido</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <select
                value={nodeFilter}
                onChange={(e) => setNodeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="all">Todos los nodos</option>
                <option value="proxmox-node-1">Proxmox Node 1</option>
                <option value="proxmox-node-2">Proxmox Node 2</option>
                <option value="proxmox-node-3">Proxmox Node 3</option>
              </select>
            </div>
          </div>
        </div>

        {/* VPS Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Servicios VPS ({filteredServices.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VPS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nodo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expira
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices.map((vps) => (
                  <tr key={vps.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Server className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vps.name}</div>
                          <div className="text-sm text-gray-500">VMID: {vps.proxmox_vmid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vps.user_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vps.status)}`}>
                        {getStatusText(vps.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">{vps.ip_address}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vps.node_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vps.expires_at).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button className="text-green-600 hover:text-green-700 p-1">
                          <Play className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-700 p-1">
                          <Square className="h-4 w-4" />
                        </button>
                        <button className="text-yellow-600 hover:text-yellow-700 p-1">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 p-1">
                          <Settings className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-700 p-1">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
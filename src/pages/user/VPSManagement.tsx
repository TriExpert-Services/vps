import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { VPSService } from '../../types';
import { supabase } from '../../lib/supabase';
import VPSCard from '../../components/vps/VPSCard';
import { Server, Plus, Filter, Search } from 'lucide-react';

export default function VPSManagement() {
  const { user } = useAuth();
  const [vpsServices, setVpsServices] = useState<VPSService[]>([]);
  const [filteredServices, setFilteredServices] = useState<VPSService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchVPSServices();
  }, [user]);

  useEffect(() => {
    filterServices();
  }, [vpsServices, searchTerm, statusFilter]);

  const fetchVPSServices = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vps_services')
        .select(`
          *,
          vps_plans(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVpsServices(data || []);
    } catch (error) {
      console.error('Error fetching VPS services:', error);
    } finally {
      setLoading(false);
    }
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

    setFilteredServices(filtered);
  };

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
                Administra todos tus servidores virtuales desde aquí
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo VPS
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar VPS por nombre, IP o VMID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            
            <div className="lg:w-48">
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
          </div>
        </div>

        {/* VPS Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <Server className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {vpsServices.length === 0 ? 'No tienes servicios VPS' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-600 mb-6">
              {vpsServices.length === 0 
                ? 'Comienza contratando tu primer servidor virtual' 
                : 'Intenta ajustar los filtros de búsqueda'}
            </p>
            {vpsServices.length === 0 && (
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                Explorar Planes
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((vps) => (
              <VPSCard key={vps.id} vps={vps} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
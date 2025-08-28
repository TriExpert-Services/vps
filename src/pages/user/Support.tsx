import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SupportTicket } from '../../types';

export default function Support() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    // Mock data for now - would integrate with Supabase
    const mockTickets: SupportTicket[] = [
      {
        id: '1',
        user_id: user?.id || '',
        vps_service_id: 'vps-1',
        subject: 'Problema con conectividad SSH',
        description: 'No puedo conectarme por SSH a mi VPS desde esta mañana.',
        status: 'in_progress',
        priority: 'high',
        created_at: '2025-01-15T10:30:00Z',
        updated_at: '2025-01-15T14:20:00Z'
      },
      {
        id: '2',
        user_id: user?.id || '',
        subject: 'Solicitud de upgrade de RAM',
        description: 'Me gustaría aumentar la RAM de mi VPS de 4GB a 8GB.',
        status: 'open',
        priority: 'medium',
        created_at: '2025-01-10T09:15:00Z',
        updated_at: '2025-01-10T09:15:00Z'
      }
    ];
    
    setTickets(mockTickets);
    setLoading(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Integrate with Supabase to create ticket
    console.log('Creating ticket:', newTicket);
    
    setNewTicket({ subject: '', description: '', priority: 'medium' });
    setShowCreateTicket(false);
    
    // Refresh tickets
    await fetchTickets();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'closed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-orange-600 bg-orange-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'closed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Abierto';
      case 'in_progress': return 'En Proceso';
      case 'closed': return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              <h1 className="text-3xl font-bold text-gray-900">Centro de Soporte</h1>
              <p className="text-gray-600 mt-2">
                Obtén ayuda de nuestro equipo técnico especializado
              </p>
            </div>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Ticket
            </button>
          </div>
        </div>

        {/* Create Ticket Modal */}
        {showCreateTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Crear Nuevo Ticket</h2>
              
              <form onSubmit={handleCreateTicket} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Describe brevemente el problema"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Describe detalladamente el problema..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Crear Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateTicket(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar tickets por asunto o descripción..."
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
                <option value="open">Abierto</option>
                <option value="in_progress">En Proceso</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Mis Tickets de Soporte</h2>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tickets.length === 0 ? 'No tienes tickets de soporte' : 'No se encontraron resultados'}
              </h3>
              <p className="text-gray-600 mb-6">
                {tickets.length === 0 
                  ? 'Nuestro equipo está listo para ayudarte con cualquier consulta' 
                  : 'Intenta ajustar los filtros de búsqueda'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                          {getPriorityText(ticket.priority)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{ticket.description}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>#{ticket.id}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString('es-ES')}</span>
                        <span>Actualizado: {new Date(ticket.updated_at).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusIcon(ticket.status)}
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
          <div className="text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-blue-200" />
            <h3 className="text-2xl font-semibold mb-2">¿Necesitas ayuda inmediata?</h3>
            <p className="text-blue-100 mb-6">
              Nuestro equipo de soporte está disponible 24/7 para asistirte
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="mailto:soporte@triexpert.com"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-semibold"
              >
                soporte@triexpert.com
              </a>
              <a 
                href="tel:+15551234567"
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200 font-semibold"
              >
                +1 (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
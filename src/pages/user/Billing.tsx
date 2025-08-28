import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Invoice } from '../../types';

export default function Billing() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('invoices');

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const fetchInvoices = async () => {
    // Mock data for now - would integrate with Supabase
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        user_id: user?.id || '',
        vps_service_id: 'vps-1',
        amount: 19.99,
        currency: 'USD',
        status: 'paid',
        due_date: '2025-02-01',
        paid_at: '2025-01-05',
        created_at: '2025-01-01'
      },
      {
        id: '2',
        user_id: user?.id || '',
        vps_service_id: 'vps-1',
        amount: 19.99,
        currency: 'USD',
        status: 'pending',
        due_date: '2025-03-01',
        created_at: '2025-02-01'
      }
    ];
    
    setInvoices(mockInvoices);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencida';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Centro de Facturación</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus facturas, métodos de pago y historial de transacciones
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Facturas
              </button>
              <button
                onClick={() => setActiveTab('payment-methods')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'payment-methods'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Métodos de Pago
              </button>
              <button
                onClick={() => setActiveTab('billing-info')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === 'billing-info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Información de Facturación
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'invoices' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Historial de Facturas</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Descargar Todas
                  </button>
                </div>

                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Factura #{invoice.id}</h3>
                            <p className="text-sm text-gray-600">
                              Servicio VPS - {new Date(invoice.created_at).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              ${invoice.amount}
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(invoice.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                                {getStatusText(invoice.status)}
                              </span>
                            </div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {invoice.status === 'pending' && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                            Pagar Ahora
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payment-methods' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Métodos de Pago</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Agregar Método
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay métodos de pago</h3>
                  <p className="text-gray-600 mb-4">Agrega una tarjeta de crédito o débito para pagos automáticos</p>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    Agregar Tarjeta
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'billing-info' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de Facturación</h2>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={user?.full_name || ''}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Nombre completo"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Dirección de facturación"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Ciudad"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado/Provincia
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Estado"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="ZIP"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                      <option value="">Seleccionar país</option>
                      <option value="US">Estados Unidos</option>
                      <option value="CA">Canadá</option>
                      <option value="MX">México</option>
                      <option value="ES">España</option>
                      <option value="AR">Argentina</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Actualizar Información
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
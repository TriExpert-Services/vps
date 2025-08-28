import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Server, 
  Mail, 
  Shield,
  Globe,
  Database,
  Save,
  TestTube
} from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('proxmox');
  const [settings, setSettings] = useState({
    proxmox: {
      host: 'https://proxmox.triexpert.local:8006',
      username: 'root@pam',
      password: '',
      defaultNode: 'proxmox-node-1'
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@triexpert.com',
      fromName: 'TriExpert Services'
    },
    n8n: {
      webhookUrl: 'https://n8n.triexpert.com/webhook',
      apiKey: '',
      enabled: true
    },
    billing: {
      currency: 'USD',
      taxRate: '8.5',
      invoicePrefix: 'TRI',
      paymentGateway: 'stripe'
    }
  });

  const handleSettingChange = (category: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    // TODO: Save to Supabase or backend
    console.log('Saving settings:', settings);
    alert('Configuración guardada exitosamente');
  };

  const testProxmoxConnection = async () => {
    // TODO: Test Proxmox API connection
    console.log('Testing Proxmox connection...');
    alert('Conexión exitosa con Proxmox');
  };

  const testEmailSettings = async () => {
    // TODO: Test email settings
    console.log('Testing email settings...');
    alert('Email de prueba enviado exitosamente');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="text-gray-600 mt-2">
            Administra las configuraciones globales de la plataforma
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'proxmox', label: 'Proxmox', icon: Server },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'n8n', label: 'n8n Integration', icon: Globe },
                { id: 'billing', label: 'Facturación', icon: Database }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'proxmox' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Configuración de Proxmox</h2>
                  <button
                    onClick={testProxmoxConnection}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Probar Conexión
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Host Proxmox
                    </label>
                    <input
                      type="url"
                      value={settings.proxmox.host}
                      onChange={(e) => handleSettingChange('proxmox', 'host', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="https://proxmox.server.com:8006"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={settings.proxmox.username}
                      onChange={(e) => handleSettingChange('proxmox', 'username', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="root@pam"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      value={settings.proxmox.password}
                      onChange={(e) => handleSettingChange('proxmox', 'password', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Contraseña del usuario Proxmox"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nodo por Defecto
                    </label>
                    <select
                      value={settings.proxmox.defaultNode}
                      onChange={(e) => handleSettingChange('proxmox', 'defaultNode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="proxmox-node-1">Proxmox Node 1</option>
                      <option value="proxmox-node-2">Proxmox Node 2</option>
                      <option value="proxmox-node-3">Proxmox Node 3</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Configuración de Email</h2>
                  <button
                    onClick={testEmailSettings}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Enviar Prueba
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servidor SMTP
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => handleSettingChange('email', 'smtpHost', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puerto SMTP
                    </label>
                    <input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => handleSettingChange('email', 'smtpPort', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario SMTP
                    </label>
                    <input
                      type="email"
                      value={settings.email.smtpUser}
                      onChange={(e) => handleSettingChange('email', 'smtpUser', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña SMTP
                    </label>
                    <input
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => handleSettingChange('email', 'smtpPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Remitente
                    </label>
                    <input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => handleSettingChange('email', 'fromEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Remitente
                    </label>
                    <input
                      type="text"
                      value={settings.email.fromName}
                      onChange={(e) => handleSettingChange('email', 'fromName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'n8n' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Integración con n8n</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Webhook n8n
                    </label>
                    <input
                      type="url"
                      value={settings.n8n.webhookUrl}
                      onChange={(e) => handleSettingChange('n8n', 'webhookUrl', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key n8n
                    </label>
                    <input
                      type="password"
                      value={settings.n8n.apiKey}
                      onChange={(e) => handleSettingChange('n8n', 'apiKey', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.n8n.enabled}
                      onChange={(e) => handleSettingChange('n8n', 'enabled', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-900">
                      Habilitar integración con n8n para automatización de workflows
                    </label>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Webhooks Configurados:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Nuevo usuario registrado → Email de bienvenida</li>
                    <li>• VPS creado → Notificación de activación</li>
                    <li>• Cambio de estado VPS → Email de notificación</li>
                    <li>• Factura generada → Email de facturación</li>
                    <li>• Ticket creado → Notificación al equipo de soporte</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Facturación</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda
                    </label>
                    <select
                      value={settings.billing.currency}
                      onChange={(e) => handleSettingChange('billing', 'currency', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="MXN">MXN - Peso Mexicano</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tasa de Impuesto (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.billing.taxRate}
                      onChange={(e) => handleSettingChange('billing', 'taxRate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prefijo de Factura
                    </label>
                    <input
                      type="text"
                      value={settings.billing.invoicePrefix}
                      onChange={(e) => handleSettingChange('billing', 'invoicePrefix', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gateway de Pago
                    </label>
                    <select
                      value={settings.billing.paymentGateway}
                      onChange={(e) => handleSettingChange('billing', 'paymentGateway', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                      <option value="square">Square</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { X, Server, Plus } from 'lucide-react';
import { VPSPlan } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface VPSCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (planId: string, name: string) => Promise<void>;
}

export default function VPSCreationModal({ isOpen, onClose, onSubmit }: VPSCreationModalProps) {
  const [plans, setPlans] = useState<VPSPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [vpsName, setVpsName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('vps_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !vpsName) return;

    setLoading(true);
    try {
      await onSubmit(selectedPlan, vpsName);
      setVpsName('');
      setSelectedPlan('');
      onClose();
    } catch (error) {
      console.error('Error creating VPS:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Crear Nuevo VPS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del VPS
            </label>
            <input
              type="text"
              value={vpsName}
              onChange={(e) => setVpsName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="ej: Web Server Production"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Seleccionar Plan
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      ${plan.price_monthly}
                      <span className="text-sm font-normal text-gray-600">/mes</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{plan.cpu_cores} vCPU</div>
                      <div>{plan.ram_gb}GB RAM</div>
                      <div>{plan.storage_gb}GB SSD</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || !selectedPlan || !vpsName}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creando VPS...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear VPS
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors duration-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
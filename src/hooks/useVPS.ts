import { useState, useEffect } from 'react';
import { VPSService } from '../types';
import { supabase } from '../lib/supabase';
import { ProxmoxService } from '../services/ProxmoxService';
import { N8NService } from '../services/N8NService';

export function useVPS(userId?: string) {
  const [vpsServices, setVpsServices] = useState<VPSService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchVPSServices();
    }
  }, [userId]);

  const fetchVPSServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vps_services')
        .select(`
          *,
          vps_plans(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVpsServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching VPS services');
    } finally {
      setLoading(false);
    }
  };

  const createVPS = async (planId: string, name: string) => {
    try {
      if (!userId) throw new Error('User ID required');

      setLoading(true);

      // 1. Obtener plan
      const { data: plan, error: planError } = await supabase
        .from('vps_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      // 2. Crear VPS en Proxmox
      const { vmid, password } = await ProxmoxService.createVPS(userId, plan, name);

      // 3. Asignar IP
      const ipAddress = await ProxmoxService.assignIPAddress('proxmox-node-1', vmid);

      // 4. Guardar en base de datos
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mes por defecto

      const { data: newVPS, error: vpsError } = await supabase
        .from('vps_services')
        .insert([
          {
            user_id: userId,
            plan_id: planId,
            proxmox_vmid: vmid,
            name,
            status: 'creating',
            ip_address: ipAddress,
            root_password: password,
            node_name: 'proxmox-node-1',
            expires_at: expiresAt.toISOString()
          }
        ])
        .select()
        .single();

      if (vpsError) throw vpsError;

      // 5. Trigger webhook n8n
      await N8NService.onVPSCreated({
        ...newVPS,
        plan_name: plan.name
      });

      // 6. Actualizar lista local
      await fetchVPSServices();

      return newVPS;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating VPS');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const controlVPS = async (vpsId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      const vps = vpsServices.find(v => v.id === vpsId);
      if (!vps) throw new Error('VPS not found');

      const oldStatus = vps.status;
      let success = false;

      switch (action) {
        case 'start':
          success = await ProxmoxService.startVPS(vps.node_name, vps.proxmox_vmid);
          break;
        case 'stop':
          success = await ProxmoxService.stopVPS(vps.node_name, vps.proxmox_vmid);
          break;
        case 'restart':
          success = await ProxmoxService.restartVPS(vps.node_name, vps.proxmox_vmid);
          break;
      }

      if (success) {
        const newStatus = action === 'stop' ? 'stopped' : 'running';
        
        // Actualizar estado en base de datos
        const { error } = await supabase
          .from('vps_services')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', vpsId);

        if (error) throw error;

        // Trigger webhook n8n para notificación
        await N8NService.onVPSStatusChanged(vps, oldStatus, newStatus);

        // Actualizar lista local
        await fetchVPSServices();
      }

      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error controlling VPS');
      return false;
    }
  };

  return {
    vpsServices,
    loading,
    error,
    fetchVPSServices,
    createVPS,
    controlVPS
  };
}
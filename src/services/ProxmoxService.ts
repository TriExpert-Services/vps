import { proxmoxAPI } from '../lib/proxmox';
import { VPSService, VPSPlan } from '../types';

export class ProxmoxService {
  static async createVPS(
    user_id: string, 
    plan: VPSPlan, 
    name: string, 
    node: string = 'proxmox-node-1'
  ): Promise<{ vmid: number; password: string }> {
    try {
      // Generar VMID único (en producción esto vendría de una secuencia)
      const vmid = Math.floor(Math.random() * 9000) + 1000;
      
      // Generar contraseña root
      const password = this.generateRandomPassword();
      
      // Configuración del VPS basada en el plan
      const vmConfig = {
        ostype: 'l26',
        cores: plan.cpu_cores,
        memory: plan.ram_gb * 1024, // MB
        bootdisk: 'scsi0',
        scsi0: `local-lvm:${plan.storage_gb}`,
        net0: 'virtio,bridge=vmbr0',
        ide2: 'local:cloudinit',
        ciuser: 'root',
        cipassword: password,
        searchdomain: 'triexpert.com',
        nameserver: '8.8.8.8',
        start: 1
      };

      // Crear VM en Proxmox
      await proxmoxAPI.createVM(node, vmid, vmConfig);
      
      // En un entorno real, esperaríamos a que la VM se cree completamente
      // y obtendríamos la IP asignada
      
      return { vmid, password };
    } catch (error) {
      console.error('Error creating VPS in Proxmox:', error);
      throw new Error('Failed to create VPS');
    }
  }

  static async getVPSStatus(node: string, vmid: number) {
    try {
      const response = await proxmoxAPI.getVMStatus(node, vmid);
      return response.data;
    } catch (error) {
      console.error('Error getting VPS status:', error);
      return null;
    }
  }

  static async startVPS(node: string, vmid: number): Promise<boolean> {
    try {
      await proxmoxAPI.startVM(node, vmid);
      return true;
    } catch (error) {
      console.error('Error starting VPS:', error);
      return false;
    }
  }

  static async stopVPS(node: string, vmid: number): Promise<boolean> {
    try {
      await proxmoxAPI.stopVM(node, vmid);
      return true;
    } catch (error) {
      console.error('Error stopping VPS:', error);
      return false;
    }
  }

  static async restartVPS(node: string, vmid: number): Promise<boolean> {
    try {
      await proxmoxAPI.restartVM(node, vmid);
      return true;
    } catch (error) {
      console.error('Error restarting VPS:', error);
      return false;
    }
  }

  static async deleteVPS(node: string, vmid: number): Promise<boolean> {
    try {
      // Primero detener la VM si está corriendo
      await this.stopVPS(node, vmid);
      
      // Esperar un momento antes de eliminar
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Eliminar la VM
      await proxmoxAPI.deleteVM(node, vmid);
      return true;
    } catch (error) {
      console.error('Error deleting VPS:', error);
      return false;
    }
  }

  static async getClusterResources() {
    try {
      const response = await proxmoxAPI.getClusterResources();
      return response.data;
    } catch (error) {
      console.error('Error getting cluster resources:', error);
      return [];
    }
  }

  static async getNodes() {
    try {
      const response = await proxmoxAPI.getNodes();
      return response.data;
    } catch (error) {
      console.error('Error getting nodes:', error);
      return [];
    }
  }

  private static generateRandomPassword(length: number = 16): string {
    const charset = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  static async assignIPAddress(node: string, vmid: number): Promise<string | null> {
    try {
      // En un entorno real, esto consultaría el pool de IPs disponibles
      // y asignaría una IP estática al VPS
      const ipPool = [
        '192.168.1.100',
        '192.168.1.101', 
        '192.168.1.102',
        '192.168.1.103',
        '192.168.1.104'
      ];
      
      // Simular asignación de IP (en producción sería más complejo)
      const availableIP = ipPool[Math.floor(Math.random() * ipPool.length)];
      
      return availableIP;
    } catch (error) {
      console.error('Error assigning IP address:', error);
      return null;
    }
  }
}
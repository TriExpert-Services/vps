interface ProxmoxConfig {
  host: string;
  username: string;
  password: string;
}

class ProxmoxAPI {
  private config: ProxmoxConfig;
  private ticket: string | null = null;
  private csrf: string | null = null;

  constructor(config: ProxmoxConfig) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.host}/api2/json/access/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: this.config.username,
          password: this.config.password,
        }),
      });

      const data = await response.json();
      if (data.data) {
        this.ticket = data.data.ticket;
        this.csrf = data.data.CSRFPreventionToken;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Proxmox authentication failed:', error);
      return false;
    }
  }

  private async request(endpoint: string, method: string = 'GET', body?: any) {
    if (!this.ticket) {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('Authentication failed');
      }
    }

    const headers: HeadersInit = {
      'Cookie': `PVEAuthCookie=${this.ticket}`,
    };

    if (method !== 'GET') {
      headers['CSRFPreventionToken'] = this.csrf || '';
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const response = await fetch(`${this.config.host}/api2/json${endpoint}`, {
      method,
      headers,
      body: body ? new URLSearchParams(body) : undefined,
    });

    return response.json();
  }

  async getNodes() {
    return this.request('/nodes');
  }

  async getClusterResources() {
    return this.request('/cluster/resources');
  }

  async createVM(node: string, vmid: number, config: any) {
    return this.request(`/nodes/${node}/qemu`, 'POST', {
      vmid,
      ...config,
    });
  }

  async deleteVM(node: string, vmid: number) {
    return this.request(`/nodes/${node}/qemu/${vmid}`, 'DELETE');
  }

  async getVMStatus(node: string, vmid: number) {
    return this.request(`/nodes/${node}/qemu/${vmid}/status/current`);
  }

  async startVM(node: string, vmid: number) {
    return this.request(`/nodes/${node}/qemu/${vmid}/status/start`, 'POST');
  }

  async stopVM(node: string, vmid: number) {
    return this.request(`/nodes/${node}/qemu/${vmid}/status/stop`, 'POST');
  }

  async restartVM(node: string, vmid: number) {
    return this.request(`/nodes/${node}/qemu/${vmid}/status/reboot`, 'POST');
  }

  async getVMConfig(node: string, vmid: number) {
    return this.request(`/nodes/${node}/qemu/${vmid}/config`);
  }

  async updateVMConfig(node: string, vmid: number, config: any) {
    return this.request(`/nodes/${node}/qemu/${vmid}/config`, 'PUT', config);
  }

  async getNodeStatus(node: string) {
    return this.request(`/nodes/${node}/status`);
  }

  async getVNCWebSocket(node: string, vmid: number) {
    return this.request(`/nodes/${node}/qemu/${vmid}/vncwebsocket`, 'POST');
  }
}

export const proxmoxAPI = new ProxmoxAPI({
  host: import.meta.env.VITE_PROXMOX_HOST || 'https://your-proxmox-server:8006',
  username: import.meta.env.VITE_PROXMOX_USERNAME || 'root@pam',
  password: import.meta.env.VITE_PROXMOX_PASSWORD || '',
});
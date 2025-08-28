interface N8NWebhookData {
  event: string;
  data: any;
  timestamp: string;
}

export class N8NService {
  private static webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.triexpert.com/webhook';
  private static apiKey = import.meta.env.VITE_N8N_API_KEY || '';

  static async triggerWebhook(event: string, data: any): Promise<boolean> {
    try {
      const payload: N8NWebhookData = {
        event,
        data,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      return response.ok;
    } catch (error) {
      console.error('Error triggering n8n webhook:', error);
      return false;
    }
  }

  // Eventos específicos para automatización
  static async onUserRegistered(userData: any) {
    return this.triggerWebhook('user.registered', {
      user_id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      registration_date: userData.created_at
    });
  }

  static async onVPSCreated(vpsData: any) {
    return this.triggerWebhook('vps.created', {
      vps_id: vpsData.id,
      user_id: vpsData.user_id,
      name: vpsData.name,
      plan: vpsData.plan_name,
      ip_address: vpsData.ip_address,
      created_date: vpsData.created_at
    });
  }

  static async onVPSStatusChanged(vpsData: any, oldStatus: string, newStatus: string) {
    return this.triggerWebhook('vps.status_changed', {
      vps_id: vpsData.id,
      user_id: vpsData.user_id,
      name: vpsData.name,
      old_status: oldStatus,
      new_status: newStatus,
      ip_address: vpsData.ip_address,
      timestamp: new Date().toISOString()
    });
  }

  static async onInvoiceGenerated(invoiceData: any) {
    return this.triggerWebhook('invoice.generated', {
      invoice_id: invoiceData.id,
      user_id: invoiceData.user_id,
      amount: invoiceData.amount,
      currency: invoiceData.currency,
      due_date: invoiceData.due_date,
      vps_service: invoiceData.vps_service_name
    });
  }

  static async onTicketCreated(ticketData: any) {
    return this.triggerWebhook('ticket.created', {
      ticket_id: ticketData.id,
      user_id: ticketData.user_id,
      subject: ticketData.subject,
      priority: ticketData.priority,
      created_date: ticketData.created_at
    });
  }

  static async onPaymentReceived(paymentData: any) {
    return this.triggerWebhook('payment.received', {
      invoice_id: paymentData.invoice_id,
      user_id: paymentData.user_id,
      amount: paymentData.amount,
      currency: paymentData.currency,
      payment_date: paymentData.paid_at
    });
  }

  static async onVPSExpiring(vpsData: any, daysUntilExpiry: number) {
    return this.triggerWebhook('vps.expiring', {
      vps_id: vpsData.id,
      user_id: vpsData.user_id,
      name: vpsData.name,
      expires_at: vpsData.expires_at,
      days_until_expiry: daysUntilExpiry
    });
  }
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
export interface Company {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  companyId: string;
}

export interface GarmentType {
  id: string;
  name: string;
  displayOrder: number;
  active: boolean;
}

export interface OrderItem {
  id: string;
  garmentTypeId: string;
  garmentType: GarmentType;
  quantity: number;
}

export interface Order {
  id: string;
  ticketReference: string;
  status: string;
  createdBy: 'CUSTOMER' | 'STAFF';
  company: Company;
  site: Site;
  firstName: string;
  lastName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  items: OrderItem[];
  printTriggered: boolean;
  printTriggeredAt?: string;
  printCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  createdBy: 'CUSTOMER' | 'STAFF';
  staffUserId?: string;
  companyId: string;
  siteId: string;
  sitePin: string;
  firstName: string;
  lastName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  items: Array<{
    garmentTypeId: string;
    quantity: number;
  }>;
}

class ApiService {
  private baseUrl = API_URL;

  // Public endpoints
  async getCompanies(): Promise<Company[]> {
    const response = await fetch(`${this.baseUrl}/api/companies`);
    if (!response.ok) throw new Error('Failed to fetch companies');
    return response.json();
  }

  async getSites(companyId: string): Promise<Site[]> {
    const response = await fetch(`${this.baseUrl}/api/companies/${companyId}/sites`);
    if (!response.ok) throw new Error('Failed to fetch sites');
    return response.json();
  }

  async verifySitePin(siteId: string, pin: string): Promise<{ valid: boolean }> {
    const response = await fetch(`${this.baseUrl}/api/sites/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId, pin }),
    });
    if (!response.ok) throw new Error('Failed to verify PIN');
    return response.json();
  }

  async getGarmentTypes(): Promise<GarmentType[]> {
    const response = await fetch(`${this.baseUrl}/api/garment-types`);
    if (!response.ok) throw new Error('Failed to fetch garment types');
    return response.json();
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }
    return response.json();
  }

  async getOrder(orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/orders/${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  }

  async recordPrint(orderId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/orders/${orderId}/print`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to record print');
  }

  // Admin endpoints
  async adminLogin(email: string, password: string): Promise<{ token: string; admin: any }> {
    const response = await fetch(`${this.baseUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  }

  async getAdminMe(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get admin info');
    return response.json();
  }

  async searchOrders(token: string, filters: any): Promise<{ orders: Order[]; total: number }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}/api/admin/orders?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to search orders');
    return response.json();
  }

  async getAdminOrder(token: string, orderId: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/admin/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  }

  async updateOrder(token: string, orderId: string, data: any): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update order');
    }
    return response.json();
  }

  async reprintTicket(token: string, orderId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/admin/orders/${orderId}/reprint`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to reprint ticket');
  }

  async getStatistics(token: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/admin/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  }

  async getAdminCompanies(token: string): Promise<Company[]> {
    const response = await fetch(`${this.baseUrl}/api/admin/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch companies');
    return response.json();
  }

  async getAdminSites(token: string, companyId?: string): Promise<Site[]> {
    const params = companyId ? `?companyId=${companyId}` : '';
    const response = await fetch(`${this.baseUrl}/api/admin/sites${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch sites');
    return response.json();
  }
}

export const api = new ApiService();

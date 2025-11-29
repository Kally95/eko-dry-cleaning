import React, { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { api, Order } from '../../services/api';
import { useAdminStore } from '../../stores/adminStore';
import { OrderDetail } from './OrderDetail';

export const AdminDashboard: React.FC = () => {
  const { token, admin, clearAuth } = useAdminStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadOrders();
  }, [searchQuery, statusFilter, currentPage]);

  const loadOrders = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const filters: any = {
        limit: itemsPerPage,
        offset: currentPage * itemsPerPage,
      };

      if (searchQuery) {
        // Try to determine if it's a ticket ref, email, or name
        if (searchQuery.startsWith('EKO-')) {
          filters.ticketReference = searchQuery;
        } else if (searchQuery.includes('@')) {
          filters.customerEmail = searchQuery;
        } else {
          filters.customerName = searchQuery;
        }
      }

      if (statusFilter) {
        filters.status = statusFilter;
      }

      const result = await api.searchOrders(token, filters);
      setOrders(result.orders);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.reload();
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null);
    loadOrders(); // Refresh list in case order was updated
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onClose={handleCloseDetail} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">EKO Dry Cleaning - Admin Panel</h1>
              <p className="text-sm text-gray-600">
                Logged in as: {admin?.name} ({admin?.email})
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Search Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
                placeholder="Ticket ref, email, or name"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_CLEANING">In Cleaning</option>
                <option value="READY_FOR_COLLECTION">Ready for Collection</option>
                <option value="COLLECTED">Collected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                  setCurrentPage(0);
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">
              Orders ({total} total)
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Ticket Ref
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Site
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => {
                      const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
                      return (
                        <tr
                          key={order.id}
                          onClick={() => handleOrderClick(order)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                            {order.ticketReference}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium">{order.firstName} {order.lastName}</div>
                            <div className="text-sm text-gray-500">{order.customerEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">{order.site.name}</div>
                            <div className="text-xs text-gray-500">{order.company.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {totalItems} item(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                order.status === 'SUBMITTED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : order.status === 'IN_CLEANING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : order.status === 'READY_FOR_COLLECTION'
                                  ? 'bg-green-100 text-green-800'
                                  : order.status === 'COLLECTED'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {order.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-6 border-t flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

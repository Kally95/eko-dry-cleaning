import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Input, TextArea } from '../../components/Input';
import { Ticket } from '../../components/Ticket';
import { api, Order } from '../../services/api';
import { useAdminStore } from '../../stores/adminStore';

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetail: React.FC<OrderDetailProps> = ({ order: initialOrder, onClose }) => {
  const { token } = useAdminStore();
  const [order, setOrder] = useState(initialOrder);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Edit form state
  const [firstName, setFirstName] = useState(order.firstName);
  const [lastName, setLastName] = useState(order.lastName);
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone);
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail);
  const [notes, setNotes] = useState(order.notes || '');
  const [status, setStatus] = useState(order.status);

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSave = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const updatedOrder = await api.updateOrder(token, order.id, {
        firstName,
        lastName,
        customerPhone,
        customerEmail,
        notes: notes || undefined,
        status,
      });

      setOrder(updatedOrder);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFirstName(order.firstName);
    setLastName(order.lastName);
    setCustomerPhone(order.customerPhone);
    setCustomerEmail(order.customerEmail);
    setNotes(order.notes || '');
    setStatus(order.status);
    setEditing(false);
    setError('');
  };

  const handlePrint = async () => {
    if (!token) return;
    await api.reprintTicket(token, order.id);
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="outline" size="sm" onClick={onClose}>
                ← Back to Orders
              </Button>
              <h1 className="text-2xl font-bold mt-2">
                Order {order.ticketReference}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="no-print">
                Print Ticket
              </Button>
              {!editing && (
                <Button onClick={() => setEditing(true)} className="no-print">
                  Edit Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Order Information</h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket Reference
                  </label>
                  <p className="font-mono font-semibold text-lg">{order.ticketReference}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  {editing ? (
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="IN_CLEANING">In Cleaning</option>
                      <option value="READY_FOR_COLLECTION">Ready for Collection</option>
                      <option value="COLLECTED">Collected</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
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
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created
                  </label>
                  <p>
                    {new Date(order.createdAt).toLocaleString('en-GB', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created By
                  </label>
                  <p>
                    {order.createdBy === 'CUSTOMER' ? 'Customer (self-service)' : 'Staff member'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Customer Details</h2>
              <div className="space-y-4">
                {editing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                      <Input
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    <Input
                      label="Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <p>{order.firstName} {order.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p>{order.customerPhone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p>{order.customerEmail}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Site Details</h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <p>{order.company.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site
                  </label>
                  <p>{order.site.name}</p>
                  <p className="text-sm text-gray-600">{order.site.address}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">
                Items ({totalItems} total)
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Garment</th>
                    <th className="text-right py-2">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.garmentType.name}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Notes</h2>
              {editing ? (
                <TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="No notes"
                />
              ) : (
                <p className="whitespace-pre-wrap">
                  {order.notes || 'No notes'}
                </p>
              )}
            </div>

            {editing && (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Ticket Preview */}
          <div className="lg:sticky lg:top-8 h-fit no-print">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Ticket Preview</h2>
              <div className="border rounded-lg overflow-hidden">
                <Ticket order={order} />
              </div>
            </div>
          </div>
        </div>

        {/* Hidden ticket for printing */}
        <div className="hidden print:block">
          <Ticket order={order} />
        </div>
      </div>
    </div>
  );
};

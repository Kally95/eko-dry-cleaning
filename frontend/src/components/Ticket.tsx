import React from 'react';
import { Order } from '../services/api';

interface TicketProps {
  order: Order;
}

export const Ticket: React.FC<TicketProps> = ({ order }) => {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="print-area bg-white p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b-4 border-gray-900 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-center">EKO DRY CLEANING</h1>
        <p className="text-center text-lg font-semibold mt-2">Uniform Service Ticket</p>
      </div>

      {/* Ticket Reference */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <p className="text-sm text-gray-600 mb-1">Ticket Reference</p>
        <p className="text-3xl font-bold">{order.ticketReference}</p>
      </div>

      {/* Date and Time */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">Created</p>
        <p className="text-lg font-semibold">
          {new Date(order.createdAt).toLocaleString('en-GB', {
            dateStyle: 'full',
            timeStyle: 'short',
          })}
        </p>
      </div>

      {/* Company and Site */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Location</h2>
        <p className="font-semibold">{order.company.name}</p>
        <p>{order.site.name}</p>
        <p className="text-sm text-gray-600">{order.site.address}</p>
      </div>

      {/* Customer Details */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Customer Details</h2>
        <p><span className="font-semibold">Name:</span> {order.customerName}</p>
        <p><span className="font-semibold">Phone:</span> {order.customerPhone}</p>
        <p><span className="font-semibold">Email:</span> {order.customerEmail}</p>
      </div>

      {/* Items */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Items ({totalItems} total)</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
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

      {/* Notes */}
      {order.notes && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Notes / Alterations</h2>
          <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap">
            {order.notes}
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="border-4 border-red-500 p-4 mt-6">
        <p className="font-bold text-center text-lg mb-2">IMPORTANT</p>
        <p className="text-center">
          Please ensure this ticket is printed and placed INSIDE the bag with your garments.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t text-center text-sm text-gray-600">
        <p>Thank you for using EKO Dry Cleaning services</p>
      </div>
    </div>
  );
};

import React from 'react';
import { Order } from '../services/api';

interface DualTicketProps {
  order: Order;
}

export const DualTicket: React.FC<DualTicketProps> = ({ order }) => {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const TicketCopy = ({ copyType }: { copyType: 'CUSTOMER' | 'STAFF' }) => (
    <div className="ticket-copy border-2 border-gray-900 p-6">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-3 mb-4">
        <h1 className="text-2xl font-bold text-center">EKO DRY CLEANING</h1>
        <p className="text-center text-sm font-semibold mt-1">Uniform Service Ticket</p>
        <p className="text-center text-xs font-bold mt-1 bg-gray-900 text-white py-1">
          {copyType} COPY
        </p>
      </div>

      {/* Ticket Reference */}
      <div className="mb-3">
        <p className="text-xs text-gray-600">Ticket Reference</p>
        <p className="text-xl font-bold">{order.ticketReference}</p>
      </div>

      {/* Date */}
      <div className="mb-3">
        <p className="text-xs text-gray-600">Date & Time</p>
        <p className="text-sm font-semibold">
          {new Date(order.createdAt).toLocaleString('en-GB', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </p>
      </div>

      {/* Location */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 font-semibold">Location</p>
        <p className="text-sm font-semibold">{order.company.name}</p>
        <p className="text-sm">{order.site.name}</p>
        <p className="text-xs text-gray-600">{order.site.address}</p>
      </div>

      {/* Customer */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 font-semibold">Customer</p>
        <p className="text-sm font-semibold">{order.customerName}</p>
        <p className="text-xs">{order.customerPhone}</p>
        <p className="text-xs">{order.customerEmail}</p>
      </div>

      {/* Items */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 font-semibold mb-1">Items ({totalItems} total)</p>
        <table className="w-full text-xs">
          <thead className="border-b border-gray-400">
            <tr>
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-1">{item.garmentType.name}</td>
                <td className="text-right py-1">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 font-semibold">Notes / Alterations</p>
          <div className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap">
            {order.notes}
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="border-2 border-red-500 p-2 mt-3">
        <p className="font-bold text-center text-xs">⚠️ IMPORTANT</p>
        <p className="text-center text-xs">
          This ticket must be placed INSIDE the bag with garments
        </p>
      </div>
    </div>
  );

  return (
    <div className="dual-ticket-container bg-white" style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          body {
            margin: 0;
            padding: 0;
          }

          .dual-ticket-container {
            width: 100%;
            height: 100%;
            page-break-after: avoid;
            display: flex;
            flex-direction: column;
            gap: 10mm;
          }

          .ticket-copy {
            flex: 1;
            page-break-inside: avoid;
          }

          .no-print {
            display: none !important;
          }
        }

        @media screen {
          .dual-ticket-container {
            padding: 20px;
          }
        }
      `}</style>

      <TicketCopy copyType="CUSTOMER" />

      <div className="my-4 border-t-2 border-dashed border-gray-400 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-500">
          ✂️ CUT HERE ✂️
        </div>
      </div>

      <TicketCopy copyType="STAFF" />
    </div>
  );
};

import React from 'react';
import { Order } from '../services/api';

interface DualTicketProps {
  order: Order;
}

export const DualTicket: React.FC<DualTicketProps> = ({ order }) => {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const TicketCopy = ({ copyType }: { copyType: 'CUSTOMER' | 'STAFF' }) => (
    <div className="ticket-copy" style={{
      border: '2px solid #000',
      padding: '16px',
      pageBreakInside: 'avoid'
    }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
          EKO DRY CLEANING
        </h1>
        <p style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', marginTop: '4px', marginBottom: '4px' }}>
          Uniform Service Ticket
        </p>
        <p style={{
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          marginTop: '4px',
          backgroundColor: '#000',
          color: '#fff',
          padding: '4px'
        }}>
          {copyType} COPY
        </p>
      </div>

      {/* Ticket Reference */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Ticket Reference</p>
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{order.ticketReference}</p>
      </div>

      {/* Date */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>Date & Time</p>
        <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>
          {new Date(order.createdAt).toLocaleString('en-GB', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </p>
      </div>

      {/* Location */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#666', fontWeight: '600', marginBottom: '2px' }}>Location</p>
        <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>{order.company.name}</p>
        <p style={{ fontSize: '12px', margin: 0 }}>{order.site.name}</p>
        <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>{order.site.address}</p>
      </div>

      {/* Customer */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#666', fontWeight: '600', marginBottom: '2px' }}>Customer</p>
        <p style={{ fontSize: '12px', fontWeight: '600', margin: 0 }}>{order.firstName} {order.lastName}</p>
        <p style={{ fontSize: '10px', margin: 0 }}>{order.customerPhone}</p>
        <p style={{ fontSize: '10px', margin: 0 }}>{order.customerEmail}</p>
      </div>

      {/* Items */}
      <div style={{ marginBottom: '8px' }}>
        <p style={{ fontSize: '10px', color: '#666', fontWeight: '600', marginBottom: '4px' }}>
          Items ({totalItems} total)
        </p>
        <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #999' }}>
              <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
              <th style={{ textAlign: 'right', padding: '4px 0' }}>Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '4px 0' }}>{item.garmentType.name}</td>
                <td style={{ textAlign: 'right', padding: '4px 0' }}>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {order.notes && (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '10px', color: '#666', fontWeight: '600', marginBottom: '2px' }}>
            Notes / Alterations
          </p>
          <div style={{ fontSize: '10px', backgroundColor: '#f9fafb', padding: '8px', borderRadius: '4px' }}>
            {order.notes}
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div style={{ border: '2px solid #ef4444', padding: '8px', marginTop: '8px' }}>
        <p style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '10px', margin: 0 }}>
          ⚠️ IMPORTANT
        </p>
        <p style={{ textAlign: 'center', fontSize: '10px', margin: '4px 0 0 0' }}>
          This ticket must be placed INSIDE the bag with garments
        </p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
          }

          body * {
            visibility: hidden;
          }

          .print-ticket-area,
          .print-ticket-area * {
            visibility: visible;
          }

          .print-ticket-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="print-ticket-area">
        <TicketCopy copyType="CUSTOMER" />

        <div style={{
          margin: '16px 0',
          borderTop: '2px dashed #999',
          position: 'relative',
          height: '20px'
        }}>
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: '0 16px',
            fontSize: '10px',
            color: '#666'
          }}>
            ✂️ CUT HERE ✂️
          </div>
        </div>

        <TicketCopy copyType="STAFF" />
      </div>
    </>
  );
};

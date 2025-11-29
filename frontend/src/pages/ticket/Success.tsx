import React from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { DualTicket } from '../../components/DualTicket';
import { useTicketStore } from '../../stores/ticketStore';
import { api } from '../../services/api';

interface SuccessProps {
  onNewTicketSameSite: () => void;
  onChangeSite: () => void;
}

export const Success: React.FC<SuccessProps> = ({ onNewTicketSameSite, onChangeSite }) => {
  const { createdOrder } = useTicketStore();

  if (!createdOrder) {
    return (
      <Layout title="Error">
        <div className="text-center py-8">
          <p className="text-red-600">Order not found. Please try again.</p>
          <Button onClick={onChangeSite} className="mt-4">
            Start Over
          </Button>
        </div>
      </Layout>
    );
  }

  const totalItems = createdOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  const handlePrintAgain = async () => {
    await api.recordPrint(createdOrder.id);
    window.print();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Success Message */}
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">
            Ticket Submitted Successfully!
          </h2>
          <p className="text-green-800">
            Your ticket reference is{' '}
            <span className="font-bold text-xl">{createdOrder.ticketReference}</span>
          </p>
        </div>

        {/* Important Reminder */}
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <p className="font-semibold text-red-900 text-center">
            🎫 Remember: Print this ticket and place it INSIDE the bag with your garments
          </p>
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-6 bg-gray-50 space-y-3">
          <div>
            <p className="text-sm text-gray-600">Created</p>
            <p className="font-semibold">
              {new Date(createdOrder.createdAt).toLocaleString('en-GB', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-semibold">{createdOrder.customerName}</p>
            <p className="text-sm">{createdOrder.customerEmail}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Site</p>
            <p className="font-semibold">{createdOrder.site.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Items</p>
            <p className="font-semibold">{totalItems} garment(s)</p>
          </div>

          {createdOrder.notes && (
            <div>
              <p className="text-sm text-gray-600">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{createdOrder.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={handlePrintAgain}
            className="w-full"
            size="lg"
          >
            Print Ticket Again
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onNewTicketSameSite}
              className="w-full"
            >
              New Ticket for This Site
            </Button>

            <Button
              variant="outline"
              onClick={onChangeSite}
              className="w-full"
            >
              Change Site or Company
            </Button>
          </div>
        </div>

        {/* Hidden ticket for printing */}
        <div className="hidden print:block">
          <DualTicket order={createdOrder} />
        </div>
      </div>
    </Layout>
  );
};

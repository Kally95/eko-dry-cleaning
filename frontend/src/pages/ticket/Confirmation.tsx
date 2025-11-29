import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { DualTicket } from '../../components/DualTicket';
import { useTicketStore } from '../../stores/ticketStore';
import { api, GarmentType } from '../../services/api';

interface ConfirmationProps {
  onNext: () => void;
  onBack: () => void;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ onNext, onBack }) => {
  const {
    mode,
    selectedCompany,
    selectedSite,
    sitePin,
    firstName,
    lastName,
    customerPhone,
    customerEmail,
    notes,
    garmentQuantities,
    setCreatedOrder,
  } = useTicketStore();

  const [confirmed, setConfirmed] = useState(false);
  const [printTriggered, setPrintTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewOrder, setPreviewOrder] = useState<any>(null);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);

  useEffect(() => {
    loadGarmentTypes();
  }, []);

  const loadGarmentTypes = async () => {
    try {
      const types = await api.getGarmentTypes();
      setGarmentTypes(types);
    } catch (err) {
      console.error('Failed to load garment types:', err);
    }
  };

  // Calculate items for display
  const items = Object.entries(garmentQuantities)
    .filter(([, qty]) => qty > 0)
    .map(([garmentId, quantity]) => ({
      garmentTypeId: garmentId,
      quantity,
    }));

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Create a preview order object for the ticket
  const getPreviewOrder = () => {
    if (previewOrder) return previewOrder;

    return {
      id: 'preview',
      ticketReference: 'PREVIEW',
      status: 'SUBMITTED',
      createdBy: mode,
      company: selectedCompany,
      site: selectedSite,
      firstName,
      lastName,
      customerPhone,
      customerEmail,
      notes,
      items: items.map((item, index) => {
        const garmentType = garmentTypes.find(g => g.id === item.garmentTypeId);
        return {
          id: `preview-item-${index}`,
          garmentTypeId: item.garmentTypeId,
          garmentType: garmentType || {
            id: item.garmentTypeId,
            name: 'Unknown Item',
            displayOrder: index,
            active: true,
          },
          quantity: item.quantity,
        };
      }),
      printTriggered: false,
      printCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handlePrint = async () => {
    if (!confirmed) return;

    try {
      setLoading(true);
      setError('');

      // If order hasn't been created yet, create it first
      let orderToPrint = previewOrder;

      if (!orderToPrint) {
        const orderData = {
          createdBy: mode!,
          companyId: selectedCompany!.id,
          siteId: selectedSite!.id,
          sitePin: sitePin,
          firstName,
          lastName,
          customerPhone,
          customerEmail,
          notes: notes || undefined,
          items,
        };

        orderToPrint = await api.createOrder(orderData);
        setCreatedOrder(orderToPrint);
        setPreviewOrder(orderToPrint);
      }

      // Record print and trigger print dialog
      await api.recordPrint(orderToPrint.id);
      setPrintTriggered(true);
      window.print();
    } catch (err: any) {
      setError(err.message || 'Failed to print ticket. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (shouldNavigate = true) => {
    if (!selectedSite || !selectedCompany) return;

    try {
      setLoading(true);
      setError('');

      // If order already exists, just navigate
      if (previewOrder && shouldNavigate) {
        onNext();
        return;
      }

      const orderData = {
        createdBy: mode!,
        companyId: selectedCompany.id,
        siteId: selectedSite.id,
        sitePin: sitePin,
        firstName,
        lastName,
        customerPhone,
        customerEmail,
        notes: notes || undefined,
        items,
      };

      const order = await api.createOrder(orderData);
      setCreatedOrder(order);
      setPreviewOrder(order);

      if (shouldNavigate) {
        onNext();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create order. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (!confirmed || !printTriggered) return;

    if (!previewOrder) {
      await handleSubmit(true);
    } else {
      onNext();
    }
  };

  return (
    <Layout title="Review Your Order">
      <div className="space-y-6">
        {/* Warning */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <p className="font-semibold text-yellow-900 mb-2">
            ⚠️ Please check your order carefully
          </p>
          <p className="text-yellow-800 text-sm">
            Once submitted, changes may require a new ticket and may incur an admin fee.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Order Summary */}
        <div className="border rounded-lg p-6 bg-gray-50 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Site</h3>
            <p className="font-medium">{selectedCompany?.name}</p>
            <p>{selectedSite?.name}</p>
            <p className="text-sm text-gray-600">{selectedSite?.address}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Customer</h3>
            <p>{firstName} {lastName}</p>
            <p className="text-sm">{customerPhone}</p>
            <p className="text-sm">{customerEmail}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Items ({totalItems} total)</h3>
            <ul className="space-y-1">
              {items.map((item, index) => {
                const garmentType = garmentTypes.find(g => g.id === item.garmentTypeId);
                return (
                  <li key={index}>
                    {garmentType?.name || 'Unknown'}: {item.quantity} × item(s)
                  </li>
                );
              })}
            </ul>
          </div>

          {notes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Notes</h3>
              <p className="whitespace-pre-wrap text-sm">{notes}</p>
            </div>
          )}
        </div>

        {/* Confirmation Checkbox - Emphasised with Caution Styling */}
        <div className="border-3 border-amber-500 bg-amber-50 rounded-lg p-5">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-6 w-6 text-amber-600 rounded focus:ring-2 focus:ring-amber-500 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">⚠️</span>
                <span className="font-bold text-amber-900 text-lg">Important Confirmation</span>
              </div>
              <span className="text-amber-900 font-semibold">
                I confirm these details are correct and I will print the ticket and put it in the bag.
              </span>
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={loading}
            >
              Back to Edit
            </Button>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handlePrint}
                disabled={!confirmed || loading}
              >
                Print Ticket
              </Button>

              <Button
                onClick={handleFinish}
                disabled={!confirmed || !printTriggered || loading}
              >
                {loading ? 'Submitting...' : 'Finish & Submit'}
              </Button>
            </div>
          </div>

          {!printTriggered && confirmed && (
            <p className="text-sm text-gray-600 text-center">
              Please print the ticket before finishing
            </p>
          )}
        </div>

        {/* Hidden ticket for printing */}
        {previewOrder && (
          <div className="hidden print:block">
            <DualTicket order={previewOrder} />
          </div>
        )}
      </div>
    </Layout>
  );
};

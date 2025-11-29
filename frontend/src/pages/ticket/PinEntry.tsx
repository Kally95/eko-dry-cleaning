import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTicketStore } from '../../stores/ticketStore';
import { api } from '../../services/api';

interface PinEntryProps {
  onNext: () => void;
  onBack: () => void;
}

export const PinEntry: React.FC<PinEntryProps> = ({ onNext, onBack }) => {
  const { mode, selectedCompany, selectedSite, setPinVerified } = useTicketStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSite) return;

    try {
      setLoading(true);
      const result = await api.verifySitePin(selectedSite.id, pin);

      if (result.valid) {
        setPinVerified(true);
        onNext();
      } else {
        setError('Invalid PIN. Please try again or contact site staff.');
        setPin('');
      }
    } catch (err) {
      setError('Failed to verify PIN. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isCustomerMode = mode === 'CUSTOMER';

  return (
    <Layout title="Site Access PIN">
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div>
            <p className="text-sm text-gray-600">Company</p>
            <p className="font-semibold">{selectedCompany?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Site</p>
            <p className="font-semibold">{selectedSite?.name}</p>
          </div>
        </div>

        {isCustomerMode ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-700">
              Please enter the site PIN. If you don't know it, please ask your local reception or security staff.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-700">
              Please enter the site PIN to continue.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="password"
            label="Site PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            error={error}
            required
            autoFocus
            maxLength={10}
          />

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={!pin || loading}>
              {loading ? 'Verifying...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

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
  const { mode, setSelectedCompany, setSelectedSite, setSitePin, setPinVerified } = useTicketStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pin.trim()) {
      setError('Please enter a PIN');
      return;
    }

    try {
      setLoading(true);
      const siteData = await api.loginWithPin(pin);

      // Set the site and company from the PIN login response
      setSelectedSite({
        id: siteData.id,
        name: siteData.name,
        address: siteData.address,
        companyId: siteData.companyId,
      });
      setSelectedCompany(siteData.company);
      setSitePin(pin); // Store the verified PIN
      setPinVerified(true);
      onNext();
    } catch (err: any) {
      setError(err.message || 'Invalid PIN. Please try again or contact site staff.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const isCustomerMode = mode === 'CUSTOMER';

  return (
    <Layout title="Site Access">
      <div className="space-y-6">
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🔐</span>
            <h3 className="font-bold text-blue-900 text-lg">PIN Required</h3>
          </div>
          {isCustomerMode ? (
            <p className="text-blue-900">
              Please enter your site PIN to continue. If you don't know it, ask your local reception or security staff.
            </p>
          ) : (
            <p className="text-blue-900">
              Please enter the site PIN to access this location's ticketing system.
            </p>
          )}
        </div>

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

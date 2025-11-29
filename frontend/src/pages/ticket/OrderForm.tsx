import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Input, TextArea } from '../../components/Input';
import { Button } from '../../components/Button';
import { useTicketStore } from '../../stores/ticketStore';
import { api, GarmentType } from '../../services/api';
import { getGarmentEmoji } from '../../utils/garmentEmojis';
import { validateUKPhone, validateEmail } from '../../utils/validation';

interface OrderFormProps {
  onNext: () => void;
  onBack: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onNext, onBack }) => {
  const {
    mode,
    selectedCompany,
    selectedSite,
    firstName,
    lastName,
    customerPhone,
    customerEmail,
    notes,
    garmentQuantities,
    setFirstName,
    setLastName,
    setCustomerPhone,
    setCustomerEmail,
    setNotes,
    setGarmentQuantity,
  } = useTicketStore();

  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGarmentTypes();
  }, []);

  const loadGarmentTypes = async () => {
    try {
      setLoading(true);
      const data = await api.getGarmentTypes();
      setGarmentTypes(data);
    } catch (err) {
      setError('Failed to load garment types. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = Object.values(garmentQuantities).reduce((sum, qty) => sum + qty, 0);

  const validate = () => {
    const errors: Record<string, string> = {};

    // Validate names
    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Validate UK phone number
    const phoneValidation = validateUKPhone(customerPhone);
    if (!phoneValidation.valid) {
      errors.customerPhone = phoneValidation.error || 'Invalid phone number';
    }

    // Validate email
    const emailValidation = validateEmail(customerEmail);
    if (!emailValidation.valid) {
      errors.customerEmail = emailValidation.error || 'Invalid email address';
    }

    // Validate items
    if (totalItems === 0) {
      errors.items = 'Please select at least one item';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  const handleQuantityChange = (garmentId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    setGarmentQuantity(garmentId, Math.max(0, quantity));
  };

  const isCustomerMode = mode === 'CUSTOMER';
  const customerLabel = isCustomerMode ? 'Your Details' : 'Customer Details';

  return (
    <Layout title="Create Order">
      <div className="space-y-6">
        {/* Site Summary */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <h3 className="font-semibold text-lg">Site Summary</h3>
          <div>
            <p className="text-sm text-gray-600">Company</p>
            <p className="font-medium">{selectedCompany?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Site</p>
            <p className="font-medium">{selectedSite?.name}</p>
            <p className="text-sm text-gray-600">{selectedSite?.address}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading form...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Details */}
            <div>
              <h3 className="font-semibold text-lg mb-4">{customerLabel}</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={validationErrors.firstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={validationErrors.lastName}
                    required
                  />
                </div>
                <Input
                  label="Phone Number"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="07123456789"
                  error={validationErrors.customerPhone}
                  required
                />
                <Input
                  label="Work Email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  error={validationErrors.customerEmail}
                  required
                />
              </div>
            </div>

            {/* Garments */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Garments</h3>
                <div className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-semibold">
                  Total: {totalItems} items
                </div>
              </div>

              {validationErrors.items && (
                <div className="mb-4 text-red-600 text-sm">
                  {validationErrors.items}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {garmentTypes.map((garment) => {
                  const quantity = garmentQuantities[garment.id] || 0;
                  const emoji = getGarmentEmoji(garment.name);

                  return (
                    <div
                      key={garment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <label className="font-medium flex-1 flex items-center gap-2">
                        <span className="text-2xl">{emoji}</span>
                        <span>{garment.name}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setGarmentQuantity(garment.id, Math.max(0, quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 transition-colors"
                          disabled={quantity === 0}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-semibold text-lg">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGarmentQuantity(garment.id, quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <TextArea
                label="Notes / Alterations (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="e.g., Shorten trouser leg by 2cm, Missing button on jacket, Stain on sleeve"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button type="submit">
                Review Order
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

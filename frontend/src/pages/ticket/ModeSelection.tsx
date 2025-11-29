import React from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { useTicketStore } from '../../stores/ticketStore';

interface ModeSelectionProps {
  onNext: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onNext }) => {
  const { setMode } = useTicketStore();

  const handleSelect = (mode: 'CUSTOMER' | 'STAFF') => {
    setMode(mode);
    onNext();
  };

  return (
    <Layout
      title="Welcome"
      subtitle="This is the EKO Dry Cleaning uniform ticket system"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-gray-700">
            You will create a ticket that must be printed and placed in the bag with your garments.
            Please choose how you're using this system:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            onClick={() => handleSelect('CUSTOMER')}
            className="hover:border-primary-500 border-2 border-transparent"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">👤</div>
              <h3 className="text-xl font-bold mb-2">I'm a Customer</h3>
              <p className="text-gray-600">
                I'm dropping off my own uniform for dry cleaning
              </p>
            </div>
          </Card>

          <Card
            onClick={() => handleSelect('STAFF')}
            className="hover:border-primary-500 border-2 border-transparent"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">👔</div>
              <h3 className="text-xl font-bold mb-2">I'm Staff</h3>
              <p className="text-gray-600">
                I'm helping a customer or processing their order
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTicketStore } from '../../stores/ticketStore';
import { api, Company } from '../../services/api';

interface CompanySelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const CompanySelection: React.FC<CompanySelectionProps> = ({ onNext, onBack }) => {
  const { selectedCompany, setCompany } = useTicketStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (err) {
      setError('Failed to load companies. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company: Company) => {
    setCompany(company);
  };

  const handleContinue = () => {
    if (selectedCompany) {
      onNext();
    }
  };

  return (
    <Layout title="Select Your Company">
      <div className="space-y-6">
        <p className="text-gray-600 text-center">
          Please select the company you work for
        </p>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading companies...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid gap-4">
              {companies.map((company) => (
                <Card
                  key={company.id}
                  onClick={() => handleSelect(company)}
                  selected={selectedCompany?.id === company.id}
                  className="cursor-pointer hover:border-primary-500 border-2 border-transparent"
                >
                  <h3 className="text-xl font-semibold">{company.name}</h3>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedCompany}
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

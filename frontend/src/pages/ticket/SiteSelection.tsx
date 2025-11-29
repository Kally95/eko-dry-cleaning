import React, { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTicketStore } from '../../stores/ticketStore';
import { api, Site } from '../../services/api';

interface SiteSelectionProps {
  onNext: () => void;
  onBack: () => void;
}

export const SiteSelection: React.FC<SiteSelectionProps> = ({ onNext, onBack }) => {
  const { selectedCompany, selectedSite, setSite } = useTicketStore();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedCompany) {
      loadSites();
    }
  }, [selectedCompany]);

  const loadSites = async () => {
    if (!selectedCompany) return;

    try {
      setLoading(true);
      const data = await api.getSites(selectedCompany.id);
      setSites(data);
    } catch (err) {
      setError('Failed to load sites. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (site: Site) => {
    setSite(site);
  };

  const handleContinue = () => {
    if (selectedSite) {
      onNext();
    }
  };

  return (
    <Layout title="Select Your Site">
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Company</p>
          <p className="font-semibold">{selectedCompany?.name}</p>
        </div>

        <p className="text-gray-600 text-center">
          Please select the site where you work
        </p>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Loading sites...</p>
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
              {sites.map((site) => (
                <Card
                  key={site.id}
                  onClick={() => handleSelect(site)}
                  selected={selectedSite?.id === site.id}
                  className="cursor-pointer hover:border-primary-500 border-2 border-transparent"
                >
                  <h3 className="text-xl font-semibold">{site.name}</h3>
                  <p className="text-gray-600 mt-1">{site.address}</p>
                </Card>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedSite}
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

import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export interface IndustryTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export function useIndustryTemplates() {
  const [industries, setIndustries] = useState<IndustryTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIsLoading(true);
        const response = await apiRequest('GET', '/api/industry-templates');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setIndustries(data.industries || []);
        } else {
          // Fallback to common industries if Airtable fetch fails
          setIndustries([
            { id: '1', name: 'Technology', category: 'Tech' },
            { id: '2', name: 'Healthcare', category: 'Medical' },
            { id: '3', name: 'Finance', category: 'Financial' },
            { id: '4', name: 'Education', category: 'Academic' },
            { id: '5', name: 'Retail', category: 'Commerce' },
            { id: '6', name: 'Manufacturing', category: 'Industrial' },
            { id: '7', name: 'Consulting', category: 'Professional' },
            { id: '8', name: 'Media & Entertainment', category: 'Creative' },
            { id: '9', name: 'Real Estate', category: 'Property' },
            { id: '10', name: 'Transportation', category: 'Logistics' },
            { id: '11', name: 'Energy', category: 'Utilities' },
            { id: '12', name: 'Government', category: 'Public' }
          ]);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch industries:', err);
        setError('Failed to load industries');
        // Use fallback data
        setIndustries([
          { id: '1', name: 'Technology', category: 'Tech' },
          { id: '2', name: 'Healthcare', category: 'Medical' },
          { id: '3', name: 'Finance', category: 'Financial' },
          { id: '4', name: 'Education', category: 'Academic' },
          { id: '5', name: 'Retail', category: 'Commerce' },
          { id: '6', name: 'Manufacturing', category: 'Industrial' },
          { id: '7', name: 'Consulting', category: 'Professional' },
          { id: '8', name: 'Media & Entertainment', category: 'Creative' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  return { industries, isLoading, error };
}
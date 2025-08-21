import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { RFQ, Quotation, Order, SampleRequest, SampleQuote } from '../lib/supabase';

export const useRFQs = (filters?: { status?: string; category?: string }) => {
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRFQs = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await api.getRFQs({
          ...filters,
          buyer_id: user.user_type === 'buyer' ? user.id : undefined
        });
        setRFQs(data);
      } catch (error) {
        console.error('Error fetching RFQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRFQs();
  }, [user, filters]);

  return { rfqs, loading, refetch: () => fetchRFQs() };
};

export const useQuotations = (filters?: { rfq_id?: string; status?: string }) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuotations = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await api.getQuotations({
          ...filters,
          supplier_id: user.user_type === 'supplier' ? user.id : undefined
        });
        setQuotations(data);
      } catch (error) {
        console.error('Error fetching quotations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, [user, filters]);

  return { quotations, loading, refetch: () => fetchQuotations() };
};

export const useOrders = (filters?: { status?: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await api.getOrders({
          ...filters,
          buyer_id: user.user_type === 'buyer' ? user.id : undefined,
          supplier_id: user.user_type === 'supplier' ? user.id : undefined
        });
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, filters]);

  return { orders, loading, refetch: () => fetchOrders() };
};

export const useSampleRequests = (filters?: { status?: string }) => {
  const [sampleRequests, setSampleRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSampleRequests = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await api.getSampleRequests({
          ...filters,
          buyer_id: user.user_type === 'buyer' ? user.id : undefined
        });
        setSampleRequests(data);
      } catch (error) {
        console.error('Error fetching sample requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleRequests();
  }, [user, filters]);

  return { sampleRequests, loading, refetch: () => fetchSampleRequests() };
};

export const useSampleQuotes = (filters?: { sample_request_id?: string }) => {
  const [sampleQuotes, setSampleQuotes] = useState<SampleQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSampleQuotes = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await api.getSampleQuotes({
          ...filters,
          supplier_id: user.user_type === 'supplier' ? user.id : undefined
        });
        setSampleQuotes(data);
      } catch (error) {
        console.error('Error fetching sample quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleQuotes();
  }, [user, filters]);

  return { sampleQuotes, loading, refetch: () => fetchSampleQuotes() };
};
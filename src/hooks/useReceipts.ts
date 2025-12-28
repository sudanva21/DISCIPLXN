import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Receipt {
    id: string;
    receipt_number: string;
    user_id: string;
    amount: number;
    tax_amount: number;
    total_amount: number;
    payment_method: string;
    payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
    payment_date: string | null;
    description: string | null;
    created_at: string;
}

export function useReceipts() {
    const { user, isAdmin } = useAuth();
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReceipts = async () => {
        if (!supabase || !user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        let query = supabase
            .from('receipts')
            .select('*')
            .order('created_at', { ascending: false });

        // If not admin, only get own receipts
        if (!isAdmin) {
            query = query.eq('user_id', user.id);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
            setError(fetchError.message);
            setReceipts([]);
        } else {
            setReceipts(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchReceipts();
    }, [user, isAdmin]);

    const createReceipt = async (receiptData: {
        user_id: string;
        amount: number;
        description?: string;
        payment_method?: string;
    }) => {
        if (!supabase || !isAdmin) {
            return { error: 'Not authorized' };
        }

        const { data, error: insertError } = await supabase
            .from('receipts')
            .insert({
                user_id: receiptData.user_id,
                amount: receiptData.amount,
                tax_amount: 0,
                total_amount: receiptData.amount,
                description: receiptData.description || 'Membership payment',
                payment_method: receiptData.payment_method || 'cash',
                payment_status: 'paid',
                payment_date: new Date().toISOString(),
                gym_id: '00000000-0000-0000-0000-000000000001',
            })
            .select()
            .single();

        if (insertError) {
            return { error: insertError.message };
        }

        await fetchReceipts();
        return { data };
    };

    const totalPaid = receipts
        .filter(r => r.payment_status === 'paid')
        .reduce((sum, r) => sum + Number(r.total_amount), 0);

    return {
        receipts,
        loading,
        error,
        refetch: fetchReceipts,
        createReceipt,
        totalPaid,
    };
}

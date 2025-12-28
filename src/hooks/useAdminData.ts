import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Member {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: 'admin' | 'member' | 'super_admin';
    created_at: string;
}

interface DashboardStats {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
    newMembersThisMonth: number;
    pendingPayments: number;
}

export function useAdminData() {
    const { isAdmin } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalMembers: 0,
        activeMembers: 0,
        totalRevenue: 0,
        newMembersThisMonth: 0,
        pendingPayments: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        if (!supabase || !isAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch members
            const { data: membersData, error: membersError } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'member')
                .order('created_at', { ascending: false });

            if (membersError) throw membersError;
            setMembers(membersData || []);

            // Calculate stats
            const totalMembers = membersData?.length || 0;

            // Get this month's start date
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const newMembersThisMonth = membersData?.filter(m =>
                new Date(m.created_at) >= monthStart
            ).length || 0;

            // Fetch receipts for revenue
            const { data: receiptsData, error: receiptsError } = await supabase
                .from('receipts')
                .select('total_amount, payment_status');

            if (receiptsError) throw receiptsError;

            const totalRevenue = receiptsData
                ?.filter(r => r.payment_status === 'paid')
                .reduce((sum, r) => sum + Number(r.total_amount), 0) || 0;

            const pendingPayments = receiptsData
                ?.filter(r => r.payment_status === 'pending').length || 0;

            setStats({
                totalMembers,
                activeMembers: Math.round(totalMembers * 0.8), // Approximate
                totalRevenue,
                newMembersThisMonth,
                pendingPayments,
            });

        } catch (err: any) {
            setError(err.message);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [isAdmin]);

    const createNotification = async (notification: {
        user_id?: string;
        title: string;
        message: string;
        type?: 'info' | 'success' | 'warning' | 'error';
        is_global?: boolean;
    }) => {
        if (!supabase || !isAdmin) {
            return { error: 'Not authorized' };
        }

        const { data, error: insertError } = await supabase
            .from('notifications')
            .insert({
                user_id: notification.user_id || null,
                title: notification.title,
                message: notification.message,
                type: notification.type || 'info',
                is_global: notification.is_global || false,
                gym_id: '00000000-0000-0000-0000-000000000001',
            })
            .select()
            .single();

        if (insertError) {
            return { error: insertError.message };
        }

        return { data };
    };

    return {
        members,
        stats,
        loading,
        error,
        refetch: fetchData,
        createNotification,
    };
}

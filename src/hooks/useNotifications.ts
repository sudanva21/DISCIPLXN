import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
    id: string;
    user_id: string | null;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    is_global: boolean;
    link: string | null;
    created_at: string;
}

export function useNotifications() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        if (!supabase || !user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .or(`user_id.eq.${user.id},is_global.eq.true`)
            .order('created_at', { ascending: false })
            .limit(20);

        if (fetchError) {
            setError(fetchError.message);
            setNotifications([]);
        } else {
            setNotifications(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();

        // Set up real-time subscription
        if (!supabase || !user) return;

        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: 'is_global=eq.true',
                },
                (payload) => {
                    setNotifications(prev => [payload.new as Notification, ...prev]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const markAsRead = async (notificationId: string) => {
        if (!supabase) return;

        const { error: updateError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (!updateError) {
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
        }
    };

    const markAllAsRead = async () => {
        if (!supabase || !user) return;

        const { error: updateError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!updateError) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return {
        notifications,
        loading,
        error,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead,
        unreadCount,
    };
}

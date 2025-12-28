import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: 'admin' | 'member' | 'super_admin';
    created_at: string;
    updated_at: string;
}

export function useProfile() {
    const { user, profile: authProfile, refreshProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!supabase || !user) {
            setError('Not authenticated');
            return false;
        }

        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
            return false;
        }

        await refreshProfile();
        setLoading(false);
        return true;
    };

    return {
        profile: authProfile,
        loading,
        error,
        updateProfile,
        refreshProfile,
    };
}

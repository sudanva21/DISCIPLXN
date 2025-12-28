import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define Session type locally since it's not exported from supabase-js
interface Session {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: User;
}

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

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    isDemoMode: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, metadata?: { name?: string; phone?: string }) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing when Supabase is not configured
const DEMO_USERS: Record<string, { password: string; role: 'admin' | 'member' | 'super_admin' }> = {
    'admin@example.com': { password: 'admin123', role: 'admin' },
    'superadmin@example.com': { password: 'super123', role: 'super_admin' },
    'member@example.com': { password: 'member123', role: 'member' },
    'demo@example.com': { password: 'demo123', role: 'member' },
};

// Check if Supabase is properly configured
const isSupabaseConfigured = (): boolean => {
    if (!supabase) return false;
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    // Valid Supabase anon key should start with 'eyJ' (JWT format)
    return !!(url && key && key.startsWith('eyJ'));
};

const createDemoUser = (email: string, role: 'admin' | 'member' | 'super_admin'): User => ({
    id: `demo-${email.replace('@', '-at-').replace('.', '-dot-')}`,
    email,
    app_metadata: {},
    user_metadata: { name: email.split('@')[0] },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
} as User);

const createDemoProfile = (email: string, role: 'admin' | 'member' | 'super_admin'): Profile => ({
    id: `demo-${email.replace('@', '-at-').replace('.', '-dot-')}`,
    email,
    full_name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    phone: null,
    avatar_url: null,
    role,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
});

const createDemoSession = (user: User): Session => ({
    access_token: 'demo-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user,
});

// Storage key for demo session
const DEMO_SESSION_KEY = 'gym_demo_session';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDemoMode] = useState(!isSupabaseConfigured());

    const fetchProfile = async (userId: string, userEmail?: string) => {
        if (!supabase || isDemoMode) return null;

        try {
            // Use maybeSingle() to avoid 406 error when profile doesn't exist
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            // If no profile exists, create one
            if (!data && userEmail) {
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        email: userEmail,
                        full_name: userEmail.split('@')[0],
                        role: 'member',
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error creating profile:', insertError);
                    return null;
                }
                return newProfile as Profile;
            }

            return data as Profile;
        } catch (err) {
            console.error('Error in fetchProfile:', err);
            return null;
        }
    };

    const refreshProfile = async () => {
        if (user && !isDemoMode) {
            const profileData = await fetchProfile(user.id, user.email);
            setProfile(profileData);
        }
    };

    // Initialize auth state
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            // Demo mode initialization
            if (isDemoMode) {
                console.log('🎮 Running in Demo Mode - Supabase not configured or invalid credentials');
                console.log('📝 Demo accounts available:');
                console.log('   - admin@example.com / admin123 (Admin)');
                console.log('   - member@example.com / member123 (Member)');
                console.log('   - demo@example.com / demo123 (Member)');

                // Check for stored demo session
                try {
                    const storedSession = localStorage.getItem(DEMO_SESSION_KEY);
                    if (storedSession) {
                        const { email, role } = JSON.parse(storedSession);
                        const demoUser = createDemoUser(email, role);
                        const demoProfile = createDemoProfile(email, role);
                        const demoSession = createDemoSession(demoUser);

                        if (mounted) {
                            setUser(demoUser);
                            setProfile(demoProfile);
                            setSession(demoSession);
                        }
                    }
                } catch (err) {
                    console.error('Error restoring demo session:', err);
                    localStorage.removeItem(DEMO_SESSION_KEY);
                }

                if (mounted) setLoading(false);
                return;
            }

            // Real Supabase initialization
            if (!supabase) {
                if (mounted) setLoading(false);
                return;
            }

            // Timeout to prevent infinite loading
            const timeoutId = setTimeout(() => {
                if (mounted && loading) {
                    console.warn('Auth initialization timed out - switching to demo mode');
                    setLoading(false);
                }
            }, 5000);

            try {
                const { data: { session: currentSession } } = await supabase.auth.getSession();

                if (!mounted) return;
                clearTimeout(timeoutId);

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    const profileData = await fetchProfile(currentSession.user.id, currentSession.user.email);
                    if (mounted) setProfile(profileData);
                }

                if (mounted) setLoading(false);
            } catch (err) {
                if (!mounted) return;
                clearTimeout(timeoutId);
                console.error('Error getting session:', err);
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes (only if Supabase is configured)
        let subscription: { unsubscribe: () => void } | null = null;

        if (supabase && !isDemoMode) {
            const { data } = supabase.auth.onAuthStateChange(
                async (_event, newSession) => {
                    setSession(newSession);
                    setUser(newSession?.user ?? null);

                    if (newSession?.user) {
                        const profileData = await fetchProfile(newSession.user.id, newSession.user.email);
                        setProfile(profileData);
                    } else {
                        setProfile(null);
                    }

                    setLoading(false);
                }
            );
            subscription = data.subscription;
        }

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [isDemoMode]);

    const signIn = async (email: string, password: string) => {
        // Demo mode sign in
        if (isDemoMode) {
            const normalizedEmail = email.toLowerCase().trim();
            const demoUser = DEMO_USERS[normalizedEmail];

            if (demoUser && demoUser.password === password) {
                const user = createDemoUser(normalizedEmail, demoUser.role);
                const profile = createDemoProfile(normalizedEmail, demoUser.role);
                const session = createDemoSession(user);

                // Store demo session
                localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
                    email: normalizedEmail,
                    role: demoUser.role,
                }));

                setUser(user);
                setProfile(profile);
                setSession(session);

                console.log(`✅ Demo login successful as ${demoUser.role}`);
                return { error: null };
            }

            // Allow any email/password combination in demo mode for testing
            // Default to member role
            const user = createDemoUser(normalizedEmail, 'member');
            const profile = createDemoProfile(normalizedEmail, 'member');
            const session = createDemoSession(user);

            localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
                email: normalizedEmail,
                role: 'member',
            }));

            setUser(user);
            setProfile(profile);
            setSession(session);

            console.log('✅ Demo login successful (new user as member)');
            return { error: null };
        }

        // Real Supabase sign in
        if (!supabase) {
            return { error: new Error('Supabase not configured') };
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, metadata?: { name?: string; phone?: string }) => {
        // Demo mode sign up
        if (isDemoMode) {
            const normalizedEmail = email.toLowerCase().trim();
            const user = createDemoUser(normalizedEmail, 'member');
            const profile: Profile = {
                ...createDemoProfile(normalizedEmail, 'member'),
                full_name: metadata?.name || normalizedEmail.split('@')[0],
                phone: metadata?.phone || null,
            };
            const session = createDemoSession(user);

            localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
                email: normalizedEmail,
                role: 'member',
            }));

            setUser(user);
            setProfile(profile);
            setSession(session);

            console.log('✅ Demo signup successful');
            return { error: null };
        }

        // Real Supabase sign up
        if (!supabase) {
            return { error: new Error('Supabase not configured') };
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: metadata?.name || email.split('@')[0],
                    phone: metadata?.phone || null,
                },
            },
        });
        return { error };
    };

    const signOut = async () => {
        // Demo mode sign out
        if (isDemoMode) {
            localStorage.removeItem(DEMO_SESSION_KEY);
            setUser(null);
            setProfile(null);
            setSession(null);
            console.log('✅ Demo logout successful');
            return;
        }

        // Real Supabase sign out
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            session,
            loading,
            isAdmin,
            isDemoMode,
            signIn,
            signUp,
            signOut,
            refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

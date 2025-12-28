import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export function Login() {
    const navigate = useNavigate();
    const { signIn, user, profile, loading: authLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user && profile) {
            if (profile.role === 'admin' || profile.role === 'super_admin') {
                navigate('/admin');
            } else {
                navigate('/member');
            }
        }
    }, [user, profile, authLoading, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { error } = await signIn(formData.email, formData.password);
            if (error) {
                setError(error.message);
            }
            // Navigation is handled by useEffect when user/profile changes
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="login">
            <div className="login__bg">
                <div className="login__bg-glow login__bg-glow--1" />
                <div className="login__bg-glow login__bg-glow--2" />
            </div>

            <motion.div
                className="login__container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Logo */}
                <Link to="/" className="login__logo">
                    <span className="login__logo-text">DISCIP</span>
                    <span className="login__logo-accent">LXN</span>
                </Link>

                {/* Card */}
                <div className="login__card">
                    <div className="login__header">
                        <h1 className="login__title">Welcome Back</h1>
                        <p className="login__subtitle">Enter your credentials to access the vault</p>
                    </div>

                    <form className="login__form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="login__error">
                                {error}
                            </div>
                        )}

                        <div className="login__field">
                            <label htmlFor="email">Email Address</label>
                            <div className="login__input-wrapper">
                                <Mail className="login__input-icon" size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="login__field">
                            <label htmlFor="password">Password</label>
                            <div className="login__input-wrapper">
                                <Lock className="login__input-icon" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="login__password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="login__options">
                            <label className="login__remember">
                                <input type="checkbox" />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="login__forgot">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary login__submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="login__spinner" />
                            ) : (
                                'Enter the Vault'
                            )}
                        </button>
                    </form>

                    <div className="login__footer">
                        <p>
                            Don't have access?{' '}
                            <Link to="/register" className="login__link">
                                Request Access
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, Phone, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

export function Register() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await signUp(formData.email, formData.password, {
                name: formData.name,
                phone: formData.phone,
            });
            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
                // Wait a moment then redirect to login
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="register">
                <div className="register__bg">
                    <div className="register__bg-glow register__bg-glow--1" />
                    <div className="register__bg-glow register__bg-glow--2" />
                </div>

                <motion.div
                    className="register__container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="register__success">
                        <CheckCircle size={64} className="register__success-icon" />
                        <h2>Registration Successful!</h2>
                        <p>Check your email to verify your account, then login.</p>
                        <p className="register__success-redirect">Redirecting to login...</p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="register">
            <div className="register__bg">
                <div className="register__bg-glow register__bg-glow--1" />
                <div className="register__bg-glow register__bg-glow--2" />
            </div>

            <motion.div
                className="register__container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Logo */}
                <Link to="/" className="register__logo">
                    <span className="register__logo-text">DISCIP</span>
                    <span className="register__logo-accent">LXN</span>
                </Link>

                {/* Card */}
                <div className="register__card">
                    <div className="register__header">
                        <h1 className="register__title">Join the Elite</h1>
                        <p className="register__subtitle">Create your account to enter the system</p>
                    </div>

                    <form className="register__form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="register__error">
                                {error}
                            </div>
                        )}

                        <div className="register__field">
                            <label htmlFor="name">Full Name</label>
                            <div className="register__input-wrapper">
                                <User className="register__input-icon" size={18} />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Smith"
                                    required
                                />
                            </div>
                        </div>

                        <div className="register__field">
                            <label htmlFor="email">Email Address</label>
                            <div className="register__input-wrapper">
                                <Mail className="register__input-icon" size={18} />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="register__field">
                            <label htmlFor="phone">Phone Number</label>
                            <div className="register__input-wrapper">
                                <Phone className="register__input-icon" size={18} />
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    autoComplete="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="register__field">
                            <label htmlFor="password">Password</label>
                            <div className="register__input-wrapper">
                                <Lock className="register__input-icon" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    autoComplete="new-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                    required
                                />
                                <button
                                    type="button"
                                    className="register__password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="register__field">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="register__input-wrapper">
                                <Lock className="register__input-icon" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    autoComplete="new-password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary register__submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="register__spinner" />
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="register__footer">
                        <p>
                            Already have access?{' '}
                            <Link to="/login" className="register__link">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

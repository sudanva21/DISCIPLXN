import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Receipt,
    Bell,
    CreditCard,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Download,
    Eye,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Save,
    Crown,
    Moon,
    Lock,
    Shield,
    Trash2,
    Check,
    Zap,
    Star,
    Dumbbell,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useReceipts } from '../hooks/useReceipts';
import { useNotifications } from '../hooks/useNotifications';
import './MemberDashboard.css';

const navItems = [
    { path: '/member', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/member/plans', icon: Crown, label: 'Plans' },
    { path: '/member/receipts', icon: Receipt, label: 'Receipts' },
    { path: '/member/payments', icon: CreditCard, label: 'Payments' },
    { path: '/member/notifications', icon: Bell, label: 'Notifications' },
    { path: '/member/profile', icon: User, label: 'Profile' },
    { path: '/member/settings', icon: Settings, label: 'Settings' },
];

export function MemberDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, profile } = useAuth();
    const { unreadCount } = useNotifications();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="member-dashboard">
            {/* Sidebar */}
            <aside className={`member-sidebar ${sidebarOpen ? 'member-sidebar--open' : ''}`}>
                <div className="member-sidebar__header">
                    <Link to="/" className="member-sidebar__logo">
                        <span className="member-sidebar__logo-text">DISCIP</span>
                        <span className="member-sidebar__logo-accent">LXN</span>
                    </Link>
                    <button
                        className="member-sidebar__close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="member-sidebar__badge">
                    <span>Member Vault</span>
                </div>

                <nav className="member-sidebar__nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`member-sidebar__link ${location.pathname === item.path ? 'member-sidebar__link--active' : ''
                                }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                            {item.path === '/member/notifications' && unreadCount > 0 && (
                                <span className="member-sidebar__badge-count">{unreadCount}</span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="member-sidebar__footer">
                    <button className="member-sidebar__logout" onClick={handleSignOut}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="member-sidebar__overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="member-main">
                {/* Header */}
                <header className="member-header">
                    <div className="member-header__left">
                        <button
                            className="member-header__menu"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="member-header__title">My Dashboard</h1>
                    </div>

                    <div className="member-header__right">
                        <Link to="/member/notifications" className="member-header__notification">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="member-header__notification-badge">{unreadCount}</span>
                            )}
                        </Link>
                        <div className="member-header__profile">
                            <div className="member-header__avatar">
                                {profile?.full_name?.[0] || profile?.email?.[0] || 'U'}
                            </div>
                            <span>{profile?.full_name || profile?.email?.split('@')[0] || 'User'}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="member-content">
                    <Routes>
                        <Route index element={<MemberHome />} />
                        <Route path="plans" element={<MemberPlans />} />
                        <Route path="receipts" element={<MemberReceipts />} />
                        <Route path="payments" element={<MemberPayments />} />
                        <Route path="notifications" element={<MemberNotifications />} />
                        <Route path="profile" element={<MemberProfile />} />
                        <Route path="settings" element={<MemberSettings />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function MemberHome() {
    const { profile } = useAuth();
    const { receipts, totalPaid, loading: receiptsLoading } = useReceipts();
    const { notifications, loading: notificationsLoading } = useNotifications();

    const memberSince = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString()
        : 'N/A';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Membership Card */}
            <div className="member-card-hero">
                <div className="member-card-hero__bg" />
                <div className="member-card-hero__content">
                    <div className="member-card-hero__header">
                        <div>
                            <span className="member-card-hero__label">Member Status</span>
                            <h2 className="member-card-hero__plan">{profile?.full_name || 'Member'}</h2>
                        </div>
                        <div className="member-card-hero__status member-card-hero__status--active">
                            <CheckCircle size={16} />
                            Active
                        </div>
                    </div>
                    <div className="member-card-hero__info">
                        <div className="member-card-hero__item">
                            <Calendar size={16} />
                            <span>Member since {memberSince}</span>
                        </div>
                        <div className="member-card-hero__item">
                            <User size={16} />
                            <span>{profile?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="member-quick-stats">
                <div className="member-quick-stat">
                    <Receipt size={24} />
                    <div>
                        <div className="member-quick-stat__value">
                            {receiptsLoading ? '...' : receipts.length}
                        </div>
                        <div className="member-quick-stat__label">Total Receipts</div>
                    </div>
                </div>
                <div className="member-quick-stat">
                    <CreditCard size={24} />
                    <div>
                        <div className="member-quick-stat__value">
                            ${receiptsLoading ? '...' : totalPaid.toFixed(2)}
                        </div>
                        <div className="member-quick-stat__label">Total Paid</div>
                    </div>
                </div>
                <div className="member-quick-stat">
                    <Clock size={24} />
                    <div>
                        <div className="member-quick-stat__value">
                            {receiptsLoading ? '...' : receipts.length}
                        </div>
                        <div className="member-quick-stat__label">Months Active</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="member-grid">
                {/* Recent Receipts */}
                <div className="member-card">
                    <div className="member-card__header">
                        <h3 className="member-card__title">Recent Receipts</h3>
                        <Link to="/member/receipts" className="member-card__link">View All</Link>
                    </div>
                    <div className="member-card__content">
                        {receiptsLoading ? (
                            <p style={{ padding: '1rem', color: 'var(--color-grey-light)' }}>Loading...</p>
                        ) : receipts.length === 0 ? (
                            <p style={{ padding: '1rem', color: 'var(--color-grey-light)' }}>No receipts yet</p>
                        ) : (
                            receipts.slice(0, 3).map((receipt) => (
                                <div key={receipt.id} className="member-receipt-item">
                                    <div className="member-receipt-item__info">
                                        <div className="member-receipt-item__id">{receipt.receipt_number}</div>
                                        <div className="member-receipt-item__date">
                                            {new Date(receipt.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="member-receipt-item__amount">${receipt.total_amount}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <div className="member-card">
                    <div className="member-card__header">
                        <h3 className="member-card__title">Notifications</h3>
                        <Link to="/member/notifications" className="member-card__link">View All</Link>
                    </div>
                    <div className="member-card__content">
                        {notificationsLoading ? (
                            <p style={{ padding: '1rem', color: 'var(--color-grey-light)' }}>Loading...</p>
                        ) : notifications.length === 0 ? (
                            <p style={{ padding: '1rem', color: 'var(--color-grey-light)' }}>No notifications</p>
                        ) : (
                            notifications.slice(0, 3).map((notification) => (
                                <div key={notification.id} className={`member-notification-item ${!notification.is_read ? 'member-notification-item--unread' : ''}`}>
                                    <div className={`member-notification-item__icon member-notification-item__icon--${notification.type}`}>
                                        {notification.type === 'success' && <CheckCircle size={16} />}
                                        {notification.type === 'info' && <Bell size={16} />}
                                        {notification.type === 'warning' && <AlertCircle size={16} />}
                                        {notification.type === 'error' && <AlertCircle size={16} />}
                                    </div>
                                    <div className="member-notification-item__content">
                                        <div className="member-notification-item__title">{notification.title}</div>
                                        <div className="member-notification-item__time">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function MemberReceipts() {
    const { receipts, loading } = useReceipts();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="member-page"
        >
            <div className="member-page__header">
                <h2>My Receipts</h2>
            </div>

            {loading ? (
                <p style={{ color: 'var(--color-grey-light)' }}>Loading receipts...</p>
            ) : receipts.length === 0 ? (
                <p style={{ color: 'var(--color-grey-light)' }}>No receipts yet</p>
            ) : (
                <div className="member-receipts-grid">
                    {receipts.map((receipt, index) => (
                        <motion.div
                            key={receipt.id}
                            className="member-receipt-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="member-receipt-card__header">
                                <div className="member-receipt-card__id">{receipt.receipt_number}</div>
                                <span className={`member-receipt-card__status member-receipt-card__status--${receipt.payment_status}`}>
                                    {receipt.payment_status}
                                </span>
                            </div>
                            <div className="member-receipt-card__amount">${receipt.total_amount}</div>
                            <div className="member-receipt-card__plan">{receipt.description || 'Payment'}</div>
                            <div className="member-receipt-card__date">
                                {new Date(receipt.created_at).toLocaleDateString()}
                            </div>
                            <div className="member-receipt-card__actions">
                                <button className="member-receipt-card__btn">
                                    <Eye size={16} />
                                    View
                                </button>
                                <button className="member-receipt-card__btn">
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function MemberPayments() {
    const { receipts, loading } = useReceipts();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="member-page"
        >
            <h2>Payment History</h2>
            <div className="member-card" style={{ marginTop: 'var(--space-6)' }}>
                {loading ? (
                    <p style={{ padding: '2rem', color: 'var(--color-grey-light)' }}>Loading...</p>
                ) : receipts.length === 0 ? (
                    <p style={{ padding: '2rem', color: 'var(--color-grey-light)' }}>No payments yet</p>
                ) : (
                    <table className="member-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipts.map((receipt) => (
                                <tr key={receipt.id}>
                                    <td>{new Date(receipt.created_at).toLocaleDateString()}</td>
                                    <td>{receipt.description || 'Payment'}</td>
                                    <td className="member-table__amount">${receipt.total_amount}</td>
                                    <td>
                                        <span className={`member-status member-status--${receipt.payment_status}`}>
                                            {receipt.payment_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </motion.div>
    );
}

function MemberNotifications() {
    const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="member-page"
        >
            <div className="member-page__header">
                <h2>Notifications</h2>
                {unreadCount > 0 && (
                    <button className="btn btn-ghost" onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <p style={{ color: 'var(--color-grey-light)' }}>Loading...</p>
            ) : notifications.length === 0 ? (
                <p style={{ color: 'var(--color-grey-light)' }}>No notifications</p>
            ) : (
                <div className="member-notifications-list">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`member-notification-card ${!notification.is_read ? 'member-notification-card--unread' : ''}`}
                            onClick={() => !notification.is_read && markAsRead(notification.id)}
                            style={{ cursor: notification.is_read ? 'default' : 'pointer' }}
                        >
                            <div className={`member-notification-card__icon member-notification-card__icon--${notification.type}`}>
                                {notification.type === 'success' && <CheckCircle size={20} />}
                                {notification.type === 'info' && <Bell size={20} />}
                                {notification.type === 'warning' && <AlertCircle size={20} />}
                                {notification.type === 'error' && <AlertCircle size={20} />}
                            </div>
                            <div className="member-notification-card__content">
                                <div className="member-notification-card__header">
                                    <h4 className="member-notification-card__title">{notification.title}</h4>
                                    <span className="member-notification-card__time">
                                        {new Date(notification.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="member-notification-card__message">{notification.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function MemberProfile() {
    const { profile, updateProfile, loading } = useProfile();
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Initialize form with profile data
    useState(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
            });
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        const success = await updateProfile(formData);

        if (success) {
            setMessage('Profile updated successfully!');
        } else {
            setMessage('Failed to update profile');
        }

        setSaving(false);
    };

    if (loading || !profile) {
        return <div style={{ color: 'var(--color-grey-light)' }}>Loading...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="member-page"
        >
            <h2>My Profile</h2>
            <div className="member-card" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-8)' }}>
                <form onSubmit={handleSubmit}>
                    <div className="member-profile">
                        <div className="member-profile__avatar">
                            {profile.full_name?.[0] || profile.email?.[0] || 'U'}
                        </div>
                        <div className="member-profile__info">
                            <h3>{profile.full_name || 'Member'}</h3>
                            <p>{profile.email}</p>
                        </div>
                    </div>

                    {message && (
                        <div style={{
                            padding: 'var(--space-3)',
                            marginBottom: 'var(--space-4)',
                            background: message.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            color: message.includes('success') ? '#22c55e' : 'var(--color-accent)'
                        }}>
                            {message}
                        </div>
                    )}

                    <div className="member-profile__details">
                        <div className="member-profile__item">
                            <label>Full Name</label>
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="member-profile__item">
                            <label>Email</label>
                            <input type="email" value={profile.email} disabled />
                        </div>
                        <div className="member-profile__item">
                            <label>Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                        <div className="member-profile__item">
                            <label>Member Since</label>
                            <input
                                type="text"
                                value={new Date(profile.created_at).toLocaleDateString()}
                                disabled
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ marginTop: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        disabled={saving}
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
}

function MemberSettings() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        theme: 'dark',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        twoFactorAuth: false,
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');

    const handleSettingChange = (key: string, value: boolean | string) => {
        setSettings({ ...settings, [key]: value });
        setMessage('Setting updated!');
        setTimeout(() => setMessage(''), 2000);
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        // In production, call Supabase to update password
        setMessage('Password updated successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // In production, call API to delete account
            signOut();
            navigate('/');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="member-page"
        >
            <h2>Settings</h2>

            {message && (
                <div style={{
                    padding: 'var(--space-3)',
                    marginTop: 'var(--space-4)',
                    background: message.includes('success') || message.includes('updated') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    color: message.includes('success') || message.includes('updated') ? '#22c55e' : 'var(--color-accent)'
                }}>
                    {message}
                </div>
            )}

            {/* Appearance */}
            <div className="member-settings-section">
                <div className="member-settings-section__header">
                    <Moon size={20} />
                    <h3>Appearance</h3>
                </div>
                <div className="member-settings-group">
                    <div className="member-settings-item">
                        <div className="member-settings-item__info">
                            <span className="member-settings-item__label">Theme</span>
                            <span className="member-settings-item__desc">Choose your preferred theme</span>
                        </div>
                        <select
                            value={settings.theme}
                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                            className="member-settings-select"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                    <div className="member-settings-item">
                        <div className="member-settings-item__info">
                            <span className="member-settings-item__label">Language</span>
                            <span className="member-settings-item__desc">Select your language</span>
                        </div>
                        <select
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            className="member-settings-select"
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="member-settings-section">
                <div className="member-settings-section__header">
                    <Bell size={20} />
                    <h3>Notifications</h3>
                </div>
                <div className="member-settings-group">
                    <div className="member-settings-item">
                        <div className="member-settings-item__info">
                            <span className="member-settings-item__label">Email Notifications</span>
                            <span className="member-settings-item__desc">Receive notifications via email</span>
                        </div>
                        <label className="member-settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                            />
                            <span className="member-settings-toggle__slider"></span>
                        </label>
                    </div>
                    <div className="member-settings-item">
                        <div className="member-settings-item__info">
                            <span className="member-settings-item__label">Push Notifications</span>
                            <span className="member-settings-item__desc">Get push notifications in browser</span>
                        </div>
                        <label className="member-settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.pushNotifications}
                                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                            />
                            <span className="member-settings-toggle__slider"></span>
                        </label>
                    </div>
                    <div className="member-settings-item">
                        <div className="member-settings-item__info">
                            <span className="member-settings-item__label">Marketing Emails</span>
                            <span className="member-settings-item__desc">Receive promotional emails</span>
                        </div>
                        <label className="member-settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.marketingEmails}
                                onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                            />
                            <span className="member-settings-toggle__slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="member-settings-section">
                <div className="member-settings-section__header">
                    <Shield size={20} />
                    <h3>Security</h3>
                </div>
                <div className="member-settings-group">
                    <div className="member-settings-item">
                        <div className="member-settings-item__info">
                            <span className="member-settings-item__label">Two-Factor Authentication</span>
                            <span className="member-settings-item__desc">Add an extra layer of security</span>
                        </div>
                        <label className="member-settings-toggle">
                            <input
                                type="checkbox"
                                checked={settings.twoFactorAuth}
                                onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                            />
                            <span className="member-settings-toggle__slider"></span>
                        </label>
                    </div>
                    <div className="member-settings-item">
                        <div className="member-settings-item__info">
                            <span className="member-settings-item__label">Change Password</span>
                            <span className="member-settings-item__desc">Update your password</span>
                        </div>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowPasswordModal(true)}
                            style={{ padding: 'var(--space-2) var(--space-4)' }}
                        >
                            <Lock size={16} />
                            Change
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="member-settings-section member-settings-section--danger">
                <div className="member-settings-section__header">
                    <Trash2 size={20} />
                    <h3>Danger Zone</h3>
                </div>
                <div className="member-settings-group">
                    <div className="member-settings-item">
                        <div className="member-settings-item__info">
                            <span className="member-settings-item__label">Delete Account</span>
                            <span className="member-settings-item__desc">Permanently delete your account and all data</span>
                        </div>
                        <button
                            className="btn member-settings-delete-btn"
                            onClick={handleDeleteAccount}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="member-modal-overlay" onClick={() => setShowPasswordModal(false)}>
                    <div className="member-modal" onClick={e => e.stopPropagation()}>
                        <h3>Change Password</h3>
                        <form onSubmit={handlePasswordChange}>
                            <div className="member-modal__field">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="member-modal__field">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="member-modal__field">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="member-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowPasswordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// Pricing Plans Data
const pricingPlans = [
    {
        id: 'basic',
        name: 'Basic',
        price: 29,
        period: 'month',
        description: 'Perfect for getting started',
        icon: Dumbbell,
        features: [
            'Access to gym equipment',
            'Locker room access',
            'Basic fitness assessment',
            'Mobile app access',
            'Email support',
        ],
        notIncluded: [
            'Personal training sessions',
            'Group fitness classes',
            'Nutrition consultation',
            'Sauna & spa access',
        ],
        color: '#666',
        popular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 59,
        period: 'month',
        description: 'Most popular choice for dedicated athletes',
        icon: Zap,
        features: [
            'Everything in Basic',
            '2 Personal training sessions/month',
            'Unlimited group classes',
            'Nutrition consultation',
            'Priority support',
            'Guest passes (2/month)',
        ],
        notIncluded: [
            'Sauna & spa access',
            '24/7 gym access',
        ],
        color: 'var(--color-accent)',
        popular: true,
    },
    {
        id: 'elite',
        name: 'Elite',
        price: 99,
        period: 'month',
        description: 'Ultimate experience for serious athletes',
        icon: Star,
        features: [
            'Everything in Pro',
            'Unlimited personal training',
            'Sauna & spa access',
            '24/7 gym access',
            'Custom workout plans',
            'Body composition analysis',
            'VIP locker',
            'Towel service',
        ],
        notIncluded: [],
        color: '#fbbf24',
        popular: false,
    },
];

function MemberPlans() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleSubscribe = (planId: string) => {
        setSelectedPlan(planId);
        // In production, redirect to payment gateway
        alert(`Redirecting to payment for ${planId.toUpperCase()} plan...`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="member-page"
        >
            <div className="member-plans-header">
                <h2>Membership Plans</h2>
                <p>Choose the perfect plan for your fitness journey</p>

                {/* Billing Toggle */}
                <div className="member-plans-toggle">
                    <button
                        className={`member-plans-toggle__btn ${billingCycle === 'monthly' ? 'member-plans-toggle__btn--active' : ''}`}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={`member-plans-toggle__btn ${billingCycle === 'yearly' ? 'member-plans-toggle__btn--active' : ''}`}
                        onClick={() => setBillingCycle('yearly')}
                    >
                        Yearly
                        <span className="member-plans-toggle__badge">Save 20%</span>
                    </button>
                </div>
            </div>

            <div className="member-plans-grid">
                {pricingPlans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        className={`member-plan-card ${plan.popular ? 'member-plan-card--popular' : ''} ${selectedPlan === plan.id ? 'member-plan-card--selected' : ''}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        {plan.popular && (
                            <div className="member-plan-card__badge">Most Popular</div>
                        )}

                        <div className="member-plan-card__header">
                            <div className="member-plan-card__icon" style={{ color: plan.color }}>
                                <plan.icon size={32} />
                            </div>
                            <h3 className="member-plan-card__name">{plan.name}</h3>
                            <p className="member-plan-card__desc">{plan.description}</p>
                        </div>

                        <div className="member-plan-card__price">
                            <span className="member-plan-card__currency">$</span>
                            <span className="member-plan-card__amount">
                                {billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price}
                            </span>
                            <span className="member-plan-card__period">/{plan.period}</span>
                        </div>

                        {billingCycle === 'yearly' && (
                            <div className="member-plan-card__savings">
                                You save ${Math.round(plan.price * 12 * 0.2)}/year
                            </div>
                        )}

                        <ul className="member-plan-card__features">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="member-plan-card__feature">
                                    <Check size={16} className="member-plan-card__feature-icon" />
                                    {feature}
                                </li>
                            ))}
                            {plan.notIncluded.map((feature, i) => (
                                <li key={`not-${i}`} className="member-plan-card__feature member-plan-card__feature--disabled">
                                    <X size={16} className="member-plan-card__feature-icon" />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} member-plan-card__btn`}
                            onClick={() => handleSubscribe(plan.id)}
                        >
                            {plan.popular ? 'Get Started' : 'Subscribe'}
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="member-plans-footer">
                <p>All plans include a 7-day free trial. Cancel anytime.</p>
                <p>Need a custom plan? <a href="/contact">Contact us</a></p>
            </div>
        </motion.div>
    );
}

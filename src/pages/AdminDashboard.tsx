import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Receipt,
    Bell,
    BarChart3,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    Search,
    Plus,
    TrendingUp,
    TrendingDown,
    DollarSign,
    UserPlus,
    Send,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAdminData } from '../hooks/useAdminData';
import { useReceipts } from '../hooks/useReceipts';
import { useNotifications } from '../hooks/useNotifications';
import './AdminDashboard.css';

const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/members', icon: Users, label: 'Members' },
    { path: '/admin/receipts', icon: Receipt, label: 'Receipts' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
    { path: '/admin/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminDashboard() {
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
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
                <div className="admin-sidebar__header">
                    <Link to="/" className="admin-sidebar__logo">
                        <span className="admin-sidebar__logo-text">DISCIP</span>
                        <span className="admin-sidebar__logo-accent">LXN</span>
                    </Link>
                    <button
                        className="admin-sidebar__close"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="admin-sidebar__badge">
                    <span>Admin Command</span>
                </div>

                <nav className="admin-sidebar__nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-sidebar__link ${location.pathname === item.path ? 'admin-sidebar__link--active' : ''
                                }`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <button className="admin-sidebar__logout" onClick={handleSignOut}>
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar__overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <div className="admin-header__left">
                        <button
                            className="admin-header__menu"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="admin-header__title">Dashboard</h1>
                    </div>

                    <div className="admin-header__right">
                        <div className="admin-header__search">
                            <Search size={18} />
                            <input type="text" placeholder="Search..." />
                        </div>
                        <Link to="/admin/notifications" className="admin-header__notification">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="admin-header__notification-badge">{unreadCount}</span>
                            )}
                        </Link>
                        <div className="admin-header__profile">
                            <div className="admin-header__avatar">
                                {profile?.full_name?.[0] || 'A'}
                            </div>
                            <span>{profile?.full_name || 'Admin'}</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="admin-content">
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="members" element={<MembersList />} />
                        <Route path="receipts" element={<ReceiptsList />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="schedule" element={<SchedulePage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function DashboardHome() {
    const { stats, members, loading } = useAdminData();
    const { receipts, loading: receiptsLoading } = useReceipts();

    const statsData = [
        { label: 'Total Members', value: stats.totalMembers.toString(), change: '+12%', trend: 'up', icon: Users },
        { label: 'Active This Month', value: stats.activeMembers.toString(), change: '+8%', trend: 'up', icon: TrendingUp },
        { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(0)}`, change: '+23%', trend: 'up', icon: DollarSign },
        { label: 'New Members', value: stats.newMembersThisMonth.toString(), change: '+5%', trend: 'up', icon: UserPlus },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Stats Grid */}
            <div className="admin-stats">
                {statsData.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className="admin-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className="admin-stat-card__header">
                            <div className="admin-stat-card__icon">
                                <stat.icon size={20} />
                            </div>
                            <span className={`admin-stat-card__change admin-stat-card__change--${stat.trend}`}>
                                {stat.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="admin-stat-card__value">
                            {loading ? '...' : stat.value}
                        </div>
                        <div className="admin-stat-card__label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="admin-grid">
                {/* Recent Members */}
                <div className="admin-card">
                    <div className="admin-card__header">
                        <h2 className="admin-card__title">Recent Members</h2>
                        <Link to="/admin/members" className="btn btn-ghost">View All</Link>
                    </div>
                    <div className="admin-table-wrapper">
                        {loading ? (
                            <p style={{ padding: '2rem', color: 'var(--color-grey-light)' }}>Loading...</p>
                        ) : members.length === 0 ? (
                            <p style={{ padding: '2rem', color: 'var(--color-grey-light)' }}>No members yet</p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.slice(0, 5).map((member) => (
                                        <tr key={member.id}>
                                            <td>
                                                <div className="admin-table__member">
                                                    <div className="admin-table__avatar">
                                                        {member.full_name?.[0] || member.email[0]}
                                                    </div>
                                                    <div className="admin-table__name">
                                                        {member.full_name || 'No name'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{member.email}</td>
                                            <td>{new Date(member.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Recent Receipts */}
                <div className="admin-card">
                    <div className="admin-card__header">
                        <h2 className="admin-card__title">Recent Receipts</h2>
                        <Link to="/admin/receipts" className="btn btn-primary admin-card__action">
                            <Plus size={16} />
                            Create
                        </Link>
                    </div>
                    <div className="admin-receipts">
                        {receiptsLoading ? (
                            <p style={{ padding: '1rem', color: 'var(--color-grey-light)' }}>Loading...</p>
                        ) : receipts.length === 0 ? (
                            <p style={{ padding: '1rem', color: 'var(--color-grey-light)' }}>No receipts yet</p>
                        ) : (
                            receipts.slice(0, 4).map((receipt) => (
                                <div key={receipt.id} className="admin-receipt">
                                    <div className="admin-receipt__info">
                                        <div className="admin-receipt__id">{receipt.receipt_number}</div>
                                        <div className="admin-receipt__member">
                                            {new Date(receipt.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="admin-receipt__right">
                                        <div className="admin-receipt__amount">${receipt.total_amount}</div>
                                        <span className={`admin-status admin-status--${receipt.payment_status}`}>
                                            {receipt.payment_status}
                                        </span>
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

function MembersList() {
    const { members, loading } = useAdminData();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="admin-page"
        >
            <div className="admin-page__header">
                <h2>Members Management</h2>
            </div>
            <div className="admin-card">
                <div className="admin-table-wrapper">
                    {loading ? (
                        <p style={{ padding: '2rem', color: 'var(--color-grey-light)' }}>Loading...</p>
                    ) : members.length === 0 ? (
                        <p style={{ padding: '2rem', color: 'var(--color-grey-light)' }}>No members yet</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td>
                                            <div className="admin-table__member">
                                                <div className="admin-table__avatar">
                                                    {member.full_name?.[0] || member.email[0]}
                                                </div>
                                                <div className="admin-table__name">
                                                    {member.full_name || 'No name'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{member.email}</td>
                                        <td>{member.phone || 'N/A'}</td>
                                        <td>{new Date(member.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function ReceiptsList() {
    const { members } = useAdminData();
    const { receipts, loading, createReceipt, refetch } = useReceipts();
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        amount: '',
        description: '',
        payment_method: 'cash',
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        await createReceipt({
            user_id: formData.user_id,
            amount: parseFloat(formData.amount),
            description: formData.description,
            payment_method: formData.payment_method,
        });

        setCreating(false);
        setShowModal(false);
        setFormData({ user_id: '', amount: '', description: '', payment_method: 'cash' });
        refetch();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="admin-page"
        >
            <div className="admin-page__header">
                <h2>Receipts & Billing</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={16} />
                    Create Receipt
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>Create Receipt</h3>
                        <form onSubmit={handleCreate}>
                            <div className="admin-modal__field">
                                <label>Member</label>
                                <select
                                    value={formData.user_id}
                                    onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select member</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.full_name || m.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="admin-modal__field">
                                <label>Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="admin-modal__field">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Monthly membership"
                                />
                            </div>
                            <div className="admin-modal__field">
                                <label>Payment Method</label>
                                <select
                                    value={formData.payment_method}
                                    onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="card">Card</option>
                                    <option value="upi">UPI</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>
                            <div className="admin-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Receipt'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-card">
                <div className="admin-table-wrapper">
                    {loading ? (
                        <p style={{ padding: '2rem', color: 'var(--color-grey-light)' }}>Loading...</p>
                    ) : receipts.length === 0 ? (
                        <p style={{ padding: '2rem', color: 'var(--color-grey-light)' }}>No receipts yet</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Receipt ID</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipts.map((receipt) => (
                                    <tr key={receipt.id}>
                                        <td className="admin-table__id">{receipt.receipt_number}</td>
                                        <td className="admin-table__amount">${receipt.total_amount}</td>
                                        <td>{receipt.payment_method}</td>
                                        <td>{new Date(receipt.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`admin-status admin-status--${receipt.payment_status}`}>
                                                {receipt.payment_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function ReportsPage() {
    const { stats } = useAdminData();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="admin-page"
        >
            <h2>Reports & Analytics</h2>
            <div className="admin-card" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-8)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-dark)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: 'var(--color-grey-light)', fontSize: 'var(--text-sm)' }}>Total Members</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.totalMembers}</div>
                    </div>
                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-dark)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: 'var(--color-grey-light)', fontSize: 'var(--text-sm)' }}>Total Revenue</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>${stats.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-dark)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: 'var(--color-grey-light)', fontSize: 'var(--text-sm)' }}>New This Month</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.newMembersThisMonth}</div>
                    </div>
                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-dark)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ color: 'var(--color-grey-light)', fontSize: 'var(--text-sm)' }}>Pending Payments</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stats.pendingPayments}</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SchedulePage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="admin-page"
        >
            <h2>Gym Schedule</h2>
            <p className="admin-page__placeholder">Schedule management coming soon...</p>
        </motion.div>
    );
}

function NotificationsPage() {
    const { members, createNotification } = useAdminData();
    const [showModal, setShowModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        user_id: '',
        title: '',
        content: '',
        type: 'info' as 'info' | 'success' | 'warning' | 'error',
        is_global: false,
    });

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        const result = await createNotification({
            user_id: formData.is_global ? undefined : formData.user_id,
            title: formData.title,
            message: formData.content,
            type: formData.type,
            is_global: formData.is_global,
        });

        if (result.error) {
            setMessage('Failed to send notification');
        } else {
            setMessage('Notification sent!');
            setShowModal(false);
            setFormData({ user_id: '', title: '', content: '', type: 'info', is_global: false });
        }

        setSending(false);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="admin-page"
        >
            <div className="admin-page__header">
                <h2>Send Notifications</h2>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Send size={16} />
                    Send Notification
                </button>
            </div>

            {message && (
                <div style={{
                    padding: 'var(--space-3)',
                    marginBottom: 'var(--space-4)',
                    background: message.includes('sent') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    color: message.includes('sent') ? '#22c55e' : 'var(--color-accent)'
                }}>
                    {message}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>Send Notification</h3>
                        <form onSubmit={handleSend}>
                            <div className="admin-modal__field">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_global}
                                        onChange={e => setFormData({ ...formData, is_global: e.target.checked })}
                                    />
                                    {' '}Send to all members
                                </label>
                            </div>
                            {!formData.is_global && (
                                <div className="admin-modal__field">
                                    <label>Member</label>
                                    <select
                                        value={formData.user_id}
                                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                        required={!formData.is_global}
                                    >
                                        <option value="">Select member</option>
                                        {members.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.full_name || m.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="admin-modal__field">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="admin-modal__field">
                                <label>Message</label>
                                <textarea
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    required
                                    rows={3}
                                />
                            </div>
                            <div className="admin-modal__field">
                                <label>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                            <div className="admin-modal__actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={sending}>
                                    {sending ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <p className="admin-page__placeholder">
                Use the button above to send notifications to members.
                Notifications will appear in real-time on member dashboards.
            </p>
        </motion.div>
    );
}

function SettingsPage() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="admin-page"
        >
            <h2>Settings</h2>
            <p className="admin-page__placeholder">Settings page coming soon...</p>
        </motion.div>
    );
}

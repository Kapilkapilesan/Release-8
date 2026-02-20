'use client';

import React, { useState } from 'react';
import {
    ArrowLeftRight,
    Building2,
    Clock,
    DollarSign,
    History,
    Search,
    User,
    CheckCircle2,
    XCircle,
    Info,
    Loader2
} from 'lucide-react';
import { branchService } from '@/services/branch.service';
import { customerService } from '@/services/customer.service';
import { collectionService } from '@/services/collection.service';
import { financeService } from '@/services/finance.service';
import { authService } from '@/services/auth.service';
import { toast } from 'react-toastify';
import { ActionConfirmModal } from '../common/ActionConfirmModal';

type OtherBranchCollectionTab = 'other-branch-collection' | 'collection-branch-history';

const OtherBranchCollectionPage: React.FC = () => {
    const user = authService.getCurrentUser();
    const [activeTab, setActiveTab] = useState<OtherBranchCollectionTab>('other-branch-collection');

    // Selection state
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
    const [searchBranch, setSearchBranch] = useState('');
    const [searchCustomer, setSearchCustomer] = useState('');

    // Data state
    const [dues, setDues] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [duesLoading, setDuesLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Modal state
    const [collectModal, setCollectModal] = useState<{ isOpen: boolean; payment: any | null }>({
        isOpen: false,
        payment: null
    });
    const [approveModal, setApproveModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false,
        id: null
    });

    // Fetch branches on mount
    React.useEffect(() => {
        const fetchBranches = async () => {
            try {
                const data = await branchService.getBranchesDropdown();
                setBranches(data || []);
            } catch (error) {
                console.error('Error fetching branches:', error);
            }
        };
        fetchBranches();
    }, []);

    // Fetch customers when branch changes
    React.useEffect(() => {
        if (!selectedBranch) {
            setCustomers([]);
            setSelectedCustomer(null);
            return;
        }

        const fetchCustomers = async () => {
            setLoading(true);
            try {
                const data = await customerService.getCustomers({ branch_id: String(selectedBranch) });
                setCustomers(data || []);
            } catch (error) {
                console.error('Error fetching customers:', error);
                toast.error('Failed to fetch customers for selected branch');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, [selectedBranch]);

    // Fetch dues when customer changes
    React.useEffect(() => {
        if (!selectedCustomer) {
            setDues([]);
            return;
        }

        const fetchDues = async () => {
            setDuesLoading(true);
            try {
                const data = await collectionService.getCustomerDues(selectedCustomer);
                setDues(data.payments || []);
            } catch (error) {
                console.error('Error fetching dues:', error);
                toast.error('Failed to fetch due payments for customer');
            } finally {
                setDuesLoading(false);
            }
        };
        fetchDues();
    }, [selectedCustomer]);

    // Fetch history when tab changes or on mount
    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await financeService.getOtherBranchCollections();
            setHistory(data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'collection-branch-history') {
            fetchHistory();
        }
    }, [activeTab]);

    const handleCollect = async (amount: number) => {
        if (!collectModal.payment || !selectedBranch) return;

        try {
            setLoading(true);
            await financeService.recordOtherBranchCollection({
                collecting_branch_id: user?.branch?.id, // Cashier's branch
                customer_id: collectModal.payment.customerId,
                loan_id: collectModal.payment.id,
                amount: amount,
                date: new Date().toISOString().split('T')[0],
                description: `Other branch collection at ${user?.branch?.name}`
            });

            toast.success('Collection recorded successfully');
            setCollectModal({ isOpen: false, payment: null });

            // Refresh dues
            if (selectedCustomer) {
                const data = await collectionService.getCustomerDues(selectedCustomer);
                setDues(data.payments || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to record collection');

        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!approveModal.id) return;

        try {
            setLoading(true);
            await financeService.approveOtherBranchCollection(approveModal.id);
            toast.success('Collection approved and applied to loan');
            setApproveModal({ isOpen: false, id: null });
            fetchHistory();
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve collection');
        } finally {
            setLoading(false);
        }
    };

    const tabs: { id: OtherBranchCollectionTab; label: string; icon: React.ReactNode }[] = [
        { id: 'other-branch-collection', label: 'Other Branch Collection', icon: <ArrowLeftRight size={16} /> },
        { id: 'collection-branch-history', label: 'Collection Branch History', icon: <History size={16} /> },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'other-branch-collection':
                return (
                    <div className="flex flex-col gap-6">
                        {/* Search Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card rounded-2xl border border-border-default p-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary">Select Branch</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building2 size={18} className="text-text-muted" />
                                    </div>
                                    <select
                                        value={selectedBranch || ''}
                                        onChange={(e) => setSelectedBranch(Number(e.target.value))}
                                        className="w-full bg-input border border-border-default rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                                    >
                                        <option value="">Select a branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.branch_name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin hidden"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-primary">Select Customer</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-text-muted" />
                                    </div>
                                    <select
                                        value={selectedCustomer || ''}
                                        onChange={(e) => setSelectedCustomer(e.target.value)}
                                        disabled={!selectedBranch || loading}
                                        className="w-full bg-input border border-border-default rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{loading ? 'Loading customers...' : 'Select a customer'}</option>
                                        {customers.map((customer) => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.full_name} ({customer.customer_code})
                                            </option>
                                        ))}
                                    </select>
                                    {loading && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <Loader2 size={16} className="text-primary-500 animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <ArrowLeftRight size={20} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Loans for Customer</p>
                                        <p className="text-xl font-bold text-text-primary">{dues.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <DollarSign size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Total Payable</p>
                                        <p className="text-xl font-bold text-text-primary">
                                            LKR {dues.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Clock size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Active Loans</p>
                                        <p className="text-xl font-bold text-text-primary">{dues.filter(d => d.dueAmount > 0).length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-card rounded-2xl border border-border-default overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-default bg-table-header">
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Loan ID / Code</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Field Officer</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Arrears</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Current Due</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Total Payable</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {duesLoading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3 text-text-muted">
                                                    <Loader2 size={40} className="animate-spin opacity-40" />
                                                    <p className="text-sm">Fetching due payments...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : !selectedCustomer ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3 text-text-muted">
                                                    <User size={40} className="opacity-40" />
                                                    <p className="text-sm">Please select a customer to view dues</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : dues.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-text-muted">
                                                No active loans or dues found for this customer
                                            </td>
                                        </tr>
                                    ) : (
                                        dues.map((payment) => (
                                            <tr key={payment.id} className="border-b border-border-default hover:bg-hover transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-text-primary">{payment.contractNo}</span>
                                                        <span className="text-xs text-text-muted">{payment.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-muted">{payment.field_officer}</td>
                                                <td className="px-6 py-4 text-sm text-amber-500 font-medium">LKR {payment.arrears.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-sm text-text-primary">LKR {(payment.dueAmount - payment.arrears).toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4 text-sm text-emerald-500 font-bold">LKR {payment.dueAmount.toLocaleString('en-IN')}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => setCollectModal({ isOpen: true, payment })}
                                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Collect
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'collection-branch-history':
                return (
                    <div className="flex flex-col gap-6">
                        {/* Summary Stats (Kept from current design but integrated) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card rounded-2xl border border-border-default p-4">
                                <p className="text-xs text-text-muted font-medium mb-1">History Records</p>
                                <p className="text-xl font-bold text-text-primary">{history.length}</p>
                            </div>
                            <div className="bg-card rounded-2xl border border-border-default p-4">
                                <p className="text-xs text-text-muted font-medium mb-1">Total Collected</p>
                                <p className="text-xl font-bold text-text-primary">
                                    LKR {history.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div className="bg-card rounded-2xl border border-border-default p-4">
                                <p className="text-xs text-text-muted font-medium mb-1">Pending Approvals</p>
                                <p className="text-xl font-bold text-text-primary">{history.filter(h => h.status === 'Pending').length}</p>
                            </div>
                        </div>

                        <div className="bg-card rounded-2xl border border-border-default overflow-hidden">
                            {/* Table Header with Search */}
                            <div className="p-6 border-b border-border-default flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <Building2 size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-text-primary">Collection History</h2>
                                        <p className="text-xs text-text-muted">Verified collections from other branches</p>
                                    </div>
                                </div>
                                <div className="relative w-full md:w-80">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-text-muted" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search branch or reference..."
                                        className="w-full bg-input border border-border-default rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-default bg-table-header">
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Reference</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Source Branch</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Collection Branch</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider">Collector</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyLoading ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3 text-text-muted">
                                                    <Loader2 size={40} className="animate-spin opacity-40" />
                                                    <p className="text-sm">Loading history...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : history.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center text-text-muted">
                                                No collection history found
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((record) => (
                                            <tr key={record.id} className="border-b border-border-default hover:bg-hover transition-colors">
                                                <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">
                                                    {new Date(record.created_at).toLocaleDateString('en-CA')}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-text-primary">{record.request_id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                                        <Building2 size={14} className="opacity-40" />
                                                        {record.customer_branch?.branch_name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-text-muted">
                                                        <Building2 size={14} className="opacity-40" />
                                                        {record.branch?.branch_name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-text-muted font-medium">
                                                    {record.requested_by_user?.user_name || 'System'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${record.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        record.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500' :
                                                            'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-text-primary font-bold whitespace-nowrap">
                                                    LKR {parseFloat(record.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {record.status === 'Pending' && record.loan?.staff_id === user?.id && (
                                                        <button
                                                            onClick={() => setApproveModal({ isOpen: true, id: record.id })}
                                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase rounded-lg transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-text-primary">Other Branch Collection</h1>
                <p className="text-sm text-text-muted">View and manage collections from other branches and their history</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex bg-card p-1 rounded-xl border border-border-default">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                : 'text-text-muted hover:text-text-primary hover:bg-hover'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Collect Modal */}
            {collectModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border-default shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-border-default bg-hover">
                            <h3 className="text-lg font-bold text-text-primary">Confirm Collection</h3>
                            <p className="text-xs text-text-muted mt-1">Record a collection from another branch</p>
                        </div>

                        <div className="p-6 flex flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div className="flex flex-col gap-1">
                                    <span className="text-text-muted font-medium uppercase tracking-tight opacity-70">Cashier Branch</span>
                                    <span className="text-text-primary font-semibold">{user?.branch?.name || 'My Branch'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-text-muted font-medium uppercase tracking-tight opacity-70">Cashier Name</span>
                                    <span className="text-text-primary font-semibold">{user?.full_name}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-text-muted font-medium uppercase tracking-tight opacity-70">Customer Field Officer</span>
                                    <span className="text-text-primary font-semibold">{collectModal.payment?.field_officer}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-text-muted font-medium uppercase tracking-tight opacity-70">Loan ID</span>
                                    <span className="text-text-primary font-semibold">{collectModal.payment?.contractNo}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-2">
                                <label className="text-sm font-medium text-text-primary">Collection Amount</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-text-muted text-sm">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        defaultValue={collectModal.payment?.dueAmount}
                                        id="collection-amount"
                                        className="w-full bg-input border border-border-default rounded-xl py-3 pl-8 pr-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-hover flex gap-3">
                            <button
                                onClick={() => setCollectModal({ isOpen: false, payment: null })}
                                className="flex-1 px-4 py-2 bg-input border border-border-default text-text-primary text-sm font-semibold rounded-xl hover:bg-card transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const amountStr = (document.getElementById('collection-amount') as HTMLInputElement).value;
                                    const amount = parseFloat(amountStr);
                                    if (isNaN(amount) || amount <= 0) {
                                        toast.error('Please enter a valid amount');
                                        return;
                                    }
                                    handleCollect(amount);
                                }}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-500 transition-colors shadow-lg shadow-primary-900/20 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Processing...</span>
                                    </div>
                                ) : 'Confirm Collection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            <ActionConfirmModal
                isOpen={approveModal.isOpen}
                title="Approve Settlement"
                message="Are you sure you want to approve this collection and apply it to the loan? This will create a payment record in the customer's ledger."
                confirmLabel="Approve Collection"
                variant="success"
                onClose={() => setApproveModal({ isOpen: false, id: null })}
                onConfirm={handleApprove}
            />
        </div>
    );
};

export default OtherBranchCollectionPage;

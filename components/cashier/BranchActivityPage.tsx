'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Activity,
    Building2,
    DollarSign,
    Calendar,
    Search,
    Clock,
    ArrowLeftRight,
    Wallet,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    User,
    Phone,
    FileText,
    Plus,
} from 'lucide-react';
import { branchService } from '@/services/branch.service';
import { staffService } from '@/services/staff.service';
import { financeService } from '@/services/finance.service';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import OtherBranchCollectionPage from './OtherBranchCollectionPage';

// Types
interface BranchOption {
    id: number;
    branch_id: string;
    branch_name: string;
}

interface StaffOption {
    id: string;
    name: string;
    staffId?: string;
    nic?: string;
    phone?: string;
}

type BranchActivityTab = 'branch-daily-activity' | 'other-branch-collection' | 'loan-due-payment';

// === Searchable Select Component ===
interface SearchableSelectProps {
    label: string;
    icon: React.ReactNode;
    placeholder: string;
    options: { value: string; label: string; sublabel?: string }[];
    value: string;
    onChange: (value: string) => void;
    loading?: boolean;
    disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    icon,
    placeholder,
    options,
    value,
    onChange,
    loading = false,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((o) => o.value === value);

    const filtered = options.filter(
        (o) =>
            o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.sublabel && o.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="text-text-muted">{icon}</span>
                <label className="text-sm font-semibold text-text-primary">{label}</label>
            </div>
            <div className="relative" ref={containerRef}>
                <button
                    type="button"
                    onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-sm
                        ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-border-default'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'}
                        bg-card text-text-primary`}
                >
                    <span className={selectedOption ? 'text-text-primary' : 'text-text-muted'}>
                        {loading ? 'Loading...' : selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown size={14} className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-card border border-border-default rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2 border-b border-border-default bg-app-background/50">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    autoFocus
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-card border border-border-default rounded-lg text-text-primary focus:outline-none focus:border-primary-500"
                                />
                            </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {filtered.length === 0 ? (
                                <div className="p-4 text-center text-text-muted text-sm">No results found</div>
                            ) : (
                                filtered.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-hover
                                            ${option.value === value ? 'bg-primary-500/10 text-primary-500 font-medium' : 'text-text-primary'}`}
                                    >
                                        <div>{option.label}</div>
                                        {option.sublabel && (
                                            <div className="text-xs text-text-muted mt-0.5">{option.sublabel}</div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const BranchActivityPage: React.FC = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<BranchActivityTab>('branch-daily-activity');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Form state
    const [type, setType] = useState<'Inflow' | 'Outflow'>('Inflow');
    const [branchId, setBranchId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [staffPhone, setStaffPhone] = useState('');

    // Field options
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [staffs, setStaffs] = useState<StaffOption[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingStaffs, setLoadingStaffs] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [stats, setStats] = useState<any>(null);

    // Loan Dues state
    const [loanDues, setLoanDues] = useState<any[]>([]);
    const [collectionStatus, setCollectionStatus] = useState<'active' | 'settled'>('active');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [settlingId, setSettlingId] = useState<number | null>(null);

    useEffect(() => {
        fetchBranches();
        fetchStaffs();
        fetchRecentActivities();
    }, [date]);

    useEffect(() => {
        if (activeTab === 'loan-due-payment') {
            fetchLoanDues();
        }
    }, [activeTab, collectionStatus, currentPage]);

    const fetchLoanDues = async () => {
        try {
            setLoadingActivities(true);
            const response = await financeService.getUnsettledReceipts(undefined, collectionStatus, currentPage);
            setLoanDues(response.data);
            setPagination(response.meta);
        } catch (err) {
            console.error('Error fetching loan dues', err);
        } finally {
            setLoadingActivities(false);
        }
    };

    const handleSettle = async (receiptId: number) => {
        if (!selectedStaffId) {
            toast.error('Please select a staff member to process settlement');
            return;
        }

        if (!window.confirm('Are you sure you want to settle this receipt?')) return;

        try {
            setSettlingId(receiptId);
            await financeService.settleReceipt(receiptId, selectedStaffId);
            toast.success('Receipt settled successfully');
            fetchLoanDues();
            fetchRecentActivities();
        } catch (err: any) {
            toast.error(err.message || 'Failed to settle receipt');
        } finally {
            setSettlingId(null);
        }
    };

    const fetchRecentActivities = async () => {
        try {
            setLoadingActivities(true);
            const data = await financeService.getBranchTransactions(undefined, date, 'day');
            setRecentActivities(data.activities);
            setStats(data.stats);
        } catch (err) {
            console.error('Error fetching recent activities', err);
        } finally {
            setLoadingActivities(false);
        }
    };

    const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
            const data = await branchService.getBranchesDropdown();
            setBranches(data.map((b: any) => ({
                id: b.id,
                branch_id: b.branch_id,
                branch_name: b.branch_name
            })));
        } catch (err) {
            console.error('Error fetching branches', err);
        } finally {
            setLoadingBranches(false);
        }
    };

    const fetchStaffs = async () => {
        setLoadingStaffs(true);
        try {
            // Updated to use the generic staff list which includes more details
            const data = await staffService.getStaffList();
            setStaffs(data.map((s: any) => ({
                id: s.user_name || s.staff_id, // Use user_name as it's required by the backend
                name: s.full_name || s.name,
                staffId: s.staff_id,
                nic: s.nic,
                phone: s.contact_no || s.personal_mobile || s.office_mobile
            })));
        } catch (err) {
            console.error('Error fetching staffs', err);
        } finally {
            setLoadingStaffs(false);
        }
    };

    // Auto-fetch phone when staff is selected
    useEffect(() => {
        if (selectedStaffId) {
            const staff = staffs.find(s => s.id === selectedStaffId);
            if (staff) {
                setStaffPhone(staff.phone || 'N/A');
            }
        } else {
            setStaffPhone('');
        }
    }, [selectedStaffId, staffs]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branchId || !amount || !selectedStaffId) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const isOutflow = type === 'Outflow';

            const payload = {
                date,
                type: type.toLowerCase(),
                branch_id: parseInt(branchId),
                staff_id: selectedStaffId, // This is user_name now
                amount: parseFloat(amount),
                description,
                expense_type: 'Branch Activity', // Required field
                medium: 'Cash', // Required field
            };

            await financeService.recordExpense(payload);

            if (isOutflow) {
                toast.success('Branch activity request submitted for approval');
            } else {
                toast.success('Branch activity recorded successfully');
            }

            // Reset form
            setAmount('');
            setDescription('');
            setSelectedStaffId('');
            setStaffPhone('');

            // Refresh activities
            fetchRecentActivities();
        } catch (err: any) {
            toast.error(err.message || 'Failed to process activity');
        } finally {
            setSubmitting(false);
        }
    };

    const tabs: { id: BranchActivityTab; label: string; icon: React.ReactNode }[] = [
        { id: 'branch-daily-activity', label: 'Branch Activity', icon: <Activity size={16} /> },
        { id: 'other-branch-collection', label: 'Other Branch Collection', icon: <ArrowLeftRight size={16} /> },
        { id: 'loan-due-payment', label: 'Loan Due Payments', icon: <DollarSign size={16} /> },
    ];

    const branchOptions = branches.map(b => ({
        value: b.id.toString(),
        label: b.branch_name,
        sublabel: b.branch_id
    }));

    const staffOptions = staffs.map(s => ({
        value: s.id,
        label: s.name,
        sublabel: `${s.staffId} • NIC: ${s.nic || 'N/A'}`
    }));

    const renderTabContent = () => {
        switch (activeTab) {
            case 'branch-daily-activity':
                return (
                    <div className="flex flex-col gap-8">
                        {/* Recording Form */}
                        <div className="bg-card rounded-3xl border border-border-default p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                    <Plus size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-text-primary">Record Branch Activity</h2>
                                    <p className="text-sm text-text-muted">Enter details for new branch money activity</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">


                                {/* Type */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Activity size={16} className="text-text-muted" />
                                        <label className="text-sm font-semibold text-text-primary">Type</label>
                                    </div>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as any)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-default bg-app-background text-text-primary text-sm focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="Inflow">Inflow (Money Received)</option>
                                        <option value="Outflow">Outflow (Money Sent)</option>
                                    </select>
                                </div>

                                {/* Branch (Searchable) */}
                                <SearchableSelect
                                    label="Branch"
                                    icon={<Building2 size={16} />}
                                    placeholder="Select a branch"
                                    options={branchOptions}
                                    value={branchId}
                                    onChange={setBranchId}
                                    loading={loadingBranches}
                                />

                                {/* Amount */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} className="text-text-muted" />
                                        <label className="text-sm font-semibold text-text-primary">Amount (LKR)</label>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-default bg-app-background text-text-primary text-sm focus:outline-none focus:border-primary-500"
                                    />
                                </div>

                                {/* Staff (Searchable) - User Requirement 1 */}
                                <SearchableSelect
                                    label="Select Staff"
                                    icon={<User size={16} />}
                                    placeholder="Search by Name, ID or NIC"
                                    options={staffOptions}
                                    value={selectedStaffId}
                                    onChange={setSelectedStaffId}
                                    loading={loadingStaffs}
                                />

                                {/* Mobile No (Auto-fetch) - User Requirement 2 */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Phone size={16} className="text-text-muted" />
                                        <label className="text-sm font-semibold text-text-primary">Mobile Number</label>
                                    </div>
                                    <input
                                        type="text"
                                        readOnly
                                        value={staffPhone}
                                        placeholder="Auto-fetched on staff selection"
                                        className="w-full px-4 py-2.5 rounded-xl border border-border-default bg-muted/30 text-text-secondary text-sm focus:outline-none cursor-not-allowed"
                                    />
                                </div>

                                {/* Description */}
                                <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-text-muted" />
                                        <label className="text-sm font-semibold text-text-primary">Description</label>
                                    </div>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe the activity..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-border-default bg-app-background text-text-primary text-sm focus:outline-none focus:border-primary-500 resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-900/20 disabled:opacity-50"
                                    >
                                        {submitting ? 'Creating...' : 'Create Activity'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Recent Activities List */}
                        <div className="bg-card rounded-3xl border border-border-default overflow-hidden">
                            <div className="px-6 py-4 border-b border-border-default flex justify-between items-center bg-app-background/30">
                                <h3 className="font-bold text-text-primary">Recent Branch Activities</h3>
                                <div className="flex items-center gap-4">
                                    {recentActivities.some(a => a.status === 'Pending') && (
                                        <button
                                            onClick={() => router.push('/cashier/branch-activity-request')}
                                            className="text-[10px] font-black bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-lg hover:bg-amber-500/20 transition-all uppercase tracking-tighter flex items-center gap-2"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            Go to Approvals
                                        </button>
                                    )}
                                    <button
                                        onClick={() => router.push('/cashier/branch-activity-request')}
                                        className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors uppercase tracking-wider"
                                    >
                                        View All Request
                                    </button>
                                </div>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-default bg-table-header">
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">#</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Staff</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Activity Type</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingActivities ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-text-muted text-xs">
                                                Loading activities...
                                            </td>
                                        </tr>
                                    ) : recentActivities.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-text-muted text-xs">
                                                No recent activities found for this date
                                            </td>
                                        </tr>
                                    ) : (
                                        recentActivities.map((activity, idx) => (
                                            <tr key={activity.id} className="border-b border-border-default hover:bg-hover transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-text-primary">{idx + 1}</td>
                                                <td className="px-6 py-4 text-xs text-text-primary">
                                                    {activity.date ? format(new Date(activity.date), 'dd MMM yyyy') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-text-primary">
                                                    {activity.transaction?.user_name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit mb-1 ${activity.type === 'inflow' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                            {activity.type}
                                                        </span>
                                                        <span className="text-xs text-text-muted">{activity.expense_type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-extrabold text-text-primary">
                                                    LKR {Number(activity.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${activity.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        activity.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-rose-500/10 text-rose-500'
                                                        }`}>
                                                        {activity.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'other-branch-collection':
                return <OtherBranchCollectionPage />;

            case 'loan-due-payment':
                return (
                    <div className="flex flex-col gap-6">
                        {/* Status Toggle & Search */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border-default shadow-sm">
                            <div className="flex bg-app-background p-1 rounded-xl border border-border-default">
                                {[
                                    { id: 'active', label: 'Pending Dues' },
                                    { id: 'settled', label: 'Settled History' }
                                ].map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => {
                                            setCollectionStatus(s.id as any);
                                            setCurrentPage(1);
                                        }}
                                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${collectionStatus === s.id ? 'bg-primary-500 text-white shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Processing Staff</p>
                                    <p className="text-xs font-black text-text-primary">{selectedStaffId ? staffs.find(s => s.id === selectedStaffId)?.name : 'None Selected'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-card rounded-3xl border border-border-default overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-default bg-table-header">
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Receipt ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Collector</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Branch</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingActivities ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-text-muted text-xs italic">
                                                Loading loan dues...
                                            </td>
                                        </tr>
                                    ) : loanDues.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center text-text-muted">
                                                <div className="flex flex-col items-center gap-3 opacity-40">
                                                    <DollarSign size={48} />
                                                    <p className="font-bold text-sm">No {collectionStatus} dues found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        loanDues.map((record) => (
                                            <tr key={record.id} className="border-b border-border-default hover:bg-hover transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-black text-text-primary">#{record.receipt_id}</span>
                                                        <span className="text-[10px] text-text-muted">{record.loan_id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-text-primary">{record.staff_name}</span>
                                                        <span className="text-[10px] text-text-muted">{record.staff_id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-text-primary">{record.branch_name}</td>
                                                <td className="px-6 py-4 text-xs font-black text-text-primary">
                                                    LKR {Number(record.amount).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-text-muted">
                                                    {format(new Date(record.created_at), 'dd MMM yyyy')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${record.status === 'settled' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {record.status === 'active' ? (
                                                        <button
                                                            onClick={() => handleSettle(record.id)}
                                                            disabled={settlingId === record.id}
                                                            className="px-6 py-2 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                                        >
                                                            {settlingId === record.id ? 'Settling...' : 'Settle Now'}
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-text-muted uppercase">Processed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {Array.from({ length: pagination.last_page }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-primary-500 text-white' : 'bg-card text-text-muted hover:text-text-primary border border-border-default'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary tracking-tight">Branch Truncation</h1>
                    <p className="text-sm text-text-muted font-medium mt-1">Manage branch activity and loan collections</p>
                </div>

                {/* Date Filters / Grouping */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-card p-1 rounded-xl border border-border-default shadow-sm">
                        {['day', 'month', 'year', 'all'].map((p) => (
                            <button
                                key={p}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${p === 'day' ? 'bg-primary-500 text-white' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-9 pr-3 py-2 text-xs font-bold bg-card border border-border-default rounded-xl text-text-primary focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards Section - Match Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-3xl border border-border-default p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Total Income (day)</p>
                            <TrendingUp size={20} className="text-emerald-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-xs text-text-muted font-bold">LKR</p>
                            <p className="text-3xl font-black text-text-primary tracking-tight">
                                {stats ? Number(stats.total_income).toLocaleString() : '0'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-3xl border border-border-default p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Total Expense (day)</p>
                            <TrendingDown size={20} className="text-rose-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-xs text-text-muted font-bold">LKR</p>
                            <p className="text-3xl font-black text-text-primary tracking-tight">
                                {stats ? Number(stats.total_expense).toLocaleString() : '0'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-3xl border border-border-default p-6 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Net Flow (Cumulative)</p>
                            <Wallet size={20} className="text-blue-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-xs text-text-muted font-bold">LKR</p>
                            <p className="text-3xl font-black text-text-primary tracking-tight">
                                {stats ? Number(stats.net_flow).toLocaleString() : '0'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-3xl border border-border-default p-6 shadow-sm relative overflow-hidden group border-r-primary-500/50">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-purple-500 uppercase tracking-wider">Total Branch Truncation (day)</p>
                            <Activity size={20} className="text-purple-500" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-xs text-text-muted font-bold">LKR</p>
                            <p className="text-3xl font-black text-text-primary tracking-tight">
                                {stats ? Number(stats.total_truncation).toLocaleString() : '0'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation Section */}
            <div className="flex items-center justify-center gap-12 border-b border-border-default pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-sm font-bold transition-all relative pb-4 ${activeTab === tab.id
                            ? 'text-primary-500'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full animate-in fade-in slide-in-from-bottom-2" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Section */}
            <div className="min-h-[400px]">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default BranchActivityPage;


'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    UserPlus,
    ShieldCheck,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    X,
    Building2,
    Search,
    Calendar,
    FileText,
    ChevronDown,
    Eye,
    Trash2,
    AlertCircle,
} from 'lucide-react';
import { branchService } from '@/services/branch.service';
import { staffService } from '@/services/staff.service';
import { toast } from 'react-toastify';

// Types
interface BranchOption {
    id: number;
    branch_id: string;
    branch_name: string;
    location: string;
}

interface CashierOption {
    id: number | string;
    name: string;
    staffId?: string;
    role?: string;
    branch?: string;
}

interface TempCashierRequest {
    id: string;
    requestId: string;
    cashierName: string;
    cashierId: string;
    fromBranch: string;
    toBranch: string;
    toBranchId: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    notes: string;
    status: 'Active' | 'Pending' | 'Expired' | 'Cancelled';
    createdAt: string;
}

type TempCashierTab = 'request-cashier' | 'accept-cashier';

// === Searchable Select Component ===
interface SearchableSelectProps {
    label: string;
    subLabel?: string;
    icon: React.ReactNode;
    placeholder: string;
    searchPlaceholder?: string;
    options: { value: string; label: string; sublabel?: string }[];
    value: string;
    onChange: (value: string) => void;
    loading?: boolean;
    disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    subLabel,
    icon,
    placeholder,
    searchPlaceholder = 'Search...',
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

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="text-text-muted">{icon}</span>
                <div>
                    <label className="text-sm font-semibold text-text-primary">{label}</label>
                    {subLabel && <p className="text-xs text-text-muted">{subLabel}</p>}
                </div>
            </div>
            <div className="relative" ref={containerRef}>
                <button
                    type="button"
                    onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                        ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-border-default'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
                        bg-card text-text-primary`}
                >
                    <span className={selectedOption ? 'text-text-primary' : 'text-text-muted'}>
                        {loading ? 'Loading...' : selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <ChevronDown size={16} className={`text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-card border border-border-default rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-border-default">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-app-background border border-border-default rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500"
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
                                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-hover
                                            ${option.value === value ? 'bg-blue-500/10 text-blue-500 font-medium' : 'text-text-primary'}`}
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

// === Assign Temp Cashier Modal ===
interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TempCashierRequest) => void;
}

const AssignTempCashierModal: React.FC<AssignModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [branches, setBranches] = useState<BranchOption[]>([]);
    const [cashiers, setCashiers] = useState<CashierOption[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingCashiers, setLoadingCashiers] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [selectedBranchId, setSelectedBranchId] = useState('');
    const [selectedCashierId, setSelectedCashierId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');

    // Fetch branches on mount
    useEffect(() => {
        if (isOpen) {
            fetchBranches();
        }
    }, [isOpen]);

    // Fetch cashiers when branch changes
    useEffect(() => {
        if (selectedBranchId) {
            fetchCashiersForBranch(selectedBranchId);
        } else {
            setCashiers([]);
            setSelectedCashierId('');
        }
    }, [selectedBranchId]);

    const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
            const data = await branchService.getBranchesDropdown();
            setBranches(
                data.map((b: any) => ({
                    id: b.id,
                    branch_id: b.branch_id,
                    branch_name: b.branch_name,
                    location: b.location || '',
                }))
            );
        } catch (err) {
            console.error('Error fetching branches:', err);
            toast.error('Failed to load branches');
        } finally {
            setLoadingBranches(false);
        }
    };

    const fetchCashiersForBranch = async (branchId: string) => {
        setLoadingCashiers(true);
        setSelectedCashierId('');
        try {
            const data = await staffService.getUsers('staff', { branch_id: branchId });
            setCashiers(
                data.map((u: any) => ({
                    id: u.id,
                    name: u.name || u.userName || 'Unknown',
                    staffId: u.staffId || u.userName,
                    role: u.role || 'Staff',
                    branch: u.branch || '',
                }))
            );
        } catch (err) {
            console.error('Error fetching cashiers:', err);
            toast.error('Failed to load cashiers');
        } finally {
            setLoadingCashiers(false);
        }
    };

    const resetForm = () => {
        setSelectedBranchId('');
        setSelectedCashierId('');
        setStartDate('');
        setEndDate('');
        setStartTime('');
        setEndTime('');
        setNotes('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!selectedBranchId || !selectedCashierId || !startDate || !endDate || !startTime || !endTime) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            toast.error('End date cannot be before start date');
            return;
        }

        setSubmitting(true);

        try {
            const selectedBranch = branches.find((b) => String(b.id) === selectedBranchId);
            const selectedCashier = cashiers.find((c) => String(c.id) === selectedCashierId);

            const requestId = `REQ${String(Date.now()).slice(-6)}`;

            const newRequest: TempCashierRequest = {
                id: crypto.randomUUID(),
                requestId,
                cashierName: selectedCashier?.name || 'Unknown',
                cashierId: selectedCashier?.staffId || String(selectedCashier?.id),
                fromBranch: 'Current Branch',
                toBranch: selectedBranch?.branch_name || 'Unknown',
                toBranchId: selectedBranch?.id || 0,
                startDate,
                endDate,
                startTime,
                endTime,
                notes,
                status: 'Active',
                createdAt: new Date().toISOString(),
            };

            // Simulate slight delay for UX
            await new Promise((r) => setTimeout(r, 400));

            onSubmit(newRequest);
            toast.success('Temporary cashier assigned successfully!');
            handleClose();
        } catch (err) {
            toast.error('Failed to submit request');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const branchOptions = branches.map((b) => ({
        value: String(b.id),
        label: b.branch_name,
        sublabel: b.location || b.branch_id,
    }));

    const cashierOptions = cashiers.map((c) => ({
        value: String(c.id),
        label: c.name,
        sublabel: `${c.role}${c.branch ? ' • ' + c.branch : ''}`,
    }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-card border border-border-default rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-default">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">Assign Temporary Cashier</h2>
                        <p className="text-xs text-text-muted mt-0.5">Assign a cashier from your branch or another branch temporarily</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-hover transition-colors text-text-muted hover:text-text-primary"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="flex flex-col gap-5">
                        {/* Select Branch */}
                        <SearchableSelect
                            label="Select Branch"
                            subLabel="Select the branch from which to assign a cashier"
                            icon={<Building2 size={16} />}
                            placeholder="Select a branch"
                            searchPlaceholder="Search branches..."
                            options={branchOptions}
                            value={selectedBranchId}
                            onChange={setSelectedBranchId}
                            loading={loadingBranches}
                        />

                        {/* Select Cashier */}
                        <SearchableSelect
                            label="Select Cashier"
                            subLabel="Choose a cashier from the selected branch"
                            icon={<UserPlus size={16} />}
                            placeholder="Select a cashier"
                            searchPlaceholder="Search cashiers..."
                            options={cashierOptions}
                            value={selectedCashierId}
                            onChange={setSelectedCashierId}
                            loading={loadingCashiers}
                            disabled={!selectedBranchId}
                        />

                        {/* Date Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-text-muted" />
                                    <label className="text-sm font-semibold text-text-primary">Start Date</label>
                                </div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border-default bg-card text-text-primary text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-text-muted" />
                                    <label className="text-sm font-semibold text-text-primary">End Date</label>
                                </div>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="w-full px-4 py-3 rounded-xl border border-border-default bg-card text-text-primary text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Time Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-text-muted" />
                                    <label className="text-sm font-semibold text-text-primary">Start Time</label>
                                </div>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border-default bg-card text-text-primary text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-text-muted" />
                                    <label className="text-sm font-semibold text-text-primary">End Time</label>
                                </div>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-border-default bg-card text-text-primary text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-text-muted" />
                                <label className="text-sm font-semibold text-text-primary">Notes (Optional)</label>
                            </div>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any additional notes or instructions..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-border-default bg-card text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-5 py-2.5 rounded-xl border border-border-default text-text-primary text-sm font-medium hover:bg-hover transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={submitting || !selectedBranchId || !selectedCashierId || !startDate || !endDate || !startTime || !endTime}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// === View Details Modal ===
interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: TempCashierRequest | null;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ isOpen, onClose, request }) => {
    if (!isOpen || !request) return null;

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (timeStr: string) => {
        try {
            const [h, m] = timeStr.split(':');
            const hr = parseInt(h);
            const ampm = hr >= 12 ? 'PM' : 'AM';
            const hr12 = hr % 12 || 12;
            return `${hr12}:${m} ${ampm}`;
        } catch {
            return timeStr;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md mx-4 bg-card border border-border-default rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-default">
                    <h2 className="text-lg font-bold text-text-primary">Request Details</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-hover transition-colors text-text-muted hover:text-text-primary">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-text-muted font-medium">Request ID</p>
                            <p className="text-sm font-semibold text-text-primary mt-1">{request.requestId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted font-medium">Status</p>
                            <span className={`inline-block mt-1 px-2.5 py-1 text-xs font-bold rounded-full ${request.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                                request.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                    request.status === 'Expired' ? 'bg-gray-500/10 text-gray-400' :
                                        'bg-rose-500/10 text-rose-500'
                                }`}>{request.status}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-text-muted font-medium">Cashier</p>
                            <p className="text-sm text-text-primary mt-1">{request.cashierName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted font-medium">Cashier ID</p>
                            <p className="text-sm text-text-primary mt-1">{request.cashierId}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-text-muted font-medium">From Branch</p>
                            <p className="text-sm text-text-primary mt-1">{request.fromBranch}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted font-medium">To Branch</p>
                            <p className="text-sm text-text-primary mt-1">{request.toBranch}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-text-muted font-medium">Period</p>
                            <p className="text-sm text-text-primary mt-1">{formatDate(request.startDate)} – {formatDate(request.endDate)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted font-medium">Time</p>
                            <p className="text-sm text-text-primary mt-1">{formatTime(request.startTime)} – {formatTime(request.endTime)}</p>
                        </div>
                    </div>

                    {request.notes && (
                        <div>
                            <p className="text-xs text-text-muted font-medium">Notes</p>
                            <p className="text-sm text-text-primary mt-1 bg-app-background rounded-lg p-3 border border-border-default">{request.notes}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end px-6 py-4 border-t border-border-default">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border-default text-text-primary text-sm font-medium hover:bg-hover transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


// === Main Component ===
const TempCashierPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TempCashierTab>('request-cashier');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TempCashierRequest | null>(null);
    const [requests, setRequests] = useState<TempCashierRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const tabs: { id: TempCashierTab; label: string; icon: React.ReactNode }[] = [
        { id: 'request-cashier', label: 'Request Cashier', icon: <UserPlus size={16} /> },
        { id: 'accept-cashier', label: 'Accept Cashier', icon: <ShieldCheck size={16} /> },
    ];

    const handleAddRequest = (newRequest: TempCashierRequest) => {
        setRequests((prev) => [newRequest, ...prev]);
    };

    const handleCancelRequest = (id: string) => {
        setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' as const } : r))
        );
        toast.info('Request cancelled');
    };

    const handleViewDetails = (request: TempCashierRequest) => {
        setSelectedRequest(request);
        setShowViewModal(true);
    };

    const formatDuration = (req: TempCashierRequest) => {
        const formatDate = (d: string) => {
            try {
                return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
            } catch {
                return d;
            }
        };
        const formatTime = (t: string) => {
            try {
                const [h, m] = t.split(':');
                const hr = parseInt(h);
                const ampm = hr >= 12 ? 'PM' : 'AM';
                const hr12 = hr % 12 || 12;
                return `${hr12}:${m} ${ampm}`;
            } catch {
                return t;
            }
        };
        return `${formatDate(req.startDate)} ${formatTime(req.startTime)} - ${formatTime(req.endTime)}`;
    };

    const filteredRequests = requests.filter(
        (r) =>
            r.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.toBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.fromBranch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Stats
    const totalRequests = requests.length;
    const activeRequests = requests.filter((r) => r.status === 'Active').length;
    const pendingRequests = requests.filter((r) => r.status === 'Pending').length;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'request-cashier':
                return (
                    <div className="flex flex-col gap-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <UserPlus size={20} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Total Requests</p>
                                        <p className="text-xl font-bold text-text-primary">{totalRequests}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                        <Clock size={20} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Pending</p>
                                        <p className="text-xl font-bold text-text-primary">{pendingRequests}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Active</p>
                                        <p className="text-xl font-bold text-text-primary">{activeRequests}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search requests..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-default bg-card text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowAssignModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                            >
                                <Plus size={16} />
                                Assign Temp Cashier
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-card rounded-2xl border border-border-default overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-default bg-table-header">
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Request ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Cashier</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">From Branch</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">To Branch</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <UserPlus size={40} className="text-text-muted opacity-40" />
                                                    <p className="text-text-muted text-sm">
                                                        {searchTerm ? 'No matching requests found' : 'No cashier requests yet. Click "Assign Temp Cashier" to create one.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((req) => (
                                            <tr key={req.id} className="border-b border-border-default hover:bg-hover transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-text-primary">{req.requestId}</td>
                                                <td className="px-6 py-4 text-sm text-text-primary">{req.cashierName}</td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{req.fromBranch}</td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{req.toBranch}</td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{formatDuration(req)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${req.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        req.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                                            req.status === 'Expired' ? 'bg-gray-500/10 text-gray-400' :
                                                                'bg-rose-500/10 text-rose-500'
                                                        }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(req)}
                                                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {req.status === 'Active' && (
                                                            <button
                                                                onClick={() => handleCancelRequest(req.id)}
                                                                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                                                                title="Cancel"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'accept-cashier':
                return (
                    <div className="flex flex-col gap-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                        <ShieldCheck size={20} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Pending Acceptance</p>
                                        <p className="text-xl font-bold text-text-primary">
                                            {requests.filter((r) => r.status === 'Pending').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Approved</p>
                                        <p className="text-xl font-bold text-text-primary">
                                            {requests.filter((r) => r.status === 'Active').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-card rounded-2xl border border-border-default p-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                        <XCircle size={20} className="text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-muted font-medium">Rejected</p>
                                        <p className="text-xl font-bold text-text-primary">
                                            {requests.filter((r) => r.status === 'Cancelled').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-card rounded-2xl border border-border-default overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border-default bg-table-header">
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Request ID</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Cashier</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">From Branch</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">To Branch</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Duration</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <ShieldCheck size={40} className="text-text-muted opacity-40" />
                                                    <p className="text-text-muted text-sm">No incoming cashier requests</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => (
                                            <tr key={req.id} className="border-b border-border-default hover:bg-hover transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-text-primary">{req.requestId}</td>
                                                <td className="px-6 py-4 text-sm text-text-primary">{req.cashierName}</td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{req.fromBranch}</td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{req.toBranch}</td>
                                                <td className="px-6 py-4 text-sm text-text-secondary">{formatDuration(req)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${req.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        req.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' :
                                                            req.status === 'Expired' ? 'bg-gray-500/10 text-gray-400' :
                                                                'bg-rose-500/10 text-rose-500'
                                                        }`}>
                                                        {req.status === 'Active' ? 'Approved' : req.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleViewDetails(req)}
                                                        className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
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
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-text-primary">Temp Cashier</h1>
                <p className="text-sm text-text-muted">Manage temporary cashier assignments across branches</p>
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

            {/* Modals */}
            <AssignTempCashierModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSubmit={handleAddRequest}
            />

            <ViewDetailsModal
                isOpen={showViewModal}
                onClose={() => { setShowViewModal(false); setSelectedRequest(null); }}
                request={selectedRequest}
            />
        </div>
    );
};

export default TempCashierPage;

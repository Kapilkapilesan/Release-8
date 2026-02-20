import React, { useState, useEffect } from 'react';
import { Complaint, ComplaintFormData } from '@/types/complaint.types';
import { branchService } from '@/services/branch.service';
import { staffService } from '@/services/staff.service';
import { authService } from '@/services/auth.service';
import { toast } from 'react-toastify';

interface NewComplaintModalProps {
    onClose: () => void;
    onSubmit: (data: ComplaintFormData) => void;
    initialData?: Complaint;
}

const CATEGORIES = [
    'Loan Processing',
    'System Issue',
    'HR Issue',
    'Service Quality',
    'Other'
];

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({ onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<ComplaintFormData>({
        complainantType: initialData?.complainantType || 'Customer',
        complainant: initialData?.complainant || '',
        branch: initialData?.branch || '',
        category: initialData?.category || '',
        priority: initialData?.priority || 'Medium',
        assignedTo: initialData?.assignedTo || '',
        assigneeId: initialData?.assigneeId || '',
        subject: initialData?.subject || '',
        description: initialData?.description || '',
        branchId: initialData?.branch_id ? String(initialData.branch_id) : ''
    });

    const [branches, setBranches] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [fetchedBranches, fetchedUsers] = await Promise.all([
                    branchService.getBranchesDropdown(),
                    staffService.getUsersList() // Use new lightweight dropdown endpoint
                ]);
                setBranches(fetchedBranches);
                setStaffList(fetchedUsers);
            } catch (error) {
                console.error("Failed to load dropdown data", error);
            }
        };
        loadData();
    }, []);

    const handleSubmit = () => {
        if (!formData.complainant.trim() || !formData.subject.trim() || !formData.description.trim() || !formData.branchId || !formData.category) {
            toast.warning('Please fill in all required fields');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border-default">

                {/* Header: Distinctive Gradient Border */}
                <div className="p-6 border-b border-border-divider bg-table-header">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black text-text-primary flex items-center gap-3">
                                <span className="p-2.5 bg-primary-600 rounded-xl text-white shadow-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </span>
                                {initialData ? 'Update Complaint Details' : 'Register New Complaint'}
                            </h2>
                            <p className="text-sm text-text-muted mt-2 ml-14 font-medium italic">
                                {initialData ? `Editing ticket #${initialData.ticketNo}` : 'Provide details to log a formal ticket in the system.'}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-hover rounded-full transition-colors text-text-muted">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Body: Organized Sections */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">

                    {/* Section 1: Source & Identity */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-primary-600 rounded-full" />
                            Origin Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Complainant Type</label>
                                <select
                                    value={formData.complainantType}
                                    onChange={(e) => setFormData({ ...formData, complainantType: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-input border border-border-input rounded-xl focus:ring-2 transition-all outline-none text-sm font-bold text-text-primary"
                                >
                                    <option>Customer</option>
                                    <option>Staff</option>
                                    <option>Branch</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Complainant Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={formData.complainant}
                                    onChange={(e) => setFormData({ ...formData, complainant: e.target.value })}
                                    className="w-full px-4 py-3 bg-input border border-border-input rounded-xl focus:ring-2 transition-all outline-none text-sm font-bold text-text-primary placeholder:text-text-muted/40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Classification */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-primary-600 rounded-full" />
                            Categorization
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Branch</label>
                                <select
                                    value={formData.branchId}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedBranch = branches.find(b => String(b.id) === selectedId);
                                        setFormData({
                                            ...formData,
                                            branchId: selectedId,
                                            branch: selectedBranch ? selectedBranch.branch_name : ''
                                        });
                                    }}
                                    className="w-full px-4 py-3 bg-input border border-border-input rounded-xl focus:ring-2 transition-all outline-none text-sm font-bold text-text-primary"
                                >
                                    <option value="" disabled>Select...</option>
                                    {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-input border border-border-input rounded-xl focus:ring-2 transition-all outline-none text-sm font-bold text-text-primary"
                                >
                                    <option value="" disabled>Select...</option>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Priority</label>
                                <div className="relative">
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all outline-none text-sm font-black appearance-none ${formData.priority === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 focus:ring-rose-500/20' :
                                                formData.priority === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 focus:ring-amber-500/20' :
                                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 focus:ring-emerald-500/20'
                                            }`}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-text-muted">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Content */}
                    <div className="space-y-4 pt-2">
                        <h3 className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-primary-600 rounded-full" />
                            Assignment & Message
                        </h3>
                        <div className="space-y-5">
                            {authService.hasPermission('complaints.assign') && (
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Assign To Personnel</label>
                                    <select
                                        value={formData.assigneeId || ''}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            const selectedUser = staffList.find(u => u.id == selectedId);
                                            setFormData({ ...formData, assigneeId: selectedId, assignedTo: selectedUser ? selectedUser.name : '' });
                                        }}
                                        className="w-full px-4 py-3 bg-input border border-border-input rounded-xl focus:ring-2 transition-all outline-none text-sm font-bold text-text-primary"
                                    >
                                        <option value="" disabled>Select Internal Staff Member</option>
                                        {staffList.filter(user => user.id !== authService.getCurrentUser()?.id).map((user) => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Subject</label>
                                <input
                                    type="text"
                                    placeholder="Enter a descriptive headline"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 bg-input border border-border-input rounded-xl focus:ring-2 transition-all outline-none text-sm font-bold text-text-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-text-muted uppercase tracking-widest ml-1">Detailed Description</label>
                                <textarea
                                    rows={4}
                                    placeholder="Explain the issue in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-input border border-border-input rounded-2xl focus:ring-2 transition-all outline-none text-sm font-medium text-text-primary resize-none placeholder:italic"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Floating Effect */}
                <div className="p-6 bg-table-header border-t border-border-divider flex gap-4 justify-end items-center">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-text-muted font-black text-xs uppercase tracking-widest hover:text-text-primary transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-700 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                        {initialData ? 'Update Ticket' : 'Register Complaint'}
                    </button>
                </div>
            </div>
        </div>
    );
};
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Complaint, ComplaintFormData } from '@/types/complaint.types';
import { complaintService } from '@/services/complaint.service';
import { ComplaintsTable } from './list/ComplaintsTable';
import { NewComplaintModal } from './modal/NewComplaintModal';
import { ViewComplaintModal } from './modal/ViewComplaintModal';
import { Pagination } from '@/components/common/Pagination';
import { toast } from 'react-toastify';
import { authService } from '@/services/auth.service';
import { colors } from '@/themes/colors';

interface ComplaintsProps {
    readOnly?: boolean;
}

export default function Complaints({ readOnly = false }: ComplaintsProps) {
    const canCreate = authService.hasPermission('complaints.create');
    const canManageAll = authService.hasPermission('complaints.manage') || authService.hasPermission('complaints.view_all');
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
    const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const [statusCounts, setStatusCounts] = useState({
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
    });

    const fetchComplaints = async () => {
        setIsLoading(true);
        try {
            const { data, meta } = await complaintService.getComplaints(searchTerm, filterStatus, currentPage, itemsPerPage);
            setComplaints(data);
            if (meta) {
                setTotalItems(meta.total || 0);
                if (meta.counts) {
                    setStatusCounts({
                        open: meta.counts.open,
                        inProgress: meta.counts.in_progress,
                        resolved: meta.counts.resolved,
                        closed: meta.counts.closed
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, itemsPerPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchComplaints();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus, currentPage, itemsPerPage]);

    const handleCreateComplaint = async (formData: ComplaintFormData) => {
        try {
            if (editingComplaint) {
                const success = await complaintService.updateComplaint(editingComplaint.id, formData);
                if (success) {
                    fetchComplaints();
                    setEditingComplaint(null);
                    setShowModal(false);
                    toast.success('Complaint updated successfully');
                }
            } else {
                const newComplaint = await complaintService.createComplaint(formData);
                if (newComplaint) {
                    fetchComplaints();
                    setShowModal(false);
                    toast.success('Complaint created successfully');
                }
            }
        } catch (error: any) {
            toast.error(error.message || (editingComplaint ? 'Failed to update complaint' : 'Failed to create complaint'));
        }
    };

    const handleStatusChange = async (complaintId: string, newStatus: Complaint['status']) => {
        try {
            await complaintService.updateStatus(complaintId, newStatus);
            setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
            if (viewingComplaint && viewingComplaint.id === complaintId) {
                setViewingComplaint({ ...viewingComplaint, status: newStatus });
            }
            fetchComplaints();
            toast.success(`Status updated to ${newStatus}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleFeedbackUpdate = async (complaintId: string, feedback: string) => {
        try {
            await complaintService.updateFeedback(complaintId, feedback);
            setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, feedback } : c));
            if (viewingComplaint && viewingComplaint.id === complaintId) {
                setViewingComplaint({ ...viewingComplaint, feedback });
            }
            toast.success('Feedback updated successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update feedback');
        }
    };

    const handleDeleteComplaint = async (complaint: Complaint) => {
        try {
            const success = await complaintService.deleteComplaint(complaint.id);
            if (success) {
                toast.success('Complaint deleted successfully');
                fetchComplaints();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete complaint');
        }
    };



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Complaints Management</h1>
                    <p className="text-sm text-text-muted mt-1 font-medium italic">Track and resolve customer complaints</p>
                </div>
                {canCreate && !readOnly && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg font-bold text-sm active:scale-95 hover:scale-105"
                        style={{
                            backgroundImage: `linear-gradient(to right, ${colors.primary[600]}, ${colors.primary[400]})`
                        }}
                    >
                        <Plus className="w-5 h-5" />
                        New Complaint
                    </button>
                )}
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border-default hover:border-red-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-text-muted">Open</p>
                    </div>
                    <p className="text-3xl font-black text-text-primary">{statusCounts.open}</p>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border-default hover:border-primary-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center border border-primary-500/20"
                            style={{ backgroundColor: `${colors.primary[600]}15` }}
                        >
                            <Clock className="w-5 h-5" style={{ color: colors.primary[600] }} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-text-muted">In Progress</p>
                    </div>
                    <p className="text-3xl font-black text-text-primary">{statusCounts.inProgress}</p>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-border-default hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-text-muted">Resolved</p>
                    </div>
                    <p className="text-3xl font-black text-text-primary">{statusCounts.resolved}</p>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-sm border border-border-default hover:border-bg-muted/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-muted-bg/10 rounded-xl flex items-center justify-center border border-border-divider">
                            <CheckCircle className="w-5 h-5 text-text-muted" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-text-muted">Closed</p>
                    </div>
                    <p className="text-3xl font-black text-text-primary">{statusCounts.closed}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border-default">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-input border border-border-input rounded-xl focus:ring-2 transition-all text-text-primary outline-none"
                            style={{ '--tw-ring-color': `${colors.primary[500]}33` } as any}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-input border border-border-input rounded-xl focus:ring-2 transition-all text-text-primary outline-none min-w-[160px]"
                        style={{ '--tw-ring-color': `${colors.primary[500]}33` } as any}
                    >
                        <option value="all">All Status</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-card rounded-xl shadow-sm border border-border-default overflow-hidden">
                <ComplaintsTable
                    complaints={complaints}
                    onView={setViewingComplaint}
                    onStatusChange={handleStatusChange}
                    onEdit={(complaint) => {
                        setEditingComplaint(complaint);
                        setShowModal(true);
                    }}
                    onDelete={handleDeleteComplaint}
                />

                <div className="bg-card border-t border-border-divider">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemName="complaints"
                    />
                </div>
            </div>

            {/* Modals */}
            {showModal && (
                <NewComplaintModal
                    initialData={editingComplaint || undefined}
                    onClose={() => {
                        setShowModal(false);
                        setEditingComplaint(null);
                    }}
                    onSubmit={handleCreateComplaint}
                />
            )}

            {viewingComplaint && (
                <ViewComplaintModal
                    complaint={viewingComplaint}
                    onClose={() => setViewingComplaint(null)}
                    onStatusChange={handleStatusChange}
                    onFeedbackUpdate={handleFeedbackUpdate}
                />
            )}
        </div>
    );
}

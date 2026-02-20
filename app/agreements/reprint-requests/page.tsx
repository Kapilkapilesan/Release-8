"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    RefreshCw,
    User,
    Calendar,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Search,
    AlertTriangle
} from "lucide-react";
import { toast } from "react-toastify";
import { loanAgreementService, LoanAgreement, LoanWithAgreement } from "@/services/loanAgreement.service";

export default function ReprintRequestsPage() {
    const [requests, setRequests] = useState<(LoanAgreement & { loan: LoanWithAgreement })[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<(LoanAgreement & { loan: LoanWithAgreement }) | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const response = await loanAgreementService.getPendingReprints({
                page: currentPage,
                per_page: 15
            });
            setRequests(response.data);
            setTotalPages(response.meta.last_page);
            setTotal(response.meta.total);
        } catch (error: any) {
            toast.error(error.message || "Failed to load reprint requests");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id: number) => {
        if (!confirm("Are you sure you want to approve this reprint request?")) return;

        try {
            setActionLoading(id);
            await loanAgreementService.approveReprint(id);
            toast.success("Reprint request approved");
            fetchRequests();
            if (showDetailModal) setShowDetailModal(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to approve request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Are you sure you want to reject this reprint request?")) return;

        try {
            setActionLoading(id);
            await loanAgreementService.rejectReprint(id);
            toast.success("Reprint request rejected");
            fetchRequests();
            if (showDetailModal) setShowDetailModal(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to reject request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewDetail = (request: LoanAgreement & { loan: LoanWithAgreement }) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-7 h-7 text-amber-600" />
                        Reprint Approvals
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Review and approve requests to reprint loan agreements
                    </p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Loan / Contract
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Requested By
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Requested Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center">
                                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                                        <p className="text-gray-500">Loading requests...</p>
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle className="w-12 h-12 text-green-500/50" />
                                            <p>No pending reprint requests</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {request.loan.contract_number}
                                            </div>
                                            <div className="text-xs text-gray-500">ID: {request.loan.loan_id}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {request.loan.customer?.full_name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {request.loan.customer?.customer_code}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {request.reprint_requested_by_user?.full_name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {request.reprint_requested_at ? new Date(request.reprint_requested_at).toLocaleString() : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate" title={request.reprint_reason || ''}>
                                                {request.reprint_reason}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(request)}
                                                    className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleApprove(request.loan_id)}
                                                    disabled={actionLoading === request.loan_id}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.loan_id)}
                                                    disabled={actionLoading === request.loan_id}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing page {currentPage} of {totalPages} ({total} total)
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reprint Request Details</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-2">Reason for Reprint</h3>
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedRequest.reprint_reason}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Contract Number</p>
                                    <p className="font-semibold">{selectedRequest.loan.contract_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Customer</p>
                                    <p className="font-semibold">{selectedRequest.loan.customer?.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Requested By</p>
                                    <p className="font-semibold">{selectedRequest.reprint_requested_by_user?.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase">Requested Date</p>
                                    <p className="font-semibold">{new Date(selectedRequest.reprint_requested_at!).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleReject(selectedRequest.loan_id)}
                                disabled={actionLoading === selectedRequest.loan_id}
                                className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleApprove(selectedRequest.loan_id)}
                                disabled={actionLoading === selectedRequest.loan_id}
                                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors shadow-lg shadow-green-600/20"
                            >
                                Approve Reprint
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

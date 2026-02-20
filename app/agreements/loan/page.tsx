"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    FileText,
    Search,
    Eye,
    Printer,
    Lock,
    Unlock,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    RefreshCw,
    Download,
    ChevronLeft,
    ChevronRight,
    Filter,
    User,
    Calendar,
    DollarSign,
    Building2
} from "lucide-react";
import { toast } from "react-toastify";
import { loanAgreementService, LoanWithAgreement } from "@/services/loanAgreement.service";
import { authService } from "@/services/auth.service";

type PrintStatus = 'all' | 'printed' | 'not_printed' | 'pending_reprint';

export default function LoanAgreementPage() {
    const [loans, setLoans] = useState<LoanWithAgreement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [printStatus, setPrintStatus] = useState<PrintStatus>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedLoan, setSelectedLoan] = useState<LoanWithAgreement | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showReprintModal, setShowReprintModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [reprintReason, setReprintReason] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchLoans = useCallback(async () => {
        try {
            setLoading(true);
            const response = await loanAgreementService.getLoans({
                search,
                print_status: printStatus,
                page: currentPage,
                per_page: 15
            });
            setLoans(response.data);
            setTotalPages(response.meta.last_page);
            setTotal(response.meta.total);
        } catch (error: any) {
            toast.error(error.message || "Failed to load loan agreements");
        } finally {
            setLoading(false);
        }
    }, [search, printStatus, currentPage]);

    useEffect(() => {
        fetchLoans();
    }, [fetchLoans]);

    const handleView = async (loan: LoanWithAgreement) => {
        try {
            const response = await loanAgreementService.getLoan(loan.id);
            setSelectedLoan(response.data);
            setShowViewModal(true);
        } catch (error: any) {
            toast.error(error.message || "Failed to load loan details");
        }
    };

    const handlePrintRequest = async (loan: LoanWithAgreement) => {
        // Check if locked and needs reprint request
        if (loan.agreement?.is_locked && !loan.agreement?.reprint_approved) {
            setSelectedLoan(loan);
            setShowReprintModal(true);
            return;
        }

        // Show preview first
        setSelectedLoan(loan);
        setShowPreviewModal(true);
    };

    const handleActualDownload = async () => {
        if (!selectedLoan) return;

        try {
            setActionLoading(selectedLoan.id);
            await loanAgreementService.downloadAgreement(selectedLoan.id);
            toast.success("Loan agreement downloaded successfully");
            setShowPreviewModal(false);
            fetchLoans(); // Refresh to show updated print status
        } catch (error: any) {
            toast.error(error.message || "Failed to download agreement");
        } finally {
            setActionLoading(null);
            setSelectedLoan(null);
        }
    };

    const handleRequestReprint = async () => {
        if (!selectedLoan || !reprintReason.trim()) {
            toast.error("Please provide a reason for the reprint request");
            return;
        }

        try {
            setActionLoading(selectedLoan.id);
            await loanAgreementService.requestReprint(selectedLoan.id, reprintReason);
            toast.success("Reprint request submitted. Awaiting manager approval.");
            setShowReprintModal(false);
            setReprintReason("");
            setSelectedLoan(null);
            fetchLoans();
        } catch (error: any) {
            toast.error(error.message || "Failed to submit reprint request");
        } finally {
            setActionLoading(null);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm("Are you sure you want to approve this reprint request?")) return;
        try {
            setActionLoading(id);
            await loanAgreementService.approveReprint(id);
            toast.success("Reprint request approved");
            fetchLoans();
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
            fetchLoans();
        } catch (error: any) {
            toast.error(error.message || "Failed to reject request");
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (loan: LoanWithAgreement) => {
        const agreement = loan.agreement;

        if (!agreement || !agreement.is_printed) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    <FileText className="w-3 h-3" />
                    Not Printed
                </span>
            );
        }

        if (agreement.reprint_requested && !agreement.reprint_approved) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    Reprint Pending
                </span>
            );
        }

        if (agreement.reprint_approved) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <Unlock className="w-3 h-3" />
                    Reprint Approved
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <Lock className="w-3 h-3" />
                Printed ({agreement.print_count}x)
            </span>
        );
    };

    const canPrint = (loan: LoanWithAgreement): boolean => {
        const agreement = loan.agreement;
        if (!agreement || !agreement.is_printed) return true;
        if (agreement.is_locked && agreement.reprint_approved) return true;
        return false;
    };

    const getPrintButtonState = (loan: LoanWithAgreement) => {
        const agreement = loan.agreement;

        if (!agreement || !agreement.is_printed) {
            return { text: "Print", icon: <Printer className="w-4 h-4" />, variant: "primary" };
        }

        if (agreement.reprint_requested && !agreement.reprint_approved) {
            return { text: "Pending", icon: <Clock className="w-4 h-4" />, variant: "disabled" };
        }

        if (agreement.reprint_approved) {
            return { text: "Reprint", icon: <RefreshCw className="w-4 h-4" />, variant: "success" };
        }

        return { text: "Request Reprint", icon: <Lock className="w-4 h-4" />, variant: "warning" };
    };

    const handlePrintPreview = () => {
        const printContent = document.getElementById('preview-pages-container');
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Loan Agreement - ${selectedLoan?.contract_number}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        @media print {
                            body { background: white !important; }
                            .no-print { display: none !important; }
                            .preview-page { 
                                margin: 0 !important; 
                                shadow: none !important; 
                                border: none !important;
                                width: 100% !important;
                                page-break-after: always;
                            }
                        }
                        body { background: #f3f4f6; padding: 20px; font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }
                        #preview-pages-container { display: flex; flex-direction: column; gap: 30px; align-items: center; }
                        .preview-page { 
                            background: white; 
                            width: 210mm; 
                            min-height: 297mm; 
                            padding: 60px; 
                            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                            position: relative;
                            box-sizing: border-box;
                        }
                    </style>
                </head>
                <body>
                    <div id="preview-pages-container">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = () => {
                            setTimeout(() => {
                                window.print();
                            }, 1000);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-7 h-7 text-primary-600" />
                        Loan Agreements
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Print loan agreements for approved loans
                    </p>
                </div>
                <button
                    onClick={fetchLoans}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by loan ID, contract number, or customer name..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Print Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={printStatus}
                            onChange={(e) => {
                                setPrintStatus(e.target.value as PrintStatus);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Status</option>
                            <option value="not_printed">Not Printed</option>
                            <option value="printed">Printed</option>
                            <option value="pending_reprint">Pending Reprint</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Contract No.
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Agreement Date
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Print Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Printed By
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                                            <p className="text-gray-500">Loading...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : loans.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                            <p className="text-gray-500 dark:text-gray-400">No approved loans found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                loans.map((loan) => {
                                    const btnState = getPrintButtonState(loan);
                                    return (
                                        <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {loan.contract_number}
                                                </div>
                                                <div className="text-xs text-gray-500">ID: {loan.loan_id}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {loan.customer?.full_name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {loan.customer?.customer_code}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    Rs. {Number(loan.approved_amount || loan.request_amount).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {loan.terms} weeks
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {loan.agreement_date ? new Date(loan.agreement_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(loan)}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">
                                                {loan.agreement?.printed_by_user?.full_name || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleView(loan)}
                                                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>

                                                    {loan.agreement?.reprint_requested && !loan.agreement?.reprint_approved && authService.hasPermission('loan_agreements.approve_reprint') && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(loan.id)}
                                                                disabled={actionLoading === loan.id}
                                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg transition-colors"
                                                                title="Approve Reprint"
                                                            >
                                                                <CheckCircle className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(loan.id)}
                                                                disabled={actionLoading === loan.id}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                                title="Reject Reprint"
                                                            >
                                                                <XCircle className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => handlePrintRequest(loan)}
                                                        disabled={actionLoading === loan.id || (btnState.variant === 'disabled' && !authService.hasPermission('loan_agreements.approve_reprint'))}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${btnState.variant === 'primary'
                                                            ? 'bg-primary-600 hover:bg-primary-700 text-white'
                                                            : btnState.variant === 'success'
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : btnState.variant === 'warning'
                                                                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            } ${actionLoading === loan.id ? 'opacity-50' : ''}`}
                                                    >
                                                        {actionLoading === loan.id ? (
                                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            btnState.icon
                                                        )}
                                                        {btnState.text}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Showing page {currentPage} of {totalPages} ({total} total)
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {showViewModal && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Loan Agreement Details
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setSelectedLoan(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                            {/* Loan Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase">Contract Number</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedLoan.contract_number}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase">Agreement Date</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {selectedLoan.agreement_date ? new Date(selectedLoan.agreement_date).toLocaleDateString() : '-'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase">Loan Amount</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        Rs. {Number(selectedLoan.approved_amount || selectedLoan.request_amount).toLocaleString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 uppercase">Terms</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">{selectedLoan.terms} weeks</p>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Customer Details
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Full Name</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.customer?.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">NIC</p>
                                        <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.customer?.customer_code}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Joint Borrower */}
                            {selectedLoan.guardian_name && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Joint Borrower</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Full Name</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.guardian_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">NIC</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedLoan.guardian_nic}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Print History */}
                            {selectedLoan.agreement && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Printer className="w-4 h-4" />
                                        Print History
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status</span>
                                            {getStatusBadge(selectedLoan)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Print Count</span>
                                            <span className="font-medium">{selectedLoan.agreement.print_count}x</span>
                                        </div>
                                        {selectedLoan.agreement.printed_at && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Last Printed</span>
                                                <span className="font-medium">
                                                    {new Date(selectedLoan.agreement.printed_at).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selectedLoan.agreement.printed_by_user && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Printed By</span>
                                                <span className="font-medium">{selectedLoan.agreement.printed_by_user.full_name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedLoan(null);
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    handlePrintRequest(selectedLoan);
                                }}
                                disabled={!canPrint(selectedLoan)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-4 h-4" />
                                Download Agreement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reprint Request Modal */}
            {showReprintModal && selectedLoan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <Lock className="w-5 h-5 text-amber-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Request Reprint
                                </h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-700 dark:text-amber-300">
                                        <p className="font-medium">This agreement has already been printed.</p>
                                        <p className="mt-1">To print again, you need manager approval. Please provide a reason for the reprint request.</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Reason for Reprint *
                                </label>
                                <textarea
                                    value={reprintReason}
                                    onChange={(e) => setReprintReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Enter the reason for reprinting..."
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowReprintModal(false);
                                    setReprintReason("");
                                    setSelectedLoan(null);
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestReprint}
                                disabled={!reprintReason.trim() || actionLoading === selectedLoan.id}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {actionLoading === selectedLoan.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Clock className="w-4 h-4" />
                                )}
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Print Preview Modal */}
            {showPreviewModal && selectedLoan && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                    <Printer className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Document Preview
                                    </h2>
                                    <p className="text-xs text-gray-500">Verify details before downloading</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrintPreview}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-primary-600"
                                    title="Print Documents"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPreviewModal(false);
                                        setSelectedLoan(null);
                                    }}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Multi-Page Scrolling Preview */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-200 dark:bg-gray-900">
                            <div className="flex flex-col gap-8 items-center max-w-[850px] mx-auto">

                                {/* Page 1: Tamil Agreement & Check List (Mimics Image 2) */}
                                <div className="w-full bg-white dark:bg-gray-800 shadow-xl border border-gray-300 dark:border-gray-700 p-12 font-serif text-gray-900 dark:text-gray-100 min-h-[1050px] relative">
                                    {/* Main Header */}
                                    <div className="text-center mb-10 pt-4">
                                        <div className="absolute top-12 left-12 w-20 h-20 opacity-20">
                                            <img src="/bms-logo-verified.png" alt="BMS Logo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="absolute top-12 right-12 text-right text-[10px] font-bold">
                                            <div className="border border-gray-800 px-6 py-1 mb-1">
                                                {Number(selectedLoan.approved_amount || selectedLoan.request_amount).toLocaleString()}/=
                                            </div>
                                            <p>PN0007</p>
                                        </div>
                                        <h1 className="text-xl font-bold mb-1">உறுதிப்பத்திரம்</h1>
                                        <div className="w-24 h-0.5 bg-gray-400 mx-auto mt-2"></div>
                                    </div>

                                    {/* Top Amount Box */}
                                    <div className="flex justify-center mb-10">
                                        <div className="border border-gray-800 dark:border-gray-500 px-10 py-2 min-w-[180px] text-center">
                                            <p className="text-[10px] mb-1">ரூபாய்</p>
                                            <p className="text-lg font-bold">
                                                Rs. {Number(selectedLoan.approved_amount || selectedLoan.request_amount).toLocaleString()}/=
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Grid */}
                                    <div className="grid grid-cols-12 gap-8 mb-6">
                                        <div className="col-span-4 space-y-6 text-[11px]">
                                            <div>
                                                <p className="font-bold border-b border-gray-300 pb-0.5 mb-1 text-[10px]">1. கடனாக பெற்ற மொத்த தொகை</p>
                                                <p>ரூபாய்</p>
                                                <p className="font-bold">Rs. {Number(selectedLoan.approved_amount || selectedLoan.request_amount).toLocaleString()}/=</p>
                                            </div>
                                            <div>
                                                <p className="font-bold border-b border-gray-300 pb-0.5 mb-1 text-[10px]">2. வருட வட்டி நூற்றுக்கு வீதம்</p>
                                                <p className="font-bold">{selectedLoan.interest_rate_annum || selectedLoan.interest_rate || '21'}%</p>
                                            </div>
                                            <div>
                                                <p className="font-bold border-b border-gray-300 pb-0.5 mb-1 text-[10px]">3. கிழமைக்கு ஒரு தடவை தவணை</p>
                                                <p>ரூபாய்</p>
                                                <p className="font-bold">Rs. {Number(selectedLoan.rentel || 0).toLocaleString()}/=</p>
                                            </div>
                                            <div className="pt-4">
                                                <p className="font-bold border-b border-gray-300 pb-0.5 mb-1 text-[10px]">4. கையொப்பம்</p>
                                                <div className="mt-8 border-b border-dotted border-gray-800 w-full"></div>
                                            </div>
                                        </div>

                                        <div className="col-span-8 text-[11px] leading-relaxed space-y-4">
                                            <div className="text-right italic mb-2">
                                                {new Date().getFullYear()} ஆண்டு {new Date().getMonth() + 1} மாதம் {new Date().getDate()} திகதியன்று
                                            </div>

                                            <p className="leading-relaxed">
                                                கீழே கையொப்பமிடும் <span className="font-bold underline tracking-wide">{selectedLoan.customer?.full_name || '................................'}</span> ஆகிய நான் இன்றைய தினம் இலங்கையில் செல்லுபடியாகும் பணத்தில் ரூபாய் <span className="font-bold">{Number(selectedLoan.approved_amount).toLocaleString()}</span>/= கடனாக கேட்டு பெற்றுக்கொண்டேன்.
                                            </p>

                                            <p className="leading-relaxed">
                                                அத்தொகையை பி.எம்.எஸ் கேப்பிட்டல் சொல்யூசன்ஸ் நிறுவனத்திற்கு ஆண்டுக்கு நூற்றுக்கு <span className="font-bold">{selectedLoan.interest_rate_annum || selectedLoan.interest_rate || '21'}%</span> வீதம் வட்டியுடன் செலுத்த உறுதி கூறுகின்றேன்.
                                            </p>

                                            <div className="pt-6 space-y-4">
                                                <p className="font-bold underline text-[10px]">சாட்சிகள்</p>
                                                <div className="ml-4 space-y-4">
                                                    <div>
                                                        <p>1. {selectedLoan.w1_details?.name || '................................'}</p>
                                                        <div className="mt-1 border-b border-dotted border-gray-400 w-32"></div>
                                                    </div>
                                                    <div>
                                                        <p>2. {selectedLoan.w2_details?.name || '................................'}</p>
                                                        <div className="mt-1 border-b border-dotted border-gray-400 w-32"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-10 text-right space-y-1">
                                                <p className="font-bold text-[10px]">கடன்பெற்றோரின் கையொப்பம்</p>
                                                <p className="text-[8px] italic mr-2">மேற்கூறிய சகல பிரிவுகளையும் வாசித்து விளங்கிக்கொண்ட பின்னர் கையொப்பமிட்டேன்.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Checklist Table */}
                                    <p className="text-[10px] font-bold mb-1 text-center">BMS Capital Solutions - Micro Loan Documentation Check List</p>
                                    <div className="flex justify-between items-center text-[9px] mb-2 px-1">
                                        <span>Contract No: {selectedLoan.contract_number}</span>
                                        <span>Landing Specialist: {selectedLoan.staff?.full_name}</span>
                                    </div>
                                    <table className="w-full border-collapse border border-gray-800 text-[9px]">
                                        <thead>
                                            <tr className="bg-gray-50 uppercase">
                                                <th className="border border-gray-800 px-1 py-1 w-8">No</th>
                                                <th className="border border-gray-800 px-2 py-1 text-left">Description</th>
                                                <th className="border border-gray-800 px-2 py-1 w-24">Status</th>
                                                <th className="border border-gray-800 px-2 py-1 w-24">Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                "Loan Application",
                                                "Loan Request Letter, Loan Estimate",
                                                "NIC Copy Of The Borrower",
                                                "NIC Copy Of The Joint Borrower",
                                                "Copy Of Proof Of The Permanent Address",
                                                "Bank Book Copy",
                                                "Promissory Note",
                                                "Loan Agreement",
                                                "Deduction Letter",
                                                "Product Statement",
                                                "Business Place 2 Photographs",
                                                "Crib Of The Borrower, Joint Borrower"
                                            ].map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="border border-gray-800 px-1 py-1 text-center font-bold">{idx + 1}</td>
                                                    <td className="border border-gray-800 px-2 py-1">{item}</td>
                                                    <td className="border border-gray-800 px-2 py-1 text-center whitespace-nowrap">Available In The File</td>
                                                    <td className="border border-gray-800 px-2 py-1 text-center whitespace-nowrap font-bold">( YES / NO )</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="mt-4 flex justify-between items-end text-[9px] px-2 italic">
                                        <div className="pt-2">CHECKED BY (SIGNATURE) ........................................</div>
                                        <div>Name ........................................</div>
                                        <div>Date .................</div>
                                    </div>

                                    {/* Footer Placeholder */}
                                    <div className="absolute bottom-8 left-12 right-12 flex justify-between items-end border-t border-gray-200 pt-3 opacity-40">
                                        <div className="text-[9px]">
                                            <p className="font-bold">BMS Capital Solutions</p>
                                            <p>Contract No: {selectedLoan.contract_number}</p>
                                        </div>
                                        <div className="text-[9px] text-right">
                                            <p>Printed By: {authService.getCurrentUser()?.full_name}</p>
                                            <p>{new Date().toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Page 2: Deduction Letter (Mimics Image 0) */}
                                <div className="w-full bg-white dark:bg-gray-800 shadow-xl border border-gray-300 dark:border-gray-700 p-16 font-serif text-gray-900 dark:text-gray-100 min-h-[1050px] relative">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-24 h-24">
                                            <img src="/bms-logo-verified.png" alt="BMS Logo" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="text-right text-sm">
                                            <p className="font-bold">CustomerNo : {selectedLoan.customer?.customer_code}</p>
                                        </div>
                                    </div>

                                    <div className="mb-12">
                                        <p className="font-bold uppercase mb-1">{selectedLoan.customer?.full_name || '................................'}</p>
                                        <p className="max-w-[400px]">{selectedLoan.customer?.address_line_1 || '................'}, {selectedLoan.customer?.address_line_2 || '................'}, {selectedLoan.customer?.city || '................'},</p>
                                    </div>

                                    <div className="mb-8 font-bold">
                                        {new Date().toLocaleDateString('en-GB')}
                                    </div>

                                    <div className="space-y-1 mb-8">
                                        <p>The Manager</p>
                                        <p className="font-bold uppercase">BMS CAPITAL SOLUTIONS (PVT) LTD</p>
                                    </div>

                                    <div className="space-y-6 text-sm leading-relaxed">
                                        <p className="font-bold">Dear Sir,</p>
                                        <p className="text-center font-bold underline">Service charges Deduction with consent to deduct Document charges at BMS</p>

                                        <p>
                                            Further to my Agreement No <span className="font-bold underline">{selectedLoan.contract_number}</span> entered in to by me with you on {new Date().toLocaleDateString('en-GB')} to obtain a loan of sum Rupees ............................................................ (Rs {Number(selectedLoan.approved_amount).toLocaleString()} /=).
                                        </p>

                                        <p>
                                            I do hereby give my consent and request to deduct a sum of Rupees ............................................................ from the loan amount as a Service charges and sum of Rs.1000/= as documentation charges.
                                        </p>

                                        <div className="pt-12 flex justify-between items-start">
                                            <div className="space-y-8">
                                                <div>
                                                    <p>Thank you</p>
                                                    <p>Yours Faith fully</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="border-t border-dotted border-gray-400 pt-1">NIC No. {selectedLoan.customer?.customer_code}</p>
                                                </div>
                                            </div>
                                            <div className="w-64 text-[11px]">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between"><span>Loan Amount</span> <span>:- {Number(selectedLoan.approved_amount).toLocaleString()}/=</span></div>
                                                    <div className="flex justify-between"><span>Service Charges</span> <span>:- {Number(selectedLoan.service_charge).toLocaleString()}/=</span></div>
                                                    <div className="flex justify-between"><span>Document Charges</span> <span>:- 1000/=</span></div>
                                                    <div className="flex justify-between font-bold pt-1 border-t border-gray-400"><span>Less(-)</span> <span>:- .................... /=</span></div>
                                                    <div className="flex justify-between font-bold"><span>Cash Amount</span> <span>:- .................... /=</span></div>
                                                    <div className="pt-4 mt-4 border-t border-dotted border-gray-400">
                                                        <p className="text-[9px]">.................... /= ...........................................................</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-12 left-16 text-[10px] opacity-40">
                                        <p>Contract No: {selectedLoan.contract_number}</p>
                                    </div>
                                </div>

                                {/* Page 3: English Loan Agreement */}
                                <div className="w-full bg-white dark:bg-gray-800 shadow-xl border border-gray-300 dark:border-gray-700 p-16 font-serif text-gray-900 dark:text-gray-100 min-h-[1050px] text-[10px] leading-relaxed relative">
                                    <div className="text-center mb-6 space-y-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-16 h-16">
                                                <img src="/bms-logo-verified.png" alt="BMS Logo" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="border border-gray-400 p-2 text-[8px] max-w-[250px] text-left">
                                                <p className="uppercase tracking-tighter">CHECKED BY (SIGNATURE) ........................................ Name ........................................ Date ...........</p>
                                            </div>
                                        </div>
                                        <h2 className="font-bold underline text-xs uppercase">LOAN AGREEMENT {selectedLoan.contract_number}</h2>
                                    </div>

                                    <div className="space-y-3">
                                        <p>
                                            <span className="font-bold uppercase">BMS CAPITAL SOLUTIONS (PVT) LTD</span> bearing Registration No. PV 00315823 a company duly-incorporated in Sri Lanka and having its registered office at Chankanai in the Democratic Socialist Republic of Sri Lanka (hereinafter sometimes referred as the Company, which term or expression as herein used shall where the context so requires or admits mean and include the said BMS CAPITAL SOLUTIONS (PVT) LTD its successors in office and assigns)
                                        </p>
                                        <p className="text-center font-bold">AND</p>
                                        <p>
                                            <span className="font-bold uppercase">{selectedLoan.customer?.full_name || '................................'}</span> (Holder of National Identity Card No {selectedLoan.customer?.customer_code || '................'}) of {selectedLoan.customer?.address_line_1 || '................'}, {selectedLoan.customer?.city || '................'} in the Democratic Socialist Republic of Sri Lanka, (hereinafter sometimes referred to as the Debtor, which term or expression as herein used shall where the context so requires or admits mean and include the said Debtor his /her/its heirs executors, administrators and grantees.
                                        </p>

                                        <p className="text-center font-bold">AND</p>
                                        <p>
                                            <span className="font-bold uppercase">{selectedLoan.guardian_name || '................................'}</span> (Holder of National Identity Card No {selectedLoan.guardian_nic || '................'}) of {selectedLoan.guardian_address || '................'} in the Democratic Socialist Republic of Sri Lanka, (hereinafter sometimes referred to as the JONT Borrower, which term or expression as herein used shall where the context so requires or admits mean and include the said JONT Borrower his/her/its heirs executors, administrators and grantees.
                                        </p>

                                        <p className="text-center font-bold uppercase">GUARANTORS</p>
                                        <p>
                                            <span className="font-bold uppercase">{selectedLoan.g1_details?.name || '................................'}</span> (Holder of National Identity Card No {selectedLoan.g1_details?.nic || '................'}) of {selectedLoan.g1_details?.address || '................'} in the Democratic Socialist Republic of Sri Lanka, (hereinafter sometimes referred to as the First Guarantor).
                                        </p>
                                        <p className="text-center font-bold">AND</p>
                                        <p>
                                            <span className="font-bold uppercase">{selectedLoan.g2_details?.name || '................................'}</span> (Holder of National Identity Card No {selectedLoan.g2_details?.nic || '................'}) of {selectedLoan.g2_details?.address || '................'} in the Democratic Socialist Republic of Sri Lanka, (hereinafter sometimes referred to as the Second Guarantor).
                                        </p>

                                        <div className="w-full h-px bg-gray-200 my-4"></div>

                                        <p>
                                            {selectedLoan.customer?.full_name || '................'} being the Debtor has requested of Loan Sum of Rupees ............................................................ from the Company and the Company has agreed to grant this request under the terms and conditions set out fully hereinafter and under the Guarantee set out hereinafter.
                                        </p>

                                        <ul className="list-none space-y-2 mt-2">
                                            <li className="flex gap-2">
                                                <span>a.</span>
                                                <p>The Company agrees to grant this loan sum of Rupees ............................................................ (Rs {Number(selectedLoan.approved_amount).toLocaleString()}/=) to the Debtor under and terms and conditions of this legal document.</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <span>b.</span>
                                                <p>The Debtor agrees promises and accepts to repay the said loan and interest thereon in Weekly installments as per the Schedule hereof. The Debtor should pay to the Company the installments, every Weekly regularly commencing from {new Date().toLocaleDateString('en-GB')} on the day the office is opened or on the previous day as per the schedule hereto.</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <span>c.</span>
                                                <p>If the Debtor fails to pay the said Weekly installment during the period the agreement is operative, an 5% per month of an additional interest should be paid to the Company as a default interest for default of installments.</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <span>d.</span>
                                                <p>The Debtor should undertake to pay all dues, such as registration fee, tax insurance premium, penalty payments etc to relevant local government institution, as levied by them.</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <span>e.</span>
                                                <p>If the Debtor contravenes the terms and the conditions in the agreement, the Company will abrogate the agreement, after giving seven (07) days notice, in writing.</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <span>f.</span>
                                                <p>After the abrogation of the agreement by the Company, the Debtor should pay all payments due, inclusive of the interest, penalties etc, within 14 days from the date of abrogation of the agreement.</p>
                                            </li>
                                            <li className="flex gap-2">
                                                <span>g.</span>
                                                <p>The Debtor and the Guarantors have agreed to act in the following manner with regard to the said Loan.</p>
                                            </li>
                                        </ul>

                                        <div className="space-y-4 pt-4 border-t border-gray-100 mt-4">
                                            <p>I. The said Debtor and his/her/their Guarantors, should sign a promissory note, promising and accepting to repay the amount, interest and the defaulted interest, if any and hand it over to the Company.</p>
                                            <p>II. The Guarantors unconditionally and irrevocably hereby guarantees the repayment of the aforesaid loan by the Debtor on the due date together with interest thereon as afore stated and the performance of the terms and conditions herein. In no circumstances shall the guarantee stand discharged unless the repayment of the loan amount together with agreed interest thereon is made in full.</p>
                                            <p>III. In order to give effect to the guarantee hereby given the Guarantors hereby expressly declares and agrees with the Company.</p>
                                            <div className="pl-6 space-y-2">
                                                <p>1. that the Guarantors will be liable in all respects as principle debtor to the extent aforementioned including the liability to be sued before recourse is had against the debtor.</p>
                                                <p>2. that the Company shall be at liberty either in one action to sue the debtor and the Guarantors jointly and severally or to proceed against the debtor in the First instance.</p>
                                                <p>3. to renounce the rights to claim that the Guarantors should be excused and the debtor should be proceeded against by action in the first instance.</p>
                                                <p>4. That the said guarantee shall not or become in any way prejudiced affected or unenforceable either wholly or any part by reason of any fact matter or circumstances concerning the debtor or any other person or concerning the account or conduct or any transaction of or with the debtor or any other person whether such fact matter or circumstances be known to or at any time come to the knowledge of the Company or not and whether or not the same be disclosed by the Company to the Guarantors.</p>
                                            </div>
                                        </div>

                                        <p className="pt-4">h. If for any reason, the Debtor defaults the payments of one installment, and by reason of that fact, the agreement stands cancelled. Accordingly, on this agreement, the Company is entitled to take legal action for the recovery of capital amount, interest and defaulted amounts, if any, from the Debtor and the or Guarantors.</p>
                                        <p>i. The Guarantors binds themselves through this document, to ensure proper carrying out of the terms and conditions incorporated in this Legal Document.</p>
                                        <p>j. The terms and conditions of this agreement are mandatory and the benefit shall be the protection of Company, its successors and assigns, Debtor, Guarantors, their heirs, executors, administrators and assigns.</p>

                                        <div className="text-center pt-6 font-bold">
                                            IN WITNESS WHERE OF the Company Seal of BMS CAPITAL SOLUTIONS (PVT) LTD has been placed hereto and all the parties signed at Chankanai on this {new Date().toLocaleDateString('en-GB')}
                                        </div>

                                        {/* Schedule Section */}
                                        <div className="mt-8 pt-4 border-t-2 border-gray-400">
                                            <h3 className="text-center font-bold uppercase underline mb-4 text-xs">SCHEDULE ABOVE REFERRED TO</h3>
                                            <p className="text-center mb-6 text-[9px] uppercase tracking-wide italic">The installments payable and the period for payment of the said installments</p>
                                            <div className="max-w-[450px] mx-auto space-y-3 text-[10px] font-mono">
                                                <div className="flex justify-between items-center px-4 py-1 border-b border-gray-100">
                                                    <span className="flex items-center gap-3">➤ Loan amount</span>
                                                    <span className="font-bold">:- {Number(selectedLoan.approved_amount).toLocaleString()}/=</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-1 border-b border-gray-100">
                                                    <span className="flex items-center gap-3">➤ Interest rate (Annual)</span>
                                                    <span className="font-bold">:- {selectedLoan.interest_rate_annum || 21} %</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-1 border-b border-gray-100">
                                                    <span className="flex items-center gap-3">➤ Installment (Weekly)</span>
                                                    <span className="font-bold">:- {Number(selectedLoan.rentel).toLocaleString()}/=</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-1 border-b border-gray-100">
                                                    <span className="flex items-center gap-3">➤ Commencement of repayment</span>
                                                    <span className="font-bold">:- {new Date().toLocaleDateString('en-GB')}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-1 border-b border-gray-100">
                                                    <span className="flex items-center gap-3">➤ Repayment Period (Weeks)</span>
                                                    <span className="font-bold">:- {selectedLoan.terms}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-1 border-b border-gray-100">
                                                    <span className="flex items-center gap-3">➤ Date completion of payment</span>
                                                    <span className="font-bold">:- ....................</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-1">
                                                    <span className="flex items-center gap-3">➤ Default Interest (Monthly)</span>
                                                    <span className="font-bold">:- 5 %</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 space-y-6 text-[9px]">
                                            <p>Signed after getting everything given above understood</p>
                                            <p>Signed after affixing the Stamp of BMS CAPITAL SOLUTIONS (PVT) LTD in the presence of authorized officer of the above Company.</p>

                                            <div className="grid grid-cols-2 gap-x-12 gap-y-8 pt-8 uppercase font-bold">
                                                <div className="border-t border-gray-400 pt-1">Debtor: {selectedLoan.customer?.full_name}</div>
                                                <div className="border-t border-gray-400 pt-1">Join Borrower: {selectedLoan.guardian_name}</div>
                                                <div className="border-t border-gray-400 pt-1">1st Guarantor: {selectedLoan.g1_details?.name}</div>
                                                <div className="border-t border-gray-400 pt-1">2nd Guarantor: {selectedLoan.g2_details?.name}</div>
                                            </div>

                                            <div className="pt-8 space-y-4">
                                                <p className="font-bold">Witnesses:</p>
                                                <div className="grid grid-cols-2 gap-12">
                                                    <div className="space-y-1">
                                                        <p>1. Signature: ........................................</p>
                                                        <p>Full Name: {selectedLoan.w1_details?.name}</p>
                                                        <p>NIC: {selectedLoan.w1_details?.nic || '................'}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p>2. Signature: ........................................</p>
                                                        <p>Full Name: {selectedLoan.w2_details?.name}</p>
                                                        <p>NIC: {selectedLoan.w2_details?.nic || '................'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-8 left-16 text-[8px] opacity-40 italic">
                                        LOAN AGREEMENT {selectedLoan.contract_number}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-amber-600">
                                <AlertTriangle className="w-5 h-5" />
                                <span className="text-sm font-medium">Please check values carefully</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowPreviewModal(false);
                                        setSelectedLoan(null);
                                    }}
                                    className="px-6 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium border border-gray-300 dark:border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleActualDownload}
                                    disabled={actionLoading === selectedLoan.id}
                                    className="inline-flex items-center gap-2 px-8 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all shadow-lg active:transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                >
                                    {actionLoading === selectedLoan.id ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Download className="w-5 h-5" />
                                    )}
                                    Confirm & Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

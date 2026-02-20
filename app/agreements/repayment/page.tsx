"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Users,
    Search,
    RefreshCw,
    Filter,
    Building2,
    Calendar,
    DollarSign,
    User,
    CheckCircle2,
    ChevronDown,
    X,
    FileText,
    ArrowUpDown,
    Download
} from "lucide-react";
import { toast } from "react-toastify";
import { authService } from "@/services/auth.service";

interface Staff {
    id: number;
    staff_id: string;
    full_name: string;
    role: string;
}

interface Center {
    id: number;
    center_name: string;
    CSU_id: string;
    staff_id: string;
}

interface RepaymentLoan {
    group_no: string;
    customer_nic: string;
    product_code: string;
    customer_name: string;
    loan_amount: number;
    balance_amount: number;
    rental: number;
    arrears: number;
    arrears_age: number;
}

interface CenterRepaymentData {
    center_id: number;
    center_name: string;
    csu_id: string;
    loans: RepaymentLoan[];
}

export default function RepaymentPage() {
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [centers, setCenters] = useState<Center[]>([]);
    const [selectedStaff, setSelectedStaff] = useState<string>("");
    const [selectedCenters, setSelectedCenters] = useState<number[]>([]);
    const [repaymentData, setRepaymentData] = useState<CenterRepaymentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [staffLoading, setStaffLoading] = useState(true);
    const [centerLoading, setCenterLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    const fetchStaffs = useCallback(async () => {
        try {
            setStaffLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/staffs/by-role/field_officer`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.status === "success") {
                setStaffs(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch staffs", error);
        } finally {
            setStaffLoading(false);
        }
    }, [API_URL]);

    const fetchCenters = useCallback(async (staffId: string) => {
        if (!staffId) {
            setCenters([]);
            return;
        }
        try {
            setCenterLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/centers?staff_id=${staffId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.status === "success") {
                setCenters(result.data.data || result.data);
            }
        } catch (error) {
            console.error("Failed to fetch centers", error);
        } finally {
            setCenterLoading(false);
        }
    }, [API_URL]);

    const fetchRepaymentData = useCallback(async () => {
        if (!selectedStaff || selectedCenters.length === 0) {
            setRepaymentData([]);
            return;
        }
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/collections/repayment-sheet?staff_id=${selectedStaff}&${selectedCenters.map(id => `center_ids[]=${id}`).join('&')}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                setRepaymentData(result.data);
            } else {
                toast.error(result.message || "Failed to fetch repayment data");
            }
        } catch (error) {
            console.error("Failed to fetch repayment data", error);
            toast.error("An error occurred while fetching repayment data");
        } finally {
            setLoading(false);
        }
    }, [selectedStaff, selectedCenters, API_URL]);

    useEffect(() => {
        fetchStaffs();
    }, [fetchStaffs]);

    useEffect(() => {
        if (selectedStaff) {
            fetchCenters(selectedStaff);
            setSelectedCenters([]);
            setRepaymentData([]);
        }
    }, [selectedStaff, fetchCenters]);

    useEffect(() => {
        if (selectedCenters.length > 0) {
            fetchRepaymentData();
        } else {
            setRepaymentData([]);
        }
    }, [selectedCenters, fetchRepaymentData]);

    const toggleCenter = (centerId: number) => {
        setSelectedCenters(prev =>
            prev.includes(centerId)
                ? prev.filter(id => id !== centerId)
                : [...prev, centerId]
        );
    };

    const handleSelectAllCenters = () => {
        if (selectedCenters.length === centers.length) {
            setSelectedCenters([]);
        } else {
            setSelectedCenters(centers.map(c => c.id));
        }
    };

    const filteredLoans = repaymentData.flatMap(c => c.loans).filter(loan =>
        loan.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        loan.customer_nic.toLowerCase().includes(search.toLowerCase()) ||
        loan.product_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                        <FileText className="w-8 h-8 text-primary-600" />
                        Repayment Sheet
                    </h1>
                    <p className="text-[11px] font-black text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[0.2em] opacity-60">
                        Agreement & Forms • Center Wise Collection Draft
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchRepaymentData}
                        disabled={loading || !selectedStaff || selectedCenters.length === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl transition-all font-bold text-sm disabled:opacity-50 border border-gray-200 dark:border-gray-700"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Staff Selection */}
                <div className="lg:col-span-4 space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
                        Select Field Staff
                    </label>
                    <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                        <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl appearance-none focus:outline-none focus:border-primary-500 transition-all font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight"
                        >
                            <option value="">{staffLoading ? "Loading Staff..." : "Choose Field Officer"}</option>
                            {staffs.map(staff => (
                                <option key={staff.staff_id} value={staff.staff_id}>
                                    {staff.full_name} ({staff.staff_id})
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Center Multi-Selection */}
                <div className="lg:col-span-8 space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1 opacity-60">
                        Select Centers ({selectedCenters.length} Selected)
                    </label>
                    <div className="relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-2 min-h-[54px] flex flex-wrap gap-2 items-center">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                        <div className="pl-12 flex flex-wrap gap-2 flex-1">
                            {selectedCenters.length > 0 ? (
                                selectedCenters.map(id => {
                                    const center = centers.find(c => c.id === id);
                                    return (
                                        <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-xl text-xs font-black uppercase tracking-tight border border-primary-200 dark:border-primary-800 animate-in zoom-in duration-200">
                                            {center?.center_name}
                                            <button onClick={() => toggleCenter(id)} className="hover:text-rose-500 transition-colors">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    );
                                })
                            ) : (
                                <span className="text-gray-400 text-sm font-bold ml-1">
                                    {centerLoading ? "Loading Centers..." : "No Centers Selected"}
                                </span>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                disabled={!selectedStaff || centerLoading}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-30"
                            >
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[50] overflow-hidden animate-in slide-in-from-top-2 duration-200">
                                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-2">Available Centers</h4>
                                        <button
                                            onClick={handleSelectAllCenters}
                                            className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline px-2"
                                        >
                                            {selectedCenters.length === centers.length ? "Deselect All" : "Select All"}
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar">
                                        {centers.length === 0 ? (
                                            <p className="text-xs text-center py-4 text-gray-500 font-bold uppercase tracking-tight">No centers found</p>
                                        ) : (
                                            centers.map(center => (
                                                <button
                                                    key={center.id}
                                                    onClick={() => toggleCenter(center.id)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${selectedCenters.includes(center.id)
                                                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    <span className="text-sm font-bold uppercase tracking-tight">{center.center_name}</span>
                                                    {selectedCenters.includes(center.id) && <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px] flex flex-col">
                {/* Table Header / Action Bar */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search in repayment sheet..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:border-primary-500 transition-all font-bold text-sm tracking-tight"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            Showing <span className="text-primary-500">{filteredLoans.length}</span> Records
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 dark:bg-gray-700/30">
                                {[
                                    { label: "Grp No", icon: <Users className="w-3 h-3" /> },
                                    { label: "Customer NIC", icon: <User className="w-3 h-3" /> },
                                    { label: "Product", icon: <FileText className="w-3 h-3" /> },
                                    { label: "Name", icon: <User className="w-3 h-3" /> },
                                    { label: "Amount", icon: <DollarSign className="w-3 h-3" /> },
                                    { label: "Balance", icon: <DollarSign className="w-3 h-3" /> },
                                    { label: "Rental", icon: <DollarSign className="w-3 h-3" /> },
                                    { label: "Arrears", icon: <AlertTriangle className="w-3 h-3 text-rose-500" /> },
                                    { label: "Age", icon: <Clock className="w-3 h-3" /> }
                                ].map((col, idx) => (
                                    <th key={idx} className="px-6 py-5 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            {col.icon}
                                            {col.label}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                                                <RefreshCw className="absolute inset-0 m-auto w-5 h-5 text-primary-500" />
                                            </div>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compiling Collection Data...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <div className="p-6 bg-gray-100 dark:bg-gray-700 rounded-full">
                                                <Search className="w-10 h-10 text-gray-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">No Records Found</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Select a staff and centers to populate data</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredLoans.map((loan, idx) => (
                                    <tr
                                        key={idx}
                                        className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-all group border-b border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-tighter bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg">
                                                {loan.group_no}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">{loan.customer_nic}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-md border border-primary-100 dark:border-primary-800">
                                                {loan.product_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{loan.customer_name}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-xs font-black text-gray-900 dark:text-white">
                                                {loan.loan_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-xs font-black text-gray-900 dark:text-white">
                                                {loan.balance_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-xs font-black text-gray-900 dark:text-white">
                                                {loan.rental.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className={`text-xs font-black ${loan.arrears > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {loan.arrears.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${loan.arrears_age > 30 ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : loan.arrears_age > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                                <span className="text-xs font-black text-gray-600 dark:text-gray-300">
                                                    {loan.arrears_age} <span className="text-[10px] opacity-40">Days</span>
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer Controls */}
                {!loading && filteredLoans.length > 0 && (
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Active Loans</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{filteredLoans.length}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Total Balance</p>
                                <p className="text-lg font-black text-primary-600 dark:text-primary-400 text-right">
                                    Rs. {filteredLoans.reduce((sum, l) => sum + l.balance_amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all shadow-xl shadow-primary-500/20 font-black text-xs uppercase tracking-widest"
                        >
                            <Download className="w-4 h-4" />
                            Print Sheet
                        </button>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @media print {
                    nav, .header-container, button, .controls-container, label {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .p-6 { padding: 0 !important; }
                    .shadow-sm { box-shadow: none !important; }
                    .border { border-color: #eee !important; }
                    table { width: 100% !important; border-collapse: collapse !important; }
                    th, td { border: 1px solid #ddd !important; padding: 8px !important; font-size: 10px !important; }
                    .animate-in { animation: none !important; }
                    .min-h-[500px] { min-height: auto !important; }
                    @page { margin: 1cm; }
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.4);
                }
            `}</style>
        </div>
    );
}

const AlertTriangle = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
);

const Clock = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

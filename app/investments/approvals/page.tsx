"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Search, DollarSign, User, ShieldCheck, TrendingUp, Info, ShieldAlert } from "lucide-react";
import { investmentService } from "@/services/investment.service";
import { toast } from "react-toastify";
import BMSLoader from "@/components/common/BMSLoader";
import { colors } from "@/themes/colors";
import { typography } from "@/themes/typography";

export default function InvestmentApprovalsPage() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadPendingInvestments();
    }, []);

    const loadPendingInvestments = async () => {
        try {
            setLoading(true);
            const all = await investmentService.getInvestments();
            const pending = all.filter((inv: any) => inv.status === 'PENDING_APPROVAL');
            setInvestments(pending);
        } catch (error) {
            toast.error("Failed to load pending investments");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type: 'APPROVE' | 'REJECT') => {
        if (!selectedId) return;

        try {
            setIsProcessing(true);
            if (type === 'APPROVE') {
                await investmentService.approveInvestment(selectedId);
                toast.success("Investment authorized successfully!");
            } else {
                toast.info("Rejection logic pending backend integration");
            }
            setSelectedId(null);
            loadPendingInvestments();
        } catch (error: any) {
            toast.error(error.message || "Action failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const filtered = investments.filter(inv =>
        inv.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedInv = investments.find(inv => inv.id === selectedId);

    const dynamicStyles = `
        .theme-text-primary { color: ${colors.primary[600]}; }
        .theme-bg-primary-light { background-color: ${colors.primary[50]}; }
        .theme-bg-primary-soft { background-color: ${colors.primary[100]}; }
        .theme-border-primary-light { border-color: ${colors.primary[100]}; }
        .theme-focus-ring:focus { 
            --tw-ring-color: ${colors.primary[500]}1a; 
            box-shadow: 0 0 0 4px var(--tw-ring-color);
            border-color: ${colors.primary[300]};
        }
    `;

    return (
        <div className="min-h-screen relative overflow-hidden pb-12" style={{ backgroundColor: colors.surface.background }}>
            <style>{dynamicStyles}</style>

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-10 blur-[120px]"
                    style={{ background: `radial-gradient(circle, ${colors.primary[400]}, transparent)` }}
                />
                <div
                    className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] rounded-full opacity-10 blur-[100px]"
                    style={{ background: `radial-gradient(circle, ${colors.indigo[400]}, transparent)` }}
                />
            </div>

            <div className="max-w-7xl mx-auto space-y-8 relative z-10 px-6 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-white shadow-xl shadow-gray-200/50">
                    <div className="flex items-center gap-6">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:rotate-3 duration-500"
                            style={{
                                background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                                boxShadow: `0 10px 20px ${colors.primary[600]}30`
                            }}
                        >
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                Investment <span className="theme-text-primary">Approvals</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex flex-col items-end">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">In Queue</span>
                            <span className="text-xl font-black text-gray-900">{investments.length}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Panel: List */}
                    <div className="flex-[1.5] space-y-8">
                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:theme-text-primary" />
                            <input
                                type="text"
                                placeholder="Scan queue by customer, product or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-xl border-white border-[1.5px] rounded-2xl outline-none transition-all shadow-lg shadow-gray-200/20 text-gray-700 font-bold theme-focus-ring text-sm uppercase"
                            />
                        </div>

                        {/* Queue Container */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden min-h-[450px]">
                            {loading ? (
                                <div className="p-24 flex justify-center">
                                    <BMSLoader message="Deciphering Approval Matrix..." />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="p-24 text-center space-y-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                        <Clock className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase">Queue Empty</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">No pending authorizations detected</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {filtered.map((inv) => (
                                        <div
                                            key={inv.id}
                                            onClick={() => setSelectedId(inv.id)}
                                            className={`p-6 transition-all cursor-pointer group hover:bg-gray-50/50 ${selectedId === inv.id ? 'bg-primary-50/50 border-l-4 border-primary-500 shadow-inner' : 'border-l-4 border-transparent'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        REF: {inv.transaction_id}
                                                        {inv.created_by && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                                <span className="text-primary-500 font-black tracking-widest">BY {inv.created_by.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-black text-gray-900 group-hover:theme-text-primary transition-colors">{inv.customer?.full_name}</h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">{inv.product?.name}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="text-sm font-black text-gray-900">LKR {Number(inv.amount).toLocaleString()}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="text-[10px] font-black text-gray-400 uppercase">{inv.snapshot_policy_term} MONTHS</span>
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${selectedId === inv.id ? 'bg-primary-500 text-white' : 'bg-white text-gray-400 group-hover:scale-110'}`}>
                                                    <TrendingUp className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Approval Console */}
                    <div className="flex-1">
                        <div className={`sticky top-8 p-8 rounded-3xl border transition-all duration-500 shadow-2xl relative overflow-hidden ${selectedId ? 'bg-white border-primary-100 opacity-100 translate-y-0' : 'bg-white/40 border-white opacity-50 translate-y-4 pointer-events-none'}`}>
                            {/* Decorative element */}
                            {selectedId && (
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                    <ShieldCheck className="w-32 h-32 theme-text-primary" />
                                </div>
                            )}

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Authorization Port</h2>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Asset Risk Assessment</p>
                                    </div>
                                </div>

                                {selectedId ? (
                                    <div className="space-y-8">
                                        <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 space-y-4">
                                            <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Investment Summary</span>
                                                <span className="text-sm font-black text-gray-900 uppercase">{selectedInv?.customer?.full_name}</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase">Policy Term</span>
                                                    <div className="text-xs font-black text-gray-700">{selectedInv?.snapshot_policy_term} Months</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase">Payout Type</span>
                                                    <div className="text-xs font-black text-gray-700">{selectedInv?.snapshot_payout_type}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase">Interest Rate</span>
                                                    <div className="text-xs font-black text-emerald-600">{(Number(selectedInv?.snapshot_interest_rate) * 100).toFixed(2)}% APR</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase">Handled By</span>
                                                    <div className="text-xs font-black theme-text-primary uppercase tracking-tighter">{selectedInv?.created_by?.name}</div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 mt-2">
                                                <span className="text-[9px] font-black text-gray-400 uppercase">Total Principal</span>
                                                <div className="text-2xl font-black text-gray-900 mt-1">LKR {Number(selectedInv?.amount).toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <button
                                                onClick={() => handleAction('APPROVE')}
                                                disabled={isProcessing}
                                                className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {isProcessing ? <Clock className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                Authorize Approval
                                            </button>
                                            <button
                                                onClick={() => handleAction('REJECT')}
                                                disabled={isProcessing}
                                                className="w-full py-4 bg-white text-rose-500 border-2 border-rose-50 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                <XCircle className="w-3.5 h-3.5" />
                                                Decline Asset
                                            </button>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 animate-pulse" />
                                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                                                Approving this investment will authorize the treasury to release the payment vouchers and notify the customer.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-24 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <Clock className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-8 leading-relaxed">
                                            Select an investment path from the queue to initiate authorization
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

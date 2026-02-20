"use client";
import React, { useState, useEffect } from "react";
import { Zap, Search, ShieldCheck, FileText, ArrowRight, Clock } from "lucide-react";
import { investmentService } from "@/services/investment.service";
import { toast } from "react-toastify";
import BMSLoader from "@/components/common/BMSLoader";
import { colors } from "@/themes/colors";

export default function InvestmentActivationPage() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activatingId, setActivatingId] = useState<number | null>(null);
    const [receiptNumber, setReceiptNumber] = useState("");

    useEffect(() => {
        loadAwaitingActivation();
    }, []);

    const loadAwaitingActivation = async () => {
        try {
            setLoading(true);
            const all = await investmentService.getInvestments();
            const awaiting = all.filter((inv: any) => inv.status === 'APPROVED_AWAITING_ACTIVATION');
            setInvestments(awaiting);
        } catch (error) {
            toast.error("Failed to load investments awaiting activation");
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (id: number) => {
        if (!receiptNumber) {
            toast.warn("Please enter the official receipt number");
            return;
        }

        try {
            setActivatingId(id);
            await investmentService.activateInvestment(id, receiptNumber);
            toast.success("Investment activated successfully! Document printing enabled.");
            setReceiptNumber("");
            setActivatingId(null);
            loadAwaitingActivation();
        } catch (error: any) {
            toast.error(error.message || "Activation failed. Verify receipt number.");
            setActivatingId(null);
        }
    };

    const filtered = investments.filter(inv =>
        inv.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                Branch <span className="theme-text-primary">Activation</span> Port
                            </h1>

                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex flex-col items-end">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Awaiting</span>
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
                                placeholder="Locate by customer or reference..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-xl border-white border-[1.5px] rounded-2xl outline-none transition-all shadow-lg shadow-gray-200/20 text-gray-700 font-bold theme-focus-ring text-sm uppercase"
                            />
                        </div>

                        {/* Queue Container */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 border border-white overflow-hidden min-h-[400px]">
                            {loading ? (
                                <div className="p-24 flex justify-center">
                                    <BMSLoader message="Scanning Activation Keys..." />
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="p-24 text-center space-y-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                        <ShieldCheck className="w-10 h-10 text-gray-200" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase">Port Clear</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">No assets awaiting activation</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {filtered.map((inv) => (
                                        <div
                                            key={inv.id}
                                            onClick={() => setActivatingId(inv.id)}
                                            className={`p-6 transition-all cursor-pointer group hover:bg-gray-50/50 ${activatingId === inv.id ? 'bg-primary-50/50 border-l-4 border-primary-500' : 'border-l-4 border-transparent'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">REF: {inv.transaction_id}</div>
                                                    <h3 className="text-lg font-black text-gray-900">{inv.customer?.full_name}</h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold theme-text-primary uppercase tracking-tight">{inv.product?.name}</span>
                                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <span className="text-xs font-black text-gray-700">LKR {Number(inv.amount).toLocaleString()}</span>
                                                    </div>
                                                    <div className="inline-block mt-2 px-2 py-0.5 bg-gray-100 rounded text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                                        Handled By: {inv.created_by?.name}
                                                    </div>
                                                </div>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${activatingId === inv.id ? 'bg-primary-500 text-white' : 'bg-white text-gray-400 group-hover:scale-110'}`}>
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Activation Console */}
                    <div className="flex-1">
                        <div className={`sticky top-8 p-8 rounded-3xl border transition-all duration-500 shadow-2xl relative overflow-hidden ${activatingId ? 'bg-white border-primary-100 opacity-100 translate-y-0' : 'bg-white/40 border-white opacity-50 translate-y-4 pointer-events-none'}`}>
                            {/* Decorative element */}
                            {activatingId && (
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                    <Zap className="w-32 h-32 theme-text-primary" />
                                </div>
                            )}

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Activation Console</h2>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Physical Receipt Verification</p>
                                    </div>
                                </div>

                                {activatingId ? (
                                    <div className="space-y-6">
                                        <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 space-y-4">
                                            <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Investor Reference</span>
                                                <span className="text-sm font-black text-gray-900 uppercase">{investments.find(i => i.id === activatingId)?.customer?.full_name}</span>
                                            </div>

                                            <div className="space-y-4 pt-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Official Receipt Number</label>
                                                <div className="relative">
                                                    <FileText className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                                    <input
                                                        type="text"
                                                        placeholder="OFFICIAL RECEIPT NO"
                                                        value={receiptNumber}
                                                        onChange={(e) => setReceiptNumber(e.target.value.toUpperCase())}
                                                        className="w-full pl-12 pr-4 py-4 bg-white border-gray-100 border rounded-xl font-black text-sm tracking-[0.1em] focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 outline-none transition-all shadow-sm"
                                                    />
                                                </div>

                                                <button
                                                    onClick={() => handleActivate(activatingId)}
                                                    className="w-full py-5 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/30 hover:bg-primary-600 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                    Finalize Activation
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 animate-pulse" />
                                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">
                                                Confirming activation will notify the customer and authorize document printing for this investment.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <Clock className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest px-8 leading-relaxed">
                                            Select an asset from the queue to begin verification
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

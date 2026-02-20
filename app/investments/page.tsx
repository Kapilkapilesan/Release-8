"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  BadgeDollarSign,
  Download,
  Plus,
} from "lucide-react";
import { CustomerInvestmentsTable } from "../../components/fund-transactions/CustomerInvestmentsTable";
import { investmentService } from "../../services/investment.service";
import { authService } from "../../services/auth.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import BMSLoader from "../../components/common/BMSLoader";
import { colors } from "@/themes/colors";
import {
  filterInvestments,
  calculateInvestmentStats,
} from "@/utils/investment.utils";

export default function InvestmentsListPage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    loadInvestments(true);

    const interval = setInterval(() => loadInvestments(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const loadInvestments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await investmentService.getInvestments();
      setInvestments(data);
    } catch (error) {
      console.error(error);
      if (showLoading) toast.error("Failed to load investments");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const filteredInvestments = filterInvestments(
    investments,
    searchTerm,
    statusFilter
  );

  const stats = calculateInvestmentStats(investments);

  return (
    <div className="min-h-screen relative overflow-hidden pb-12" style={{ backgroundColor: colors.surface.background }}>
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${colors.primary[400]}, transparent)` }}
        />
        <div
          className="absolute top-[30%] -right-[15%] w-[40%] h-[40%] rounded-full opacity-10 blur-[140px]"
          style={{ background: `radial-gradient(circle, ${colors.indigo[400]}, transparent)` }}
        />
        <div
          className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full opacity-10 blur-[100px]"
          style={{ background: `radial-gradient(circle, ${colors.primary[300]}, transparent)` }}
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
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Investment <span className="theme-text-primary">Accounts</span>
              </h1>
            </div>
          </div>

          {isMounted && authService.hasPermission("investments.create") && (
            <button
              onClick={() => router.push("/investments/create")}
              className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all hover:bg-primary-700 hover:shadow-2xl active:scale-95 shadow-lg shadow-primary-500/20"
            >
              <Plus className="w-5 h-5" />
              Initialize New Asset
            </button>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Stat 1 */}
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl shadow-gray-200/40 group hover:scale-[1.02] transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                <BadgeDollarSign className="w-7 h-7 text-emerald-500 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70">
                  Total Active Principal
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900 tracking-tight">{stats.totalPrincipal.toLocaleString()}</span>
                  <span className="text-xs font-bold text-emerald-500">LKR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-xl shadow-gray-200/40 group hover:scale-[1.02] transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                <TrendingUp className="w-7 h-7 text-primary-500 group-hover:text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 opacity-70">
                  Total Subscriptions
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900 tracking-tight">{stats.totalCount}</span>
                  <span className="text-xs font-bold text-primary-500 italic uppercase">Accounts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="relative flex-1 w-full group">
              <Search className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2 group-focus-within:text-primary-600 transition-colors" />
              <input
                type="text"
                placeholder="Search accounts, customers, or products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white/80 backdrop-blur-xl border-white border-[1.5px] rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all shadow-xl shadow-gray-200/20 text-gray-700 font-bold text-sm placeholder:text-gray-400 uppercase tracking-wide"
              />
            </div>

            <div className="relative w-full lg:w-80">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-6 pr-14 py-5 bg-white/80 backdrop-blur-xl border-white border-[1.5px] rounded-2xl text-gray-700 font-extrabold shadow-xl cursor-pointer focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all uppercase tracking-widest text-xs"
              >
                <option value="ALL">ALL PORTFOLIO</option>
                <option value="ACTIVE">● ACTIVE ONLY</option>
                <option value="PENDING_APPROVAL">● PENDING APPROVAL</option>
                <option value="APPROVED_AWAITING_PAYMENT">● AWAITING PAYMENT</option>
                <option value="APPROVED_AWAITING_ACTIVATION">● AWAITING ACTIVATION</option>
                <option value="CLOSED">● CLOSED</option>
                <option value="MATURED">● MATURED</option>
                <option value="RENEWED">● RENEWED</option>
              </select>
              <Filter className="w-4 h-4 text-gray-400 absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white overflow-hidden min-h-[500px]">
            {loading ? (
              <div className="p-32 flex justify-center">
                <BMSLoader message="Analyzing Portfolio Intelligence..." />
              </div>
            ) : (
              <CustomerInvestmentsTable records={filteredInvestments} />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

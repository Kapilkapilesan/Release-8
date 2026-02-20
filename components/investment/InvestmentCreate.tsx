'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, TrendingUp, UserCheck, ShieldAlert, Clock, Wallet, BarChart3, Tag, Plus, CheckCircle2, Info, AlertCircle, Search, ChevronRight, User, DollarSign, Save, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { investmentService } from '@/services/investment.service';
import { Nominee } from '@/types/investment.types';
import { InvestmentProduct, InterestRateTier } from '@/types/investment-product.types';
import { customerService } from '@/services/customer.service';
import { Customer } from '@/types/customer.types';
import { colors } from '@/themes/colors';
import { validateInvestmentForm, validateInvestmentAmount, findTierByTerm } from '@/utils/investment.utils';

export function InvestmentCreate() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<InvestmentProduct[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [formData, setFormData] = useState({
        product_id: '',
        customer_id: '',
        amount: '',
        policy_term: '',
        start_date: new Date().toISOString().split('T')[0],
        nominees: [] as Nominee[],
        negotiation_rate: '0',
        payout_type: 'MATURITY'
    });

    const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(null);
    const [selectedTier, setSelectedTier] = useState<InterestRateTier | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [showTermDropdown, setShowTermDropdown] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const productsRes = await investmentService.getProducts();
                setProducts(productsRes);
            } catch (error) {
                toast.error('Failed to load products');
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        // Set searching to true immediately when typing starts (if >= 3 chars)
        if (searchTerm.trim().length >= 3) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
            setCustomers([]);
        }

        const delayDebounceFn = setTimeout(async () => {
            const trimmedTerm = searchTerm.trim();
            if (trimmedTerm.length >= 3) {
                try {
                    const results = await customerService.getCustomers({
                        search: trimmedTerm
                    });
                    setCustomers(results);
                } catch (error) {
                    console.error('Search failed', error);
                } finally {
                    setIsSearching(false);
                }
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const filteredCustomers = customers; // Already filtered by API

    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setFormData(prev => ({ ...prev, customer_id: String(customer.id) }));
        setSearchTerm('');
        setIsSearching(false);
    };

    const handleProductChange = (productId: string) => {
        const product = products.find(p => p.id === Number(productId));
        setSelectedProduct(product || null);
        setSelectedTier(null);
        setFormData(prev => ({ ...prev, product_id: productId, policy_term: '' }));
    };

    const handleTermChange = (termMonths: string) => {
        if (!selectedProduct) return;
        const tier = findTierByTerm(Number(termMonths), selectedProduct);
        setSelectedTier(tier || null);
        setFormData(prev => ({ ...prev, policy_term: termMonths }));
    };

    const addNominee = () => {
        setFormData(prev => ({
            ...prev,
            nominees: [...prev.nominees, { name: '', id_type: 'NIC', nic: '', relationship: '' }]
        }));
    };

    const removeNominee = (index: number) => {
        setFormData(prev => ({
            ...prev,
            nominees: prev.nominees.filter((_, i) => i !== index)
        }));
    };

    const updateNominee = (index: number, field: keyof Nominee, value: string) => {
        const newNominees = [...formData.nominees];
        newNominees[index] = { ...newNominees[index], [field]: value };
        setFormData(prev => ({ ...prev, nominees: newNominees }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const validation = validateInvestmentForm(formData);
        if (!validation.isValid) {
            toast.error(validation.errors[0]);
            setIsLoading(false);
            return;
        }

        if (selectedProduct) {
            const amountValidation = validateInvestmentAmount(Number(formData.amount), selectedProduct);
            if (!amountValidation.isValid) {
                toast.error(amountValidation.message);
                setIsLoading(false);
                return;
            }
        }

        try {
            await investmentService.createInvestment({
                product_id: formData.product_id,
                customer_id: formData.customer_id,
                amount: formData.amount,
                policy_term: formData.policy_term,
                start_date: formData.start_date,
                nominees: formData.nominees,
                negotiation_rate: formData.negotiation_rate,
                payout_type: formData.payout_type
            });
            toast.success('Investment created successfully');
            // Redirect to list view
            router.push('/investments');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create investment');
        } finally {
            setIsLoading(false);
        }
    };

    const dynamicStyles = `
        .theme-text-primary { color: ${colors.primary[600]}; }
        .theme-text-primary-dark { color: ${colors.primary[700]}; }
        .theme-bg-primary-light { background-color: ${colors.primary[50]}; }
        .theme-bg-primary-soft { background-color: ${colors.primary[100]}; }
        .theme-border-primary-light { border-color: ${colors.primary[100]}; }
        
        .theme-hover-bg-primary-light:hover { background-color: ${colors.primary[50]}; }
        .theme-hover-text-primary:hover { color: ${colors.primary[700]}; }
        
        .theme-focus-within-text-primary:focus-within { color: ${colors.primary[500]}; }
        
        .theme-focus-ring:focus { 
            --tw-ring-color: ${colors.primary[500]}1a; 
            --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
            --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);
            box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
            border-color: ${colors.primary[300]};
        }
        
        .theme-group-hover-text-primary:hover { color: ${colors.primary[700]}; }
        .group:hover .theme-group-hover-text-primary { color: ${colors.primary[700]}; }
        
        .theme-shadow-glow { box-shadow: 0 10px 15px -3px ${colors.primary[500]}0d; }
    `;

    return (
        <div className="min-h-screen relative overflow-hidden pb-12" style={{ backgroundColor: colors.surface.background }}>
            <style>{dynamicStyles}</style>
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[120px]"
                    style={{ background: `radial-gradient(circle, ${colors.primary[400]}, transparent)` }}
                />
                <div
                    className="absolute top-[40%] -right-[10%] w-[30%] h-[30%] rounded-full opacity-15 blur-[100px]"
                    style={{ background: `radial-gradient(circle, ${colors.indigo[400]}, transparent)` }}
                />
            </div>

            <div className="max-w-4xl mx-auto space-y-6 relative z-10 px-4 md:px-0 pt-10 animate-in fade-in duration-700">
                <div className="flex items-center gap-5">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-transform hover:scale-105 duration-500"
                        style={{
                            background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                            boxShadow: `0 15px 30px ${colors.primary[600]}30`
                        }}
                    >
                        <DollarSign className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create New Investment</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Investor Selection */}
                    <div className="relative z-30 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-gray-50">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            Investor Selection
                        </h2>
                        {!selectedCustomer ? (
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 theme-focus-within-text-primary transition-colors">
                                    <Search className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-6 py-3.5 rounded-xl border-white border-[1.5px] outline-none transition-all shadow-lg shadow-gray-200/20 bg-white font-semibold text-sm text-gray-700 theme-focus-ring uppercase"
                                    placeholder="Search by Name or NIC (Min 3 chars)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {isSearching && (
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.primary[600], borderTopColor: 'transparent' }}></div>
                                    </div>
                                )}
                                {searchTerm.length >= 3 && customers.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-h-80 overflow-y-auto p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="px-4 py-2 mb-1">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Found Customers</span>
                                        </div>
                                        {customers.map(customer => (
                                            <button
                                                key={customer.id} type="button"
                                                className="w-full text-left px-4 py-3.5 theme-hover-bg-primary-light rounded-2xl flex items-center justify-between group transition-all"
                                                onClick={() => handleCustomerSelect(customer)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 theme-group-hover-text-primary transition-colors text-sm">{customer.full_name}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">NIC: {customer.customer_code}</span>
                                                    </div>
                                                </div>
                                                <div className="p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 theme-bg-primary-soft theme-text-primary">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searchTerm.length >= 3 && customers.length === 0 && !isSearching && (
                                    <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-3 rounded-full bg-gray-50 text-gray-300">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 tracking-tight text-sm uppercase">No Results Found</p>
                                                <p className="text-[10px] text-gray-400 mt-1 font-bold">No customers match "{searchTerm}"</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-5 rounded-2xl flex items-center justify-between border-white border-[1.5px] transition-all animate-in zoom-in-95 theme-bg-primary-light theme-shadow-glow" style={{ backgroundColor: `${colors.primary[50]}80` }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl theme-bg-primary-soft flex items-center justify-center theme-text-primary">
                                        <UserCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 tracking-tight">
                                            {selectedCustomer.full_name}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                            <span className="text-[9px] font-bold uppercase tracking-widest theme-text-primary px-2 py-0.5 bg-white rounded-md border border-primary-100">
                                                NIC: {selectedCustomer.customer_code}
                                            </span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                Phone: {selectedCustomer.mobile_no_1 || 'N/A'}
                                            </span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                                Branch: {selectedCustomer.branch?.branch_code || 'Central'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedCustomer(null)}
                                    className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-white theme-text-primary theme-border-primary-light border hover:shadow-md"
                                >
                                    Change Customer
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Investment Details */}
                    <div className="relative z-20 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-gray-50">
                                <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            Investment Configuration
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="col-span-2">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Select Investment Product</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowProductDropdown(!showProductDropdown)}
                                        className="w-full px-5 py-3.5 rounded-xl border-white border-[1.5px] outline-none transition-all shadow-lg shadow-gray-200/20 bg-white font-bold text-gray-700 text-sm flex items-center justify-between theme-focus-ring uppercase"
                                    >
                                        <span>{selectedProduct ? selectedProduct.name : 'Select Investment Product'}</span>
                                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showProductDropdown ? 'rotate-90' : ''}`} />
                                    </button>

                                    {showProductDropdown && (
                                        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {products.length > 0 ? products.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        handleProductChange(String(p.id));
                                                        setShowProductDropdown(false);
                                                    }}
                                                    className="w-full text-left px-4 py-3 rounded-xl transition-all theme-hover-bg-primary-light theme-hover-text-primary font-bold text-sm text-gray-600"
                                                >
                                                    {p.name}
                                                </button>
                                            )) : (
                                                <div className="px-4 py-3 text-xs text-gray-400 font-bold italic uppercase tracking-widest text-center">No products found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedProduct && (
                                <div className="col-span-2 space-y-3">
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Choose Interest Payout Method</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'MATURITY', label: 'At Maturity', sub: 'Lump sum at end', icon: Calendar },
                                            { id: 'MONTHLY', label: 'Monthly Interest', sub: 'Regular monthly income', icon: Info }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, payout_type: opt.id as any }))}
                                                className="flex items-center gap-4 p-4 rounded-xl border-[1.5px] transition-all text-left group"
                                                style={{
                                                    borderColor: formData.payout_type === opt.id ? colors.primary[400] : colors.gray[100],
                                                    backgroundColor: formData.payout_type === opt.id ? colors.primary[50] + '33' : colors.white,
                                                    boxShadow: formData.payout_type === opt.id ? `0 8px 16px ${colors.primary[500]}10` : 'none'
                                                }}
                                            >
                                                <div
                                                    className="p-2.5 rounded-lg transition-all"
                                                    style={{
                                                        backgroundColor: formData.payout_type === opt.id ? colors.primary[600] : colors.gray[100],
                                                        color: formData.payout_type === opt.id ? colors.white : colors.gray[400]
                                                    }}
                                                >
                                                    <opt.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-xs tracking-tight uppercase" style={{ color: formData.payout_type === opt.id ? colors.primary[700] : colors.gray[900] }}>{opt.label}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{opt.sub}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedProduct && (
                                <>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Available Terms (Months)</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowTermDropdown(!showTermDropdown)}
                                                className="w-full px-5 py-3.5 rounded-xl border-white border-[1.5px] outline-none transition-all shadow-lg shadow-gray-200/20 bg-white font-bold text-gray-700 text-sm flex items-center justify-between theme-focus-ring uppercase"
                                            >
                                                <span>{formData.policy_term ? `${formData.policy_term} Months` : 'Select Term'}</span>
                                                <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showTermDropdown ? 'rotate-90' : ''}`} />
                                            </button>

                                            {showTermDropdown && (
                                                <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    {selectedProduct.interest_rates_json.map(tier => (
                                                        <button
                                                            key={tier.term_months}
                                                            type="button"
                                                            onClick={() => {
                                                                handleTermChange(String(tier.term_months));
                                                                setShowTermDropdown(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 rounded-xl transition-all theme-hover-bg-primary-light theme-hover-text-primary font-bold text-sm text-gray-600 uppercase"
                                                        >
                                                            {tier.term_months} Months
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Start Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full px-5 py-3.5 rounded-xl border-white border-[1.5px] outline-none transition-all shadow-lg shadow-gray-200/20 bg-white font-bold text-gray-700 text-sm theme-focus-ring"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    {/* Snapshot Rates Card */}
                                    <div className="col-span-2 p-5 bg-gray-50/50 rounded-2xl border border-white grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div
                                            className="flex flex-col p-3 rounded-xl transition-all border border-transparent shadow-sm"
                                            style={{
                                                backgroundColor: formData.payout_type === 'MONTHLY' ? colors.primary[600] : colors.white,
                                                borderColor: formData.payout_type === 'MONTHLY' ? 'transparent' : colors.gray[100]
                                            }}
                                        >
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${formData.payout_type === 'MONTHLY' ? 'text-white/60' : 'text-gray-400'}`}>Monthly Rate</span>
                                            <span className={`font-black tracking-tighter ${formData.payout_type === 'MONTHLY' ? 'text-white text-xl' : 'text-gray-900 text-lg'}`}>{selectedTier?.interest_monthly ?? '--'}%</span>
                                        </div>
                                        <div
                                            className="flex flex-col p-3 rounded-xl transition-all border border-transparent shadow-sm"
                                            style={{
                                                backgroundColor: formData.payout_type === 'MATURITY' ? colors.primary[600] : colors.white,
                                                borderColor: formData.payout_type === 'MATURITY' ? 'transparent' : colors.gray[100]
                                            }}
                                        >
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${formData.payout_type === 'MATURITY' ? 'text-white/60' : 'text-gray-400'}`}>Maturity Rate</span>
                                            <span className={`font-black tracking-tighter ${formData.payout_type === 'MATURITY' ? 'text-white text-xl' : 'text-gray-900 text-lg'}`}>{selectedTier?.interest_maturity ?? '--'}%</span>
                                        </div>
                                        <div className="flex flex-col p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Break Monthly</span>
                                            <span className="font-black text-lg tracking-tighter text-indigo-600">{selectedTier?.breakdown_monthly ?? '--'}%</span>
                                        </div>
                                        <div className="flex flex-col p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Break Maturity</span>
                                            <span className="font-black text-lg tracking-tighter text-indigo-600">{selectedTier?.breakdown_maturity ?? '--'}%</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Investment Amount (LKR)</label>
                                        <input
                                            type="number"
                                            min={selectedProduct.min_amount}
                                            max={selectedProduct.max_amount}
                                            className="w-full px-5 py-3.5 rounded-xl border-white border-[1.5px] outline-none transition-all shadow-lg shadow-gray-200/20 bg-white font-black text-gray-700 text-sm theme-focus-ring"
                                            placeholder="Min amount required..."
                                            value={formData.amount}
                                            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        />
                                        <div className="flex items-center gap-3 mt-2 ml-1">
                                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-tight">Min: LKR {selectedProduct.min_amount.toLocaleString()}</p>
                                            <span className="text-gray-300">•</span>
                                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-tight">Max: LKR {selectedProduct.max_amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Negotiation Rate (%)</label>
                                        <div className="relative">
                                            <input
                                                type="number" step="0.01"
                                                className="w-full px-5 py-3.5 rounded-xl border-white border-[1.5px] outline-none transition-all shadow-lg shadow-gray-200/20 bg-white font-black text-gray-700 text-sm theme-focus-ring"
                                                value={formData.negotiation_rate}
                                                onChange={(e) => setFormData(prev => ({ ...prev, negotiation_rate: e.target.value }))}
                                            />
                                            <TrendingUp className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 opacity-50" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Nominees */}
                    <div className="relative z-10 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-gray-50">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                Nominees
                            </h2>
                            <button
                                type="button"
                                onClick={addNominee}
                                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-xl transition-all theme-bg-primary-light theme-text-primary hover:shadow-sm"
                            >
                                <Plus className="w-3 h-3" /> Add Nominee
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.nominees.length === 0 ? (
                                <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No nominees added yet</p>
                                </div>
                            ) : (
                                formData.nominees.map((nominee, idx) => (
                                    <div key={idx} className="flex flex-col gap-4 bg-gray-50/50 p-6 rounded-2xl border border-white shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name <span className="text-red-400">*</span></label>
                                                <input type="text" placeholder="Enter full name" className="w-full px-4 py-2.5 rounded-lg border-white border-[1.5px] text-xs font-bold shadow-sm theme-focus-ring outline-none uppercase" value={nominee.name} onChange={e => updateNominee(idx, 'name', e.target.value)} />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">ID Type <span className="text-red-400">*</span></label>
                                                <select
                                                    className="w-full px-4 py-2.5 rounded-lg border-white border-[1.5px] text-xs font-bold shadow-sm theme-focus-ring outline-none bg-white cursor-pointer uppercase"
                                                    value={nominee.id_type}
                                                    onChange={e => updateNominee(idx, 'id_type', e.target.value as any)}
                                                >
                                                    <option value="NIC">NIC Number</option>
                                                    <option value="BC">Birth Certificate</option>
                                                </select>
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                                                    {nominee.id_type === 'BC' ? 'BC Number' : 'NIC Number'} <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder={nominee.id_type === 'BC' ? "Enter BC number" : "Enter NIC number"}
                                                    className="w-full px-4 py-2.5 rounded-lg border-white border-[1.5px] text-xs font-bold shadow-sm theme-focus-ring outline-none uppercase"
                                                    value={nominee.nic}
                                                    onChange={e => updateNominee(idx, 'nic', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1 flex gap-2 items-center">
                                                <div className="flex-1">
                                                    <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Relationship <span className="text-red-400">*</span></label>
                                                    <select
                                                        className="w-full px-4 py-2.5 rounded-lg border-white border-[1.5px] text-xs font-bold shadow-sm theme-focus-ring outline-none bg-white cursor-pointer uppercase"
                                                        value={nominee.relationship}
                                                        onChange={e => updateNominee(idx, 'relationship', e.target.value)}
                                                    >
                                                        <option value="">Select Relationship</option>
                                                        <option value="Spouse">Spouse</option>
                                                        <option value="Child">Child</option>
                                                        <option value="Parent">Parent</option>
                                                        <option value="Sibling">Sibling</option>
                                                        <option value="Grandchild">Grandchild</option>
                                                        <option value="Grandparent">Grandparent</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                                <button type="button" onClick={() => removeNominee(idx)} className="mt-5 p-2.5 bg-red-50 text-red-400 hover:text-red-600 transition-colors rounded-lg group">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-10 py-4.5 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden group"
                            style={{
                                background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[700]})`,
                                boxShadow: `0 15px 30px ${colors.primary[600]}40`
                            }}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            )}
                            <span>{isLoading ? 'Processing...' : 'Complete Investment'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Calculator, Info, AlertCircle, CheckCircle2, Plus, Trash2, Save, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { InvestmentProduct, InvestmentProductFormData, InterestRateTier } from '../../types/investment-product.types';
import { investmentProductService } from '../../services/investment-product.service';
import { colors } from '@/themes/colors';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: InvestmentProductFormData) => void;
    initialData?: InvestmentProduct | null;
}

interface ValidationErrors {
    [key: string]: string;
}

export function InvestmentProductForm({ isOpen, onClose, onSave, initialData }: Props) {
    const [formData, setFormData] = useState<InvestmentProductFormData>({
        product_code: '',
        name: '',
        age_limited: 18,
        min_amount: 1000,
        max_amount: 1000000,
        interest_rates_json: [
            { term_months: 12, interest_monthly: 10, interest_maturity: 11, breakdown_monthly: 0.5, breakdown_maturity: 0.5 }
        ],
        negotiation_rates_json: { monthly: 0, maturity: 0 }
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [isLoadingCode, setIsLoadingCode] = useState(false);

    const markTouched = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));

    const getFieldError = (field: string): boolean => {
        if (!touched[field]) return false;
        switch (field) {
            case 'name': return !formData.name.trim();
            case 'age_limited': return !formData.age_limited || formData.age_limited <= 0;
            case 'min_amount': return !formData.min_amount || formData.min_amount <= 0;
            case 'max_amount': return !formData.max_amount || formData.max_amount <= 0;
            default: return false;
        }
    };

    const getRateFieldError = (idx: number, field: string): boolean => {
        const key = `rate_${idx}_${field}`;
        if (!touched[key]) return false;
        const rate = formData.interest_rates_json[idx];
        if (!rate) return false;
        const val = (rate as any)[field];

        // All fields must be > 0
        return !val || val <= 0;
    };

    const isFormValid = (): boolean => {
        if (!formData.name.trim()) return false;
        if (formData.product_code === 'Loading...' || !formData.product_code) return false;
        if (!formData.age_limited || formData.age_limited <= 0) return false;
        if (!formData.min_amount || formData.min_amount <= 0) return false;
        if (!formData.max_amount || formData.max_amount <= 0) return false;
        if (formData.interest_rates_json.length === 0) return false;
        for (const rate of formData.interest_rates_json) {
            // All matrix fields must be > 0
            if (!rate.term_months || rate.term_months <= 0) return false;
            if (rate.interest_monthly === undefined || rate.interest_monthly === null || rate.interest_monthly <= 0) return false;
            if (rate.interest_maturity === undefined || rate.interest_maturity === null || rate.interest_maturity <= 0) return false;
            if (rate.breakdown_monthly === undefined || rate.breakdown_monthly === null || rate.breakdown_monthly <= 0) return false;
            if (rate.breakdown_maturity === undefined || rate.breakdown_maturity === null || rate.breakdown_maturity <= 0) return false;
        }
        return true;
    };

    const errorBorder = 'border-red-500 ring-2 ring-red-500/20';
    const normalBorder = 'border-border-divider';

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    product_code: initialData.product_code || '',
                    name: initialData.name || '',
                    age_limited: initialData.age_limited || 18,
                    min_amount: initialData.min_amount || 0,
                    max_amount: initialData.max_amount || 0,
                    interest_rates_json: initialData.interest_rates_json || [],
                    negotiation_rates_json: initialData.negotiation_rates_json || { monthly: 0, maturity: 0 }
                });
            } else {
                setFormData({
                    product_code: 'Loading...',
                    name: '',
                    age_limited: 18,
                    min_amount: 1000,
                    max_amount: 1000000,
                    interest_rates_json: [
                        { term_months: 12, interest_monthly: 0, interest_maturity: 0, breakdown_monthly: 0, breakdown_maturity: 0 }
                    ],
                    negotiation_rates_json: { monthly: 0, maturity: 0 }
                });

                const fetchNextCode = async () => {
                    setIsLoadingCode(true);
                    try {
                        const code = await investmentProductService.getNextCode();
                        setFormData(prev => ({ ...prev, product_code: code }));
                    } catch (error) {
                        console.error('Error fetching next code:', error);
                        setFormData(prev => ({ ...prev, product_code: '' }));
                    } finally {
                        setIsLoadingCode(false);
                    }
                };
                fetchNextCode();
            }
            setErrors({});
            setTouched({});
        }
    }, [initialData, isOpen]);

    const addRateRow = () => {
        setFormData(prev => ({
            ...prev,
            interest_rates_json: [
                ...prev.interest_rates_json,
                { term_months: 0, interest_monthly: 0, interest_maturity: 0, breakdown_monthly: 0, breakdown_maturity: 0 }
            ]
        }));
    };

    const removeRateRow = (index: number) => {
        setFormData(prev => ({
            ...prev,
            interest_rates_json: prev.interest_rates_json.filter((_, i) => i !== index)
        }));
    };

    const updateRateRow = (index: number, field: keyof InterestRateTier, value: any) => {
        setFormData(prev => {
            const newRates = [...prev.interest_rates_json];
            // If the value is NaN (e.g. from empty input), store it as 0 or empty to prevent rendering issues
            const numericValue = isNaN(parseFloat(value)) ? 0 : parseFloat(value);
            const intValue = isNaN(parseInt(value)) ? 0 : parseInt(value);

            const finalValue = field === 'term_months' ? intValue : numericValue;

            newRates[index] = { ...newRates[index], [field]: finalValue };
            return { ...prev, interest_rates_json: newRates };
        });
    };

    const handleSubmit = () => {
        // Mark all fields as touched to show errors
        const allTouched: { [key: string]: boolean } = {
            name: true, age_limited: true, min_amount: true, max_amount: true
        };
        formData.interest_rates_json.forEach((_, idx) => {
            ['term_months', 'interest_monthly', 'interest_maturity', 'breakdown_monthly', 'breakdown_maturity'].forEach(f => {
                allTouched[`rate_${idx}_${f}`] = true;
            });
        });
        setTouched(prev => ({ ...prev, ...allTouched }));

        if (!isFormValid()) {
            toast.error("Please fill all required fields before saving.", {
                position: "top-right",
                toastId: "val-error-all"
            });
            return;
        }
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-start justify-center z-50 p-4 pt-10 animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-card rounded-[2.5rem] max-w-4xl w-full shadow-2xl relative my-8 animate-in zoom-in duration-300 border border-border-default overflow-hidden flex flex-col">
                {/* Header */}
                <div
                    className="p-6 border-b border-border-divider flex items-center justify-between rounded-t-2xl"
                    style={{ backgroundImage: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[500]}, ${colors.indigo[600]})` }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20 shadow-2xl">
                            <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-black text-white tracking-tight uppercase leading-none">{initialData ? 'Update' : 'Initialize'} Asset Product</h2>
                        <p className="text-white/70 text-[8px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Financial Architecture & Governance</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all group active:scale-90">
                        <X className="w-4 h-4 text-white transition-all group-hover:rotate-90" />
                    </button>
                </div>

                <div className="p-4 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* Identification */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2 flex items-center gap-3 border-b border-border-divider pb-3">
                            <Info className="w-4 h-4" style={{ color: colors.primary[600] }} />
                            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Product Identification</h3>
                        </div>
                        <div>
                            <label className="block text-[8px] font-black text-text-muted uppercase tracking-widest mb-2">Product Code</label>
                            <input
                                type="text"
                                value={formData.product_code}
                                readOnly
                                className="w-full px-3 py-2 bg-muted-bg/30 border border-border-divider rounded-xl font-mono text-text-primary opacity-60 uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Product Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                onBlur={() => markTouched('name')}
                                placeholder="e.g. Fixed Deposit - 12 Months"
                                className={`w-full px-5 py-4 bg-muted-bg/30 border ${getFieldError('name') ? errorBorder : normalBorder} rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none text-text-primary transition-all uppercase`}
                            />
                            {getFieldError('name') && <p className="text-red-500 text-[10px] mt-1 font-bold">Product name is required</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Age Limit (Min Years) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min="0"
                                value={formData.age_limited || ''}
                                onChange={e => {
                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                    setFormData(prev => ({ ...prev, age_limited: e.target.value === '' ? 18 : val }));
                                }}
                                onBlur={() => markTouched('age_limited')}
                                className={`w-full px-5 py-4 bg-muted-bg/30 border ${getFieldError('age_limited') ? errorBorder : normalBorder} rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none text-text-primary transition-all`}
                            />
                            {getFieldError('age_limited') && <p className="text-red-500 text-[10px] mt-1 font-bold">Age limit is required</p>}
                        </div>
                    </div>

                    {/* Rate Configuration Table */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-border-divider/50 pb-4 pt-3">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary-500/10 rounded-xl">
                                    <Calculator className="w-4 h-4 text-primary-500" />
                                </div>
                                <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Asset yield matrix</h3>
                            </div>
                            <button
                                onClick={addRateRow}
                                className="flex items-center gap-2 px-6 py-2 bg-primary-500/10 border border-primary-500/20 rounded-xl text-[9px] font-black text-primary-600 uppercase tracking-widest hover:bg-primary-500/20 transition-all active:scale-95 shadow-lg"
                            >
                                <Plus className="w-3 h-3" /> Add Row
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-border-divider/50 shadow-sm bg-muted-bg/10">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-table-header text-[9px] uppercase tracking-widest text-text-muted">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-border-divider font-black" rowSpan={2}>Months</th>
                                        <th className="px-4 py-3 border-b border-border-divider text-center font-black" colSpan={2}>Interest Rate (%)</th>
                                        <th className="px-4 py-3 border-b border-border-divider text-center font-black text-primary-500" colSpan={2}>Interest Breakdown (%)</th>
                                        <th className="px-4 py-3 border-b border-border-divider text-right font-black" rowSpan={2}>Actions</th>
                                    </tr>
                                    <tr>
                                        <th className="px-4 py-2 border-b border-border-divider text-center font-black">Monthly</th>
                                        <th className="px-4 py-2 border-b border-border-divider text-center font-black">Maturity</th>
                                        <th className="px-4 py-2 border-b border-border-divider text-center font-black text-primary-500 opacity-80">Monthly</th>
                                        <th className="px-4 py-2 border-b border-border-divider text-center font-black text-primary-500 opacity-80">Maturity</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-divider">
                                    {formData.interest_rates_json.map((rate, idx) => (
                                        <tr key={idx} className="hover:bg-table-row-hover transition-colors">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={rate.term_months || ''}
                                                    onChange={e => {
                                                        const val = Math.max(1, parseInt(e.target.value) || 0);
                                                        updateRateRow(idx, 'term_months', e.target.value === '' ? '' : val);
                                                    }}
                                                    onBlur={() => markTouched(`rate_${idx}_term_months`)}
                                                    className={`w-24 px-4 py-2.5 bg-card border ${getRateFieldError(idx, 'term_months') ? errorBorder : normalBorder} rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none text-center text-text-primary text-sm font-black shadow-inner-sm transition-all`}
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={rate.interest_monthly || ''}
                                                    onChange={e => {
                                                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                        updateRateRow(idx, 'interest_monthly', e.target.value === '' ? '' : val);
                                                    }}
                                                    onBlur={() => markTouched(`rate_${idx}_interest_monthly`)}
                                                    className={`w-24 px-4 py-2.5 bg-card border ${getRateFieldError(idx, 'interest_monthly') ? errorBorder : normalBorder} rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none text-center text-text-primary text-sm font-black shadow-inner-sm transition-all`}
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={rate.interest_maturity || ''}
                                                    onChange={e => {
                                                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                        updateRateRow(idx, 'interest_maturity', e.target.value === '' ? '' : val);
                                                    }}
                                                    onBlur={() => markTouched(`rate_${idx}_interest_maturity`)}
                                                    className={`w-24 px-4 py-2.5 bg-card border ${getRateFieldError(idx, 'interest_maturity') ? errorBorder : normalBorder} rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none text-center text-text-primary text-sm font-black shadow-inner-sm transition-all`}
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={rate.breakdown_monthly || ''}
                                                    onChange={e => {
                                                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                        updateRateRow(idx, 'breakdown_monthly', e.target.value === '' ? '' : val);
                                                    }}
                                                    onBlur={() => markTouched(`rate_${idx}_breakdown_monthly`)}
                                                    className={`w-24 px-4 py-2.5 bg-primary-500/5 border ${getRateFieldError(idx, 'breakdown_monthly') ? errorBorder : 'border-primary-500/30'} rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none text-center text-primary-600 text-sm font-black shadow-inner-sm transition-all`}
                                                />
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={rate.breakdown_maturity || ''}
                                                    onChange={e => {
                                                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                        updateRateRow(idx, 'breakdown_maturity', e.target.value === '' ? '' : val);
                                                    }}
                                                    onBlur={() => markTouched(`rate_${idx}_breakdown_maturity`)}
                                                    className={`w-24 px-4 py-2.5 bg-primary-500/5 border ${getRateFieldError(idx, 'breakdown_maturity') ? errorBorder : 'border-primary-500/30'} rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500/50 outline-none text-center text-primary-600 text-sm font-black shadow-inner-sm transition-all`}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => removeRateRow(idx)} className="p-2 text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all active:scale-95 shadow-sm group">
                                                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Negotiation Config */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="md:col-span-2 flex items-center gap-3 border-b border-border-divider pb-4">
                            <Info className="w-5 h-5 text-primary-500" />
                            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Negotiation Configuration</h3>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Negotiation Interest (Monthly) %</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted font-bold opacity-40">%</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.negotiation_rates_json?.monthly || 0}
                                    onChange={e => {
                                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                                        setFormData(prev => ({
                                            ...prev,
                                            negotiation_rates_json: {
                                                ...prev.negotiation_rates_json!,
                                                monthly: e.target.value === '' ? 0 : val
                                            }
                                        }));
                                    }}
                                    className="w-full pl-10 pr-5 py-4 bg-muted-bg/30 border border-border-divider rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none text-text-primary font-bold transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-text-muted uppercase tracking-widest mb-2">Negotiation Interest (Annually) %</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted font-bold opacity-40">%</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.negotiation_rates_json?.maturity || 0}
                                    onChange={e => {
                                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                                        setFormData(prev => ({
                                            ...prev,
                                            negotiation_rates_json: {
                                                ...prev.negotiation_rates_json!,
                                                maturity: e.target.value === '' ? 0 : val
                                            }
                                        }));
                                    }}
                                    className="w-full pl-10 pr-5 py-4 bg-muted-bg/30 border border-border-divider rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none text-text-primary font-bold transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Limits */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="md:col-span-2 flex items-center gap-3 border-b border-border-divider pb-4">
                            <ShieldAlert className="w-5 h-5 text-primary-500" />
                            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Investment Limits</h3>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Min Investment (LKR) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min="0"
                                value={formData.min_amount || ''}
                                onChange={e => {
                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                    setFormData(prev => ({ ...prev, min_amount: e.target.value === '' ? 0 : val }));
                                }}
                                onBlur={() => markTouched('min_amount')}
                                className={`w-full px-5 py-4 bg-muted-bg/30 border ${getFieldError('min_amount') ? errorBorder : normalBorder} rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none text-text-primary font-black transition-all`}
                            />
                            {getFieldError('min_amount') && <p className="text-red-500 text-[10px] mt-1 font-bold">Min investment is required</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Max Investment (LKR) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                min="0"
                                value={formData.max_amount || ''}
                                onChange={e => {
                                    const val = Math.max(0, parseFloat(e.target.value) || 0);
                                    setFormData(prev => ({ ...prev, max_amount: e.target.value === '' ? 0 : val }));
                                }}
                                onBlur={() => markTouched('max_amount')}
                                className={`w-full px-5 py-4 bg-muted-bg/30 border ${getFieldError('max_amount') ? errorBorder : normalBorder} rounded-2xl focus:ring-2 focus:ring-primary-500/20 outline-none text-text-primary font-black transition-all`}
                            />
                            {getFieldError('max_amount') && <p className="text-red-500 text-[10px] mt-1 font-bold">Max investment is required</p>}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border-divider flex gap-4 justify-end bg-muted-bg/30 backdrop-blur-3xl sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-transparent border border-border-divider rounded-xl hover:bg-muted transition-all font-black text-[9px] uppercase tracking-[0.25em] text-text-secondary active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid()}
                        className={`px-12 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 shadow-2xl flex items-center gap-3 ${isFormValid() ? 'bg-primary-600 text-white shadow-primary-500/40 hover:bg-primary-500 hover:shadow-primary-500/60' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                    >
                        {initialData ? <Save className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {initialData ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </div>
        </div>
    );
}

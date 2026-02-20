import React from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ActionConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
    confirmLabel: string;
    variant?: 'success' | 'danger' | 'warning';
}

export function ActionConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    variant = 'success'
}: ActionConfirmModalProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const variantStyles = {
        success: {
            icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
            bg: 'bg-emerald-500/10',
            button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10',
        },
        danger: {
            icon: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
            bg: 'bg-red-500/10',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-500/10',
        },
        warning: {
            icon: <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
            bg: 'bg-amber-500/10',
            button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/10',
        }
    };

    const style = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-border-default transition-colors">
                <div className="p-6 text-center">
                    <div className={`w-14 h-14 ${style.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        {style.icon}
                    </div>
                    <h3 className="text-xl font-black text-text-primary mb-2">{title}</h3>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-5 py-3 bg-muted-bg text-text-secondary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-hover transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 ${style.button} text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : null}
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

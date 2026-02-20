'use client'

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { colors } from '@/themes/colors';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'warning'
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'bg-rose-500/10',
            iconColor: 'text-rose-500',
            button: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
        },
        warning: {
            icon: `bg-amber-500/10`,
            iconColor: `text-amber-500`,
            button: `bg-amber-600 hover:bg-amber-500 shadow-amber-500/20`
        },
        info: {
            icon: `bg-primary-500/10`,
            iconColor: `text-primary-500`,
            button: `bg-primary-600 hover:bg-primary-500 shadow-primary-500/20`
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[2.5rem] max-w-md w-full shadow-2xl border border-border-default overflow-hidden animate-in zoom-in-95 duration-300 transform transition-all">
                <div className="p-10">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className={`w-20 h-20 ${styles.icon} rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-inner ring-1 ring-inset ring-white/10`}>
                            <AlertTriangle className={`w-10 h-10 ${styles.iconColor}`} />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-tight">
                                {title}
                            </h3>
                            <div className="text-[13px] font-bold text-text-secondary leading-relaxed uppercase tracking-tight opacity-70">
                                {message}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 p-3 hover:bg-muted-bg/50 text-text-muted hover:text-rose-500 rounded-2xl transition-all duration-300 group border border-transparent hover:border-border-divider/30"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                </div>

                <div className="px-10 pb-10 flex flex-col sm:flex-row gap-4 justify-center bg-muted-bg/10 pt-2 border-t border-border-divider/30">
                    <button
                        onClick={() => {
                            onConfirm();
                            onCancel();
                        }}
                        className={`flex-1 px-8 py-4.5 text-white rounded-[1.5rem] transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 px-8 py-4.5 border-2 border-border-divider/50 bg-transparent text-text-muted rounded-[1.5rem] hover:bg-muted-bg/50 hover:text-text-primary transition-all duration-300 font-black text-xs uppercase tracking-[0.2em] active:scale-95"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
}

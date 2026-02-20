import React from 'react';
import { Upload, AlertCircle, CheckCircle, X, Eye, Maximize2, Download } from 'lucide-react';
import { DOCUMENT_TYPES, REQUIRED_DOCUMENTS } from '@/constants/loan.constants';
import { LoanFormData } from '@/types/loan.types';
import { getDocumentUrl } from '@/utils/loan.utils';
import { colors } from '@/themes/colors';
import { API_BASE_URL } from '@/services/api.config';

interface DocumentUploadProps {
    formData: LoanFormData;
    onDocumentChange: (type: string, file: File | null) => void;
    showErrors?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ formData, onDocumentChange, showErrors }) => {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [previewType, setPreviewType] = React.useState<string>('');

    React.useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size exceeds 5MB limit');
                return;
            }
        }
        onDocumentChange(type, file);
    };

    const removeFile = (type: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onDocumentChange(type, null);
    };

    const openPreview = async (type: string, file: File | null, existing: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setPreviewType(type);
        } else if (existing) {
            try {
                const docId = existing.id;
                if (!docId) {
                    setPreviewUrl(getDocumentUrl(existing.url || existing.file_path));
                    setPreviewType(type);
                    return;
                }
                let endpoint = `${API_BASE_URL}/media/loan-documents/${docId}`;

                // If the document is imported from the customer profile, use the customer media endpoint
                if (existing.is_from_profile) {
                    const typeParam = type.toLowerCase().includes('nic') ? 'nic' : 'profile';
                    endpoint = `${API_BASE_URL}/media/customers/${formData.customer}?type=${typeParam}`;
                }

                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    // Fallback to old behavior if secure fetch fails
                    setPreviewUrl(getDocumentUrl(existing.url || existing.file_path));
                    setPreviewType(type);
                    return;
                }

                const blob = await response.blob();
                setPreviewUrl(URL.createObjectURL(blob));
                setPreviewType(type);
            } catch (error) {
                console.error('Error previewing document:', error);
                // Fallback to old behavior if ID is missing or fetch fails
                setPreviewUrl(getDocumentUrl(existing.url || existing.file_path));
                setPreviewType(type);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Upload Documents</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DOCUMENT_TYPES.map((type) => {
                    const selectedFile = formData.documents?.[type];
                    const existingDoc = [...(formData.existingDocuments || [])].reverse().find(doc => doc.type === type);
                    const isRequired = REQUIRED_DOCUMENTS.includes(type as any);
                    const hasDocument = selectedFile || existingDoc;

                    return (
                        <div
                            key={type}
                            className={`group relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer overflow-hidden ${hasDocument
                                ? 'border-emerald-500/50 bg-emerald-500/5'
                                : (isRequired && showErrors)
                                    ? 'border-rose-500 bg-rose-500/10 ring-4 ring-rose-500/10 scale-[1.02]'
                                    : isRequired
                                        ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10'
                                        : 'border-border-divider/50 bg-muted-bg/20 hover:border-primary-500/40 hover:bg-primary-500/5'
                                }`}
                            onClick={() => document.getElementById(`file-${type}`)?.click()}
                        >
                            {/* Decorative background element */}
                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-3xl opacity-20 transition-all duration-500 group-hover:scale-150 ${hasDocument ? 'bg-emerald-500' : isRequired ? 'bg-amber-500' : 'bg-primary-500'}`} />

                            <input
                                id={`file-${type}`}
                                type="file"
                                className="hidden"
                                accept=".jpg,.jpeg,.png,.pdf"
                                onChange={(e) => handleFileChange(type, e)}
                            />

                            {selectedFile ? (
                                <div className="space-y-4 relative z-10 animate-in zoom-in duration-300">
                                    <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-1.5">
                                            {type} {isRequired && <span className="text-rose-500 font-bold">*</span>}
                                        </p>
                                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter opacity-70">Status: Selected</p>
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={(e) => openPreview(type, selectedFile, null, e)}
                                            className="text-[10px] text-text-primary font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span className="max-w-[80px] truncate">{selectedFile.name}</span>
                                        </button>
                                        <button
                                            onClick={removeFile.bind(null, type)}
                                            className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all bg-rose-500/10 border border-rose-500/20"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : existingDoc ? (
                                <div className="space-y-4 relative z-10">
                                    <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto border border-primary-500/30">
                                        <CheckCircle className="w-8 h-8 text-primary-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-text-primary uppercase tracking-widest mb-1.5">
                                            {type} {isRequired && <span className="text-rose-500 font-bold">*</span>}
                                        </p>
                                        <p className="text-[10px] text-primary-500 font-black uppercase tracking-tighter opacity-70">Status: Attached</p>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={(e) => openPreview(type, null, existingDoc, e)}
                                            className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm ${(existingDoc as any).is_from_profile ? 'bg-amber-500 text-white shadow-amber-500/20 hover:opacity-90' : 'bg-primary-500 text-white shadow-primary-500/20 hover:opacity-90'}`}
                                        >
                                            <Eye className="w-4 h-4" />
                                            {(existingDoc as any).is_from_profile ? 'From Profile' : 'View Document'}
                                        </button>
                                        <span className="text-[9px] text-text-muted/60 font-black uppercase tracking-[0.2em] italic">
                                            {(existingDoc as any).is_from_profile ? 'Document is from customer profile' : 'Click to replace document'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 relative z-10 transition-transform group-hover:scale-105 duration-300">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border transition-colors ${isRequired ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' : 'bg-muted-bg/40 border-border-divider/50 text-text-muted/40'}`}>
                                        <Upload className={`w-8 h-8 ${(isRequired && showErrors) ? 'animate-bounce text-rose-500' : ''}`} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-widest mb-1.5 ${(isRequired && showErrors) ? 'text-rose-500' : 'text-text-primary'}`}>
                                            {type} {isRequired && <span className="text-rose-500 font-bold">*</span>}
                                        </p>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.15em] opacity-40 italic ${isRequired ? (showErrors ? 'text-rose-500 opacity-100' : 'text-amber-500/80') : 'text-text-muted'}`}>
                                            {isRequired ? (showErrors ? 'MISSING REQUIRED DOCUMENT' : 'Required') : 'Click to upload'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Preview Modal */}
            {previewUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md animate-in fade-in duration-500"
                    onClick={() => setPreviewUrl(null)}
                >
                    <div
                        className="relative max-w-6xl w-full max-h-[90vh] bg-card border border-border-divider/50 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col scale-in-center"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Decorative modal gradient */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600" />

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-border-divider/30 bg-muted-bg/20">
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 rounded-2xl bg-primary-500/10 text-primary-500 border border-primary-500/20">
                                    <Maximize2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-primary uppercase tracking-[0.1em] leading-tight">{previewType}</h3>
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-40 mt-1">DOCUMENT PREVIEW</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={previewUrl}
                                    download
                                    target="_blank"
                                    className="h-12 px-6 bg-muted-bg/40 hover:bg-muted-bg border border-border-divider/50 rounded-2xl text-text-primary transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-sm active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="w-12 h-12 flex items-center justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl transition-all active:scale-95"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto bg-black/20 flex items-center justify-center p-12 overflow-y-auto">
                            {previewUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-full min-h-[70vh] rounded-[2rem] shadow-2xl border border-border-divider/30"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="relative group/preview-img">
                                    <div className="absolute -inset-4 bg-primary-500/10 blur-3xl opacity-0 group-hover/preview-img:opacity-100 transition-opacity duration-700" />
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="relative z-10 max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl transition-all duration-700 group-hover/preview-img:scale-[1.02]"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-muted-bg/20 border-t border-border-divider/30 text-center">
                            <p className="text-[10px] text-text-muted/40 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Press ESC or click outside to close
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

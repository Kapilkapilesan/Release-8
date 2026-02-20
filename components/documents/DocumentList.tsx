import React from 'react';
import BMSLoader from '@/components/common/BMSLoader';
import { DocumentRecord } from '@/types/document.types';
import { FileText, Download, Eye, Trash2, Printer, Calendar, File } from 'lucide-react';

interface DocumentListProps {
    documents: DocumentRecord[];
    isLoading: boolean;
    onDownload: (doc: DocumentRecord) => void;
    onPreview: (doc: DocumentRecord) => void;
    onDelete: (id: number) => void;
    onPrint: (doc: DocumentRecord) => void;
    canDelete?: boolean;
    canDownload?: boolean;
}

export function DocumentList({ documents, isLoading, onDownload, onPreview, onDelete, onPrint, canDelete = false, canDownload = false }: DocumentListProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <BMSLoader message="Loading documents..." size="xsmall" />
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No Documents Found</h3>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
                <div key={doc.id} className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 line-clamp-1" title={doc.title}>{doc.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                    <span className="uppercase font-bold tracking-wider">{doc.file_type}</span>
                                    <span>•</span>
                                    <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                                </div>
                            </div>
                        </div>
                        {canDelete && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => onDelete(doc.id)}
                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    title="Delete Document"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {doc.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">{doc.description}</p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                            {canDownload && (
                                <>
                                    <button
                                        onClick={() => onPrint(doc)}
                                        className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                                        title="Print"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onPreview(doc)}
                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onDownload(doc)}
                                        className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

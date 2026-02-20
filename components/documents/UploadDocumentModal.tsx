import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { DocumentCategory, DocumentUploadPayload } from '@/types/document.types';
import { toast } from 'react-toastify';

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (payload: DocumentUploadPayload) => Promise<void>;
}

const CATEGORIES: DocumentCategory[] = ['Forms', 'Contracts', 'Reports', 'Templates', 'Legal', 'Reference'];
const FILE_TYPES = ['PDF', 'Excel', 'Word', 'Image'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function UploadDocumentModal({ isOpen, onClose, onUpload }: UploadDocumentModalProps) {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<string>('Forms');
    const [fileType, setFileType] = useState('PDF');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const chosen = e.target.files[0];
            if (chosen.size > MAX_FILE_SIZE_BYTES) {
                toast.error(`File must be ${MAX_FILE_SIZE_MB} MB or less. This file is ${(chosen.size / 1024 / 1024).toFixed(1)} MB.`);
                e.target.value = '';
                return;
            }
            setFile(chosen);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !category || !fileType || !file) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsUploading(true);
        try {
            await onUpload({
                title,
                category,
                file_type: fileType.toLowerCase(),
                file,
                description
            });
            toast.success('Document uploaded successfully');
            onClose();
            // Reset form
            setTitle('');
            setCategory('Forms');
            setFile(null);
            setDescription('');
        } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Upload failed';
            toast.error(message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                        <p className="text-sm text-gray-500">Add a new document to the library</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Document Name *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter document name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">File Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {FILE_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFileType(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${fileType === type
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">File Upload *</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                }`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept={fileType === 'Image' ? 'image/*' : fileType === 'PDF' ? '.pdf' : fileType === 'Excel' ? '.xls,.xlsx' : '.doc,.docx'}
                            />
                            {file ? (
                                <>
                                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                    <p className="text-sm font-medium text-green-700">{file.name}</p>
                                    <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-600">Click to upload or drag and drop</p>
                                    <p className="text-xs text-gray-400 mt-1">Supported: {fileType} · Max {MAX_FILE_SIZE_MB} MB</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Enter document description"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    Upload Document
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import React, { useState, useRef } from 'react';
import { FILE_UPLOAD_CONFIG } from '../utils/constants';

const FileUpload = ({ 
  onFileSelect, 
  multiple = false, 
  accept = 'image/*', 
  maxFiles = 5,
  className = '',
  disabled = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    setError('');
    
    if (!files || files.length === 0) return;

    // Validate file count
    if (multiple && files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file types
    const allowedTypes = accept.split(',').map(type => type.trim());
    const invalidFiles = Array.from(files).filter(file => {
      return !allowedTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        if (type === 'application/pdf') return file.type === 'application/pdf';
        return file.type === type;
      });
    });

    if (invalidFiles.length > 0) {
      setError(`Invalid file type. Allowed types: ${accept}`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = Array.from(files).filter(file => 
      file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE
    );

    if (oversizedFiles.length > 0) {
      setError(`File size too large. Maximum size: ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }

    // Create previews for images
    const newPreviews = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push({
            file,
            preview: e.target.result,
            name: file.name,
            size: file.size
          });
          
          if (newPreviews.length === Array.from(files).length) {
            setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews);
            onFileSelect(multiple ? files : files[0]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          file,
          preview: null,
          name: file.name,
          size: file.size
        });
        
        if (newPreviews.length === Array.from(files).length) {
          setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews);
          onFileSelect(multiple ? files : files[0]);
        }
      }
    });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    if (disabled) return;
    handleFiles(e.target.files);
  };

  const removePreview = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="text-sm text-gray-600">
            <span className="font-medium text-primary-600 hover:text-primary-500">
              Click to upload
            </span>
            {' '}or drag and drop
          </div>
          
          <p className="text-xs text-gray-500">
            {accept === 'image/*' ? 'PNG, JPG, GIF up to 10MB' : 
             accept === 'application/pdf' ? 'PDF up to 10MB' :
             'Files up to 10MB'}
            {multiple && ` (max ${maxFiles} files)`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Selected Files:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  {preview.preview ? (
                    <img
                      src={preview.preview}
                      alt={preview.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* File Info */}
                <div className="mt-1 text-xs text-gray-500 truncate">
                  {preview.name}
                </div>
                <div className="text-xs text-gray-400">
                  {formatFileSize(preview.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

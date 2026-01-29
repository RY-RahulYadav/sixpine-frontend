import React, { useState, useEffect, useRef } from 'react';
import { sellerAPI } from '../../../services/api';
import { showToast } from '../../Admin/utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface MediaItem {
  id: number;
  cloudinary_url: string;
  cloudinary_public_id: string | null;
  file_name: string;
  file_size: number | null;
  mime_type: string;
  alt_text: string;
  description: string;
  uploaded_by_user: number | null;
  uploaded_by_vendor: number | null;
  uploaded_by_name: string;
  uploaded_by_type: 'admin' | 'seller' | 'unknown';
  created_at: string;
  updated_at: string;
}

const SellerMedia: React.FC = () => {
  const { showConfirmation } = useNotification();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [applyWatermark, setApplyWatermark] = useState<boolean>(false);
  const [convertWebp, setConvertWebp] = useState<boolean>(false);
  const [keepOriginal, setKeepOriginal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, [searchTerm]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await sellerAPI.getMedia(params);
      const data = response.data;
      if (Array.isArray(data)) {
        setMediaItems(data);
      } else if (data && Array.isArray(data.results)) {
        setMediaItems(data.results);
      } else {
        setMediaItems([]);
      }
    } catch (err: any) {
      console.error('Error fetching media:', err);
      showToast('Failed to load media', 'error');
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        showToast('File size too large. Maximum size is 10MB.', 'error');
        e.target.value = ''; // Clear the input
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a file', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (altText.trim()) {
        formData.append('alt_text', altText.trim());
      }
      if (description.trim()) {
        formData.append('description', description.trim());
      }

        // Append processing options
        formData.append('apply_watermark', applyWatermark ? 'true' : 'false');
        formData.append('convert_webp', convertWebp ? 'true' : 'false');
        formData.append('keep_original', keepOriginal ? 'true' : 'false');

      await sellerAPI.uploadMedia(formData);
      showToast('Image uploaded successfully', 'success');
      setShowUploadModal(false);
      resetUploadForm();
      fetchMedia();
    } catch (err: any) {
      console.error('Error uploading media:', err);
      showToast(err.response?.data?.error || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAltText('');
    setDescription('');
    setApplyWatermark(false);
    setConvertWebp(false);
    setKeepOriginal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Image',
      message: 'Are you sure you want to delete this image?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await sellerAPI.deleteMedia(id);
      showToast('Image deleted successfully', 'success');
      fetchMedia();
    } catch (err: any) {
      console.error('Error deleting media:', err);
      showToast(err.response?.data?.error || 'Failed to delete image', 'error');
    }
  };

  const handleCopyLink = async (url: string, id: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(id);
      showToast('Link copied to clipboard', 'success');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(id);
        showToast('Link copied to clipboard', 'success');
        setTimeout(() => setCopySuccess(null), 2000);
      } catch (e) {
        showToast('Failed to copy link', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="admin-loading-state">
        <div className="admin-loader"></div>
        <p>Loading media...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Upload Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 'var(--spacing-xs)' }}>Media Library</h2>
          <p style={{ margin: 0, color: 'var(--admin-text-light)' }}>Manage your uploaded images</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="admin-btn admin-btn-primary"
        >
          <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>upload</span>
          Upload Image
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <input
          type="text"
          placeholder="Search by filename, alt text, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-form-input"
          style={{ maxWidth: '400px' }}
        />
      </div>

      {/* Media Grid */}
      {mediaItems.length === 0 ? (
        <div className="admin-empty-state">
          <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--admin-text-light)', marginBottom: 'var(--spacing-md)' }}>image</span>
          <p>No images found</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="admin-btn admin-btn-primary"
          >
            Upload Your First Image
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 'var(--spacing-lg)'
        }}>
          {mediaItems.map((item) => (
            <div key={item.id} className="admin-modern-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Image Preview */}
              <div style={{
                width: '100%',
                aspectRatio: '1',
                overflow: 'hidden',
                background: 'var(--admin-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <img
                  src={item.cloudinary_url}
                  alt={item.alt_text || item.file_name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(item.cloudinary_url, '_blank')}
                />
                {/* Hover Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  cursor: 'pointer'
                }}
                className="admin-media-overlay"
                onClick={() => window.open(item.cloudinary_url, '_blank')}
                >
                  <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '32px' }}>open_in_new</span>
                </div>
              </div>

              {/* Image Info */}
              <div style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <p style={{
                    margin: 0,
                    fontWeight: '600',
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{item.file_name}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--admin-text-light)' }}>
                    {formatFileSize(item.file_size)} • {formatDate(item.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="admin-action-buttons">
                  <button
                    onClick={() => handleCopyLink(item.cloudinary_url, item.id)}
                    className="admin-btn admin-btn-secondary"
                    style={{ flex: 1 }}
                    title="Copy link"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {copySuccess === item.id ? 'check' : 'link'}
                    </span>
                    {copySuccess === item.id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="admin-btn admin-btn-danger"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="admin-modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Upload Image</h3>
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                className="admin-btn-icon"
                disabled={uploading}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpload} className="admin-modal-body">
              <div className="form-group">
                <label htmlFor="image">Select Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="admin-form-input"
                />
                {previewUrl && (
                  <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--admin-border)'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="alt_text">Alt Text (Optional)</label>
                <input
                  type="text"
                  id="alt_text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  disabled={uploading}
                  className="admin-form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description"
                  disabled={uploading}
                  className="admin-form-input"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, marginBottom: '6px', display: 'block' }}>Upload Options</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <input type="checkbox" checked={applyWatermark} onChange={(e) => setApplyWatermark(e.target.checked)} />
                  <span>Apply Watermark</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <input type="checkbox" checked={convertWebp} onChange={(e) => setConvertWebp(e.target.checked)} />
                  <span>Convert to WebP</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={keepOriginal} onChange={(e) => setKeepOriginal(e.target.checked)} />
                  <span>Keep Original (upload original copy)</span>
                </label>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => !uploading && (setShowUploadModal(false), resetUploadForm())}
                  className="admin-btn admin-btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn admin-btn-primary"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-media-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default SellerMedia;


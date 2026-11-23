import React, { useEffect, useRef, useState } from 'react';
import { fileToDataUrl } from '../services/hotelApi.js';
import { CloseIcon, UploadIcon } from './Icons.jsx';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MIN_DESCRIPTION_LENGTH = 20;

function optimizeImageDataUrl(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxWidth = 1280;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function HotelForm({
  isOpen,
  initialHotel = null,
  onSubmit,
  onCancel,
}) {
  const isEditMode = Boolean(initialHotel);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageFileName, setImageFileName] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialHotel) {
      setTitle(initialHotel.title || '');
      setDescription(initialHotel.description || '');
      setLatitude(
        initialHotel.latitude !== undefined && initialHotel.latitude !== null
          ? String(initialHotel.latitude)
          : ''
      );
      setLongitude(
        initialHotel.longitude !== undefined && initialHotel.longitude !== null
          ? String(initialHotel.longitude)
          : ''
      );
      setPrice(
        initialHotel.price !== undefined && initialHotel.price !== null
          ? String(initialHotel.price)
          : ''
      );
      setImageUrl(initialHotel.imageUrl || '');
      setImageFile(null);
      setImageFileName('');
    } else {
      setTitle('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setPrice('');
      setImageUrl('');
      setImageFile(null);
      setImageFileName('');
    }

    setErrors({});
    setIsSubmitting(false);
  }, [isOpen, initialHotel]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) {
    return null;
  }

  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: 'Please select a valid image file (JPEG, PNG, WebP, or GIF).',
      }));
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        image: 'Image file size must be 10 MB or smaller.',
      }));
      event.target.value = '';
      return;
    }

    try {
      const rawDataUrl = await fileToDataUrl(file);
      const optimizedUrl = await optimizeImageDataUrl(rawDataUrl);
      setImageUrl(optimizedUrl);
      setImageFile(file);
      setImageFileName(file.name);
      clearFieldError('image');
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        image: error.message || 'Unable to load image preview.',
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!imageUrl) {
      nextErrors.image = 'A hotel image is required. Please upload a valid image file.';
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      nextErrors.title = 'Hotel title is required and cannot be empty.';
    }

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      nextErrors.description = 'Description is required.';
    } else if (trimmedDesc.length < MIN_DESCRIPTION_LENGTH) {
      nextErrors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters (currently ${trimmedDesc.length}).`;
    }

    const parsedLat = Number(latitude);
    if (latitude.trim() === '' || Number.isNaN(parsedLat)) {
      nextErrors.latitude = 'Latitude is required and must be a valid number.';
    } else if (parsedLat < -90 || parsedLat > 90) {
      nextErrors.latitude = 'Latitude must be between -90 and 90 degrees.';
    }

    const parsedLng = Number(longitude);
    if (longitude.trim() === '' || Number.isNaN(parsedLng)) {
      nextErrors.longitude = 'Longitude is required and must be a valid number.';
    } else if (parsedLng < -180 || parsedLng > 180) {
      nextErrors.longitude = 'Longitude must be between -180 and 180 degrees.';
    }

    const parsedPrice = Number(price);
    if (price.trim() === '' || Number.isNaN(parsedPrice)) {
      nextErrors.price = 'Price is required and must be a valid number.';
    } else if (parsedPrice <= 0) {
      nextErrors.price = 'Price must be greater than zero.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        price: Number(price),
        imageUrl,
        imageFile,
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: error.message || 'Unable to save hotel details. Please try again.',
      }));
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onCancel();
        }
      }}
    >
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hotel-form-title"
      >
        <div className="modal-header">
          <h2 id="hotel-form-title" className="modal-title">
            {isEditMode ? 'Edit Hotel Listing' : 'Add New Hotel'}
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close hotel form"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} noValidate>
          <div className="modal-body">
            {errors.form && (
              <p className="form-error-msg" role="alert">
                {errors.form}
              </p>
            )}

            {/* 1. Hotel Image Upload & Preview */}
            <div className="form-field">
              <div className="form-label-row">
                <label htmlFor="hotel-image-upload" className="form-label">
                  Hotel Image <span className="form-required">*</span>
                </label>
                <span className="form-helper">JPEG, PNG, WebP, or GIF</span>
              </div>

              <div className={`image-upload-area ${errors.image ? 'has-error' : ''}`}>
                <div className="image-upload-controls">
                  <input
                    ref={fileInputRef}
                    id="hotel-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="image-file-input"
                    onChange={handleImageChange}
                    aria-invalid={Boolean(errors.image)}
                    aria-describedby={errors.image ? 'hotel-image-error' : undefined}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon size={15} />
                    <span>{imageUrl ? 'Change Image' : 'Upload Image'}</span>
                  </button>
                  <span className="form-helper">
                    {imageFileName
                      ? `Selected: ${imageFileName}`
                      : imageUrl
                        ? 'Current hotel photo ready'
                        : 'No file selected yet'}
                  </span>
                </div>

                {imageUrl && (
                  <div className="image-preview-frame">
                    <img
                      src={imageUrl}
                      alt={title ? `Preview of ${title}` : 'Uploaded hotel preview'}
                      className="image-preview-img"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {errors.image && (
                <span id="hotel-image-error" className="form-error-msg" role="alert">
                  {errors.image}
                </span>
              )}
            </div>

            {/* 2. Hotel Title */}
            <div className="form-field">
              <label htmlFor="hotel-title-input" className="form-label">
                Hotel Title <span className="form-required">*</span>
              </label>
              <input
                id="hotel-title-input"
                type="text"
                className={`form-control ${errors.title ? 'has-error' : ''}`}
                placeholder="e.g. Harborview Grand Hotel"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  clearFieldError('title');
                }}
                aria-invalid={Boolean(errors.title)}
                aria-describedby={errors.title ? 'hotel-title-error' : undefined}
              />
              {errors.title && (
                <span id="hotel-title-error" className="form-error-msg" role="alert">
                  {errors.title}
                </span>
              )}
            </div>

            {/* 3. Description */}
            <div className="form-field">
              <div className="form-label-row">
                <label htmlFor="hotel-description-input" className="form-label">
                  Description <span className="form-required">*</span>
                </label>
                <span className="form-helper tabular-nums">
                  {description.trim().length} / {MIN_DESCRIPTION_LENGTH} min chars
                </span>
              </div>
              <textarea
                id="hotel-description-input"
                className={`form-control form-textarea ${errors.description ? 'has-error' : ''}`}
                placeholder="Describe the property, setting, architecture, and guest amenities..."
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  clearFieldError('description');
                }}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={
                  errors.description ? 'hotel-description-error' : undefined
                }
              />
              {errors.description && (
                <span id="hotel-description-error" className="form-error-msg" role="alert">
                  {errors.description}
                </span>
              )}
            </div>

            {/* 4 & 5. Latitude & Longitude */}
            <div className="form-row-two">
              <div className="form-field">
                <label htmlFor="hotel-latitude-input" className="form-label">
                  Latitude <span className="form-required">*</span>
                </label>
                <input
                  id="hotel-latitude-input"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  className={`form-control tabular-nums ${errors.latitude ? 'has-error' : ''}`}
                  placeholder="e.g. 36.4166"
                  value={latitude}
                  onChange={(event) => {
                    setLatitude(event.target.value);
                    clearFieldError('latitude');
                  }}
                  aria-invalid={Boolean(errors.latitude)}
                  aria-describedby={errors.latitude ? 'hotel-lat-error' : undefined}
                />
                {errors.latitude && (
                  <span id="hotel-lat-error" className="form-error-msg" role="alert">
                    {errors.latitude}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="hotel-longitude-input" className="form-label">
                  Longitude <span className="form-required">*</span>
                </label>
                <input
                  id="hotel-longitude-input"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  className={`form-control tabular-nums ${errors.longitude ? 'has-error' : ''}`}
                  placeholder="e.g. 25.4324"
                  value={longitude}
                  onChange={(event) => {
                    setLongitude(event.target.value);
                    clearFieldError('longitude');
                  }}
                  aria-invalid={Boolean(errors.longitude)}
                  aria-describedby={errors.longitude ? 'hotel-lng-error' : undefined}
                />
                {errors.longitude && (
                  <span id="hotel-lng-error" className="form-error-msg" role="alert">
                    {errors.longitude}
                  </span>
                )}
              </div>
            </div>

            {/* 6. Price */}
            <div className="form-field">
              <label htmlFor="hotel-price-input" className="form-label">
                Nightly Price (USD) <span className="form-required">*</span>
              </label>
              <input
                id="hotel-price-input"
                type="number"
                step="1"
                min="1"
                className={`form-control tabular-nums ${errors.price ? 'has-error' : ''}`}
                placeholder="e.g. 280"
                value={price}
                onChange={(event) => {
                  setPrice(event.target.value);
                  clearFieldError('price');
                }}
                aria-invalid={Boolean(errors.price)}
                aria-describedby={errors.price ? 'hotel-price-error' : undefined}
              />
              {errors.price && (
                <span id="hotel-price-error" className="form-error-msg" role="alert">
                  {errors.price}
                </span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Create Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

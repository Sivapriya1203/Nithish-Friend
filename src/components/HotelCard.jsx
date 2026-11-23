import React, { useState } from 'react';
import { BrandLogoIcon, EditIcon, EyeIcon, MapPinIcon, TrashIcon } from './Icons.jsx';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function HotelCard({ hotel, onViewDetails, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="hotel-card">
      <button
        type="button"
        className="hotel-card-media-btn"
        onClick={() => onViewDetails(hotel.id)}
        aria-label={`View full details for ${hotel.title}`}
      >
        {!imageError && hotel.imageUrl ? (
          <img
            src={hotel.imageUrl}
            alt={`${hotel.title} exterior and property view`}
            className="hotel-card-image"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-fallback-box">
            <BrandLogoIcon size={28} />
            <span>{hotel.title}</span>
          </div>
        )}
      </button>

      <div className="hotel-card-body">
        <div className="hotel-card-header">
          <h2
            className="hotel-card-title"
            onClick={() => onViewDetails(hotel.id)}
          >
            {hotel.title}
          </h2>
          <div className="hotel-card-price">
            <span className="hotel-card-price-amount tabular-nums">
              {formatPrice(hotel.price)}
            </span>
            <span className="hotel-card-price-unit">per night</span>
          </div>
        </div>

        <div className="hotel-card-coords">
          <MapPinIcon size={14} />
          <span className="mono-value">
            {Number(hotel.latitude).toFixed(4)}, {Number(hotel.longitude).toFixed(4)}
          </span>
        </div>

        <p className="hotel-card-description">{hotel.description}</p>

        <div className="hotel-card-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onViewDetails(hotel.id)}
            aria-label={`View details for ${hotel.title}`}
          >
            <EyeIcon size={15} />
            <span>View Details</span>
          </button>

          <div className="hotel-card-secondary-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onEdit(hotel)}
              aria-label={`Edit ${hotel.title}`}
            >
              <EditIcon size={14} />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="btn btn-danger-outline btn-sm"
              onClick={() => onDelete(hotel)}
              aria-label={`Delete ${hotel.title}`}
            >
              <TrashIcon size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

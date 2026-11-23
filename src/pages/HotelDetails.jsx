import React, { useState } from 'react';
import HotelMap from '../components/HotelMap.jsx';
import {
  ArrowLeftIcon,
  BrandLogoIcon,
  EditIcon,
  TrashIcon,
} from '../components/Icons.jsx';
import SeoHead from '../components/SeoHead.jsx';

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export default function HotelDetails({ hotel, onBack, onEdit, onDelete }) {
  const [imageError, setImageError] = useState(false);

  if (!hotel) {
    return (
      <main className="app-main">
        <SeoHead
          title="Hotel Not Found — Hotel Explorer"
          description="The requested hotel listing could not be found."
        />
        <section className="empty-state">
          <div className="empty-state-icon">
            <BrandLogoIcon size={24} />
          </div>
          <h1 className="empty-state-title">Hotel listing not found</h1>
          <p className="empty-state-text">
            This property may have been removed or the URL is no longer valid.
          </p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            <ArrowLeftIcon size={16} />
            <span>Back to All Hotels</span>
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-main">
      <SeoHead
        title={`${hotel.title} — Hotel Explorer`}
        description={hotel.description.slice(0, 155)}
      />

      <div className="details-breadcrumb">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onBack}>
          <ArrowLeftIcon size={15} />
          <span>Back to All Hotels</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(hotel)}
          >
            <EditIcon size={14} />
            <span>Edit Hotel</span>
          </button>
          <button
            type="button"
            className="btn btn-danger-outline btn-sm"
            onClick={() => onDelete(hotel)}
          >
            <TrashIcon size={14} />
            <span>Delete Hotel</span>
          </button>
        </div>
      </div>

      <div className="details-layout">
        <article className="details-main-card">
          <div className="details-hero-media">
            {!imageError && hotel.imageUrl ? (
              <img
                src={hotel.imageUrl}
                alt={`${hotel.title} full architectural view`}
                className="details-hero-image"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="image-fallback-box">
                <BrandLogoIcon size={36} />
                <span>{hotel.title}</span>
              </div>
            )}
          </div>

          <div className="details-content">
            <div className="details-title-row">
              <h1 className="details-title">{hotel.title}</h1>
              <div className="details-price-block">
                <div className="details-price-value tabular-nums">
                  {formatPrice(hotel.price)}
                </div>
                <div className="details-price-caption">per night</div>
              </div>
            </div>

            <p className="details-description">{hotel.description}</p>

            <div className="details-specs-grid">
              <div className="details-spec-item">
                <span className="details-spec-label">Nightly Rate</span>
                <span className="details-spec-value tabular-nums">
                  {formatPrice(hotel.price)}
                </span>
              </div>

              <div className="details-spec-item">
                <span className="details-spec-label">Latitude</span>
                <span className="details-spec-value mono-value">
                  {Number(hotel.latitude).toFixed(6)}°
                </span>
              </div>

              <div className="details-spec-item">
                <span className="details-spec-label">Longitude</span>
                <span className="details-spec-value mono-value">
                  {Number(hotel.longitude).toFixed(6)}°
                </span>
              </div>
            </div>
          </div>
        </article>

        <div className="details-sidebar">
          <HotelMap
            hotelName={hotel.title}
            latitude={hotel.latitude}
            longitude={hotel.longitude}
          />
        </div>
      </div>
    </main>
  );
}

import React, { useState } from 'react';
import { MapPinIcon, NavigationIcon } from './Icons.jsx';

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const toRadians = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export default function HotelMap({ hotelName, latitude, longitude }) {
  const [userDistanceKm, setUserDistanceKm] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');
  const [geoError, setGeoError] = useState('');

  const lat = Number(latitude);
  const lng = Number(longitude);
  const delta = 0.03;

  const minLon = Math.max(-180, lng - delta);
  const maxLon = Math.min(180, lng + delta);
  const minLat = Math.max(-85, lat - delta);
  const maxLat = Math.min(85, lat + delta);

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
  const externalMapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;

  const handleCheckDistance = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('error');
      setGeoError('Browser geolocation is not supported on this device.');
      return;
    }

    setGeoStatus('loading');
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distanceKm = calculateHaversineKm(
          position.coords.latitude,
          position.coords.longitude,
          lat,
          lng
        );
        setUserDistanceKm(distanceKm);
        setGeoStatus('resolved');
      },
      (error) => {
        setGeoStatus('error');
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission was declined. Showing saved hotel coordinates.');
        } else {
          setGeoError('Unable to determine your current position right now.');
        }
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  return (
    <aside className="details-map-card" aria-label="Hotel map location">
      <h2 className="details-section-heading">Property Location</h2>

      <div className="map-frame-wrap">
        <iframe
          title={`Map showing location of ${hotelName}`}
          src={embedUrl}
          className="map-iframe"
          loading="lazy"
        />
      </div>

      <div className="map-coordinates-row">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <MapPinIcon size={15} />
          <span className="mono-value">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </span>
        <a
          href={externalMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-primary)', fontWeight: 600 }}
        >
          Open Larger Map
        </a>
      </div>

      <div className="map-geo-panel">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleCheckDistance}
          disabled={geoStatus === 'loading'}
        >
          <NavigationIcon size={14} />
          <span>
            {geoStatus === 'loading'
              ? 'Checking Location...'
              : 'Measure Distance from My Location'}
          </span>
        </button>

        {geoStatus === 'resolved' && userDistanceKm !== null && (
          <p className="map-geo-result tabular-nums">
            Approximately{' '}
            <strong>
              {userDistanceKm >= 1
                ? `${Math.round(userDistanceKm).toLocaleString()} km`
                : `${Math.round(userDistanceKm * 1000)} m`}
            </strong>{' '}
            ({Math.round(userDistanceKm * 0.621371).toLocaleString()} miles) from your
            current location.
          </p>
        )}

        {geoStatus === 'error' && geoError && (
          <p className="map-geo-error" role="alert">
            {geoError}
          </p>
        )}
      </div>
    </aside>
  );
}

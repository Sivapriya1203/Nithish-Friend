import React from 'react';
import HotelCard from '../components/HotelCard.jsx';
import { BrandLogoIcon, PlusIcon } from '../components/Icons.jsx';
import Pagination from '../components/Pagination.jsx';
import SearchFilter from '../components/SearchFilter.jsx';
import SeoHead from '../components/SeoHead.jsx';

export default function HotelList({
  hotels,
  totalHotelsCount,
  searchQuery,
  minPrice,
  maxPrice,
  currentPage,
  totalPages,
  itemsPerPage,
  hasActiveFilters,
  onApplyFilters,
  onResetFilters,
  onPageChange,
  onViewDetails,
  onEditHotel,
  onDeleteHotel,
  onAddHotel,
}) {
  return (
    <main className="app-main">
      <SeoHead
        title="Hotel Explorer — Browse & Manage Hotel Listings"
        description="Browse curated hotels, filter by nightly rate, search by property title, and manage listings with full CRUD controls."
      />

      <section className="listing-page-header" aria-label="Hotel listings overview">
        <div className="listing-heading-group">
          <h1 className="listing-title">Hotel Listings</h1>
          <p className="listing-subtitle">
            Browse curated stays, filter by nightly rate, and manage your property
            directory.
          </p>
        </div>

        <div className="listing-meta-summary tabular-nums">
          <span className="listing-meta-strong">{totalHotelsCount}</span>
          <span>{totalHotelsCount === 1 ? 'property matched' : 'properties matched'}</span>
          {hasActiveFilters && (
            <>
              <span aria-hidden="true">·</span>
              <span>Filters active</span>
            </>
          )}
        </div>
      </section>

      <SearchFilter
        searchQuery={searchQuery}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onApplyFilters={onApplyFilters}
        onResetFilters={onResetFilters}
      />

      {hotels.length === 0 ? (
        <section className="empty-state" aria-label="No hotels found">
          <div className="empty-state-icon">
            <BrandLogoIcon size={24} />
          </div>
          <h2 className="empty-state-title">
            {hasActiveFilters ? 'No matching hotels found' : 'No hotel listings yet'}
          </h2>
          <p className="empty-state-text">
            {hasActiveFilters
              ? 'Try widening your price range or clearing the title search to see more properties.'
              : 'Get started by adding your first hotel listing with photography, coordinates, and nightly rate.'}
          </p>
          {hasActiveFilters ? (
            <button type="button" className="btn btn-secondary" onClick={onResetFilters}>
              Reset Filters
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onAddHotel}>
              <PlusIcon size={16} />
              <span>Add First Hotel</span>
            </button>
          )}
        </section>
      ) : (
        <>
          <section className="hotel-grid" aria-label="Hotel properties">
            {hotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onViewDetails={onViewDetails}
                onEdit={onEditHotel}
                onDelete={onDeleteHotel}
              />
            ))}
          </section>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalHotelsCount}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </>
      )}
    </main>
  );
}

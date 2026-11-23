import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons.jsx';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination-bar" aria-label="Hotel listings pagination">
      <p className="pagination-summary tabular-nums">
        Showing {startItem}–{endItem} of {totalItems} hotels
      </p>

      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-page-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon size={15} />
          <span>Previous</span>
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            className={`pagination-page-btn tabular-nums ${
              page === currentPage ? 'is-active' : ''
            }`}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          className="pagination-page-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRightIcon size={15} />
        </button>
      </div>
    </nav>
  );
}

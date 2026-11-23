import React, { useEffect, useState } from 'react';

export default function SearchFilter({
  searchQuery,
  minPrice,
  maxPrice,
  onApplyFilters,
  onResetFilters,
}) {
  const [draftTitle, setDraftTitle] = useState(searchQuery);
  const [draftMin, setDraftMin] = useState(minPrice);
  const [draftMax, setDraftMax] = useState(maxPrice);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setDraftTitle(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    setDraftMin(minPrice);
  }, [minPrice]);

  useEffect(() => {
    setDraftMax(maxPrice);
  }, [maxPrice]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const minVal = draftMin === '' ? null : Number(draftMin);
    const maxVal = draftMax === '' ? null : Number(draftMax);

    if (minVal !== null && minVal < 0) {
      setValidationError('Minimum price cannot be negative.');
      return;
    }

    if (maxVal !== null && maxVal < 0) {
      setValidationError('Maximum price cannot be negative.');
      return;
    }

    if (minVal !== null && maxVal !== null && minVal > maxVal) {
      setValidationError('Minimum price cannot exceed maximum price.');
      return;
    }

    setValidationError('');
    onApplyFilters({
      searchQuery: draftTitle,
      minPrice: draftMin,
      maxPrice: draftMax,
    });
  };

  const handleReset = () => {
    setDraftTitle('');
    setDraftMin('');
    setDraftMax('');
    setValidationError('');
    onResetFilters();
  };

  return (
    <section className="filter-bar" aria-label="Search and price filters">
      <form onSubmit={handleSubmit} noValidate>
        <div className="filter-grid">
          <div className="filter-field">
            <label htmlFor="filter-title" className="filter-label">
              Hotel Name
            </label>
            <input
              id="filter-title"
              type="text"
              className="filter-input"
              placeholder="Filter by hotel title..."
              value={draftTitle}
              onChange={(event) => {
                const nextValue = event.target.value;
                setDraftTitle(nextValue);
                onApplyFilters({
                  searchQuery: nextValue,
                  minPrice: draftMin,
                  maxPrice: draftMax,
                });
              }}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="filter-min-price" className="filter-label">
              Min Price ($)
            </label>
            <input
              id="filter-min-price"
              type="number"
              min="0"
              step="1"
              className="filter-input tabular-nums"
              placeholder="e.g. 150"
              value={draftMin}
              onChange={(event) => setDraftMin(event.target.value)}
            />
          </div>

          <div className="filter-field">
            <label htmlFor="filter-max-price" className="filter-label">
              Max Price ($)
            </label>
            <input
              id="filter-max-price"
              type="number"
              min="0"
              step="1"
              className="filter-input tabular-nums"
              placeholder="e.g. 450"
              value={draftMax}
              onChange={(event) => setDraftMax(event.target.value)}
            />
          </div>

          <div className="filter-actions">
            <button type="submit" className="btn btn-primary">
              Apply Filters
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        {validationError && (
          <p className="filter-validation-note" role="alert">
            {validationError}
          </p>
        )}
      </form>
    </section>
  );
}

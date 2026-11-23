import React, { useState } from 'react';
import {
  BrandLogoIcon,
  CloseIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
} from './Icons.jsx';

export default function Header({
  searchQuery,
  onSearchChange,
  onAddHotelClick,
  onNavigateHome,
  currentRoute,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    onNavigateHome();
  };

  const handleSearchInput = (event) => {
    onSearchChange(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (currentRoute !== 'list') {
      onNavigateHome();
    }
    setMobileMenuOpen(false);
  };

  const handleAddClick = () => {
    setMobileMenuOpen(false);
    onAddHotelClick();
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          type="button"
          className="brand-link"
          onClick={handleLogoClick}
          aria-label="Hotel Explorer — Return to hotel listings"
        >
          <span className="brand-mark">
            <BrandLogoIcon size={19} />
          </span>
          <span className="brand-title">Hotel Explorer</span>
        </button>

        <div className="header-desktop-controls">
          <nav className="header-nav" aria-label="Primary navigation">
            <button
              type="button"
              className={`header-nav-link ${currentRoute === 'list' ? 'is-active' : ''}`}
              onClick={handleLogoClick}
            >
              All Hotels
            </button>
          </nav>

          <form
            className="header-search-form"
            role="search"
            aria-label="Search hotels by title"
            onSubmit={handleSearchSubmit}
          >
            <span className="header-search-icon">
              <SearchIcon size={16} />
            </span>
            <input
              type="search"
              className="header-search-input"
              placeholder="Search hotels by title..."
              value={searchQuery}
              onChange={handleSearchInput}
              aria-label="Search hotels by title"
            />
            {searchQuery && (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </form>

          <div className="header-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddClick}
            >
              <PlusIcon size={16} />
              <span>Add Hotel</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
        </button>
      </div>

      <div
        id="mobile-navigation-drawer"
        className={`mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
      >
        <form
          className="header-search-form"
          style={{ maxWidth: '100%' }}
          role="search"
          aria-label="Mobile search hotels by title"
          onSubmit={handleSearchSubmit}
        >
          <span className="header-search-icon">
            <SearchIcon size={16} />
          </span>
          <input
            type="search"
            className="header-search-input"
            placeholder="Search hotels by title..."
            value={searchQuery}
            onChange={handleSearchInput}
            aria-label="Search hotels by title"
          />
          {searchQuery && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => onSearchChange('')}
              aria-label="Clear search query"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </form>

        <nav className="header-nav" aria-label="Mobile navigation">
          <button
            type="button"
            className={`header-nav-link ${currentRoute === 'list' ? 'is-active' : ''}`}
            onClick={handleLogoClick}
          >
            All Hotels
          </button>
        </nav>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddClick}
        >
          <PlusIcon size={16} />
          <span>Add Hotel</span>
        </button>
      </div>
    </header>
  );
}

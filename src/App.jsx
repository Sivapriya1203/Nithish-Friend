import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmationModal from './components/ConfirmationModal.jsx';
import Header from './components/Header.jsx';
import HotelForm from './components/HotelForm.jsx';
import ToastNotification from './components/ToastNotification.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import HotelList from './pages/HotelList.jsx';
import {
  createHotel,
  deleteHotel,
  fetchHotels,
  updateHotel,
} from './services/hotelApi.js';

const ITEMS_PER_PAGE = 6;

function parseRouteFromHash() {
  const hash = window.location.hash || '';
  const match = hash.match(/^#\/hotels\/(.+)$/);
  if (match && match[1]) {
    return { view: 'details', hotelId: decodeURIComponent(match[1]) };
  }
  return { view: 'list', hotelId: null };
}

export default function App() {
  const [hotels, setHotels] = useState([]);
  const [route, setRoute] = useState(parseRouteFromHash);

  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  const [deletingHotel, setDeletingHotel] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;
    fetchHotels()
      .then((loadedHotels) => {
        if (active) {
          setHotels(loadedHotels);
        }
      })
      .catch((error) => {
        if (active) {
          setToast({
            type: 'error',
            message: error.message || 'Unable to load hotel listings.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRouteFromHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateHome = useCallback(() => {
    if (window.location.hash) {
      window.location.hash = '#/';
    } else {
      setRoute({ view: 'list', hotelId: null });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToDetails = useCallback((hotelId) => {
    window.location.hash = `#/hotels/${encodeURIComponent(hotelId)}`;
  }, []);

  const handleHeaderSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
    if (route.view !== 'list' && value.trim() !== '') {
      navigateHome();
    }
  };

  const handleApplyFilters = ({
    searchQuery: nextSearch,
    minPrice: nextMin,
    maxPrice: nextMax,
  }) => {
    setSearchQuery(nextSearch);
    setMinPrice(nextMin);
    setMaxPrice(nextMax);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const filteredHotels = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const min = minPrice !== '' ? Number(minPrice) : null;
    const max = maxPrice !== '' ? Number(maxPrice) : null;

    return hotels.filter((hotel) => {
      if (normalizedSearch && !hotel.title.toLowerCase().includes(normalizedSearch)) {
        return false;
      }
      const price = Number(hotel.price);
      if (min !== null && price < min) {
        return false;
      }
      if (max !== null && price > max) {
        return false;
      }
      return true;
    });
  }, [hotels, searchQuery, minPrice, maxPrice]);

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedHotels = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredHotels.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredHotels, safePage]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || minPrice !== '' || maxPrice !== ''
  );

  const selectedHotel = useMemo(
    () => hotels.find((item) => item.id === route.hotelId) || null,
    [hotels, route.hotelId]
  );

  const openAddModal = () => {
    setEditingHotel(null);
    setIsFormOpen(true);
  };

  const openEditModal = (hotel) => {
    setEditingHotel(hotel);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (editingHotel) {
      const updated = await updateHotel(editingHotel.id, formData);
      setHotels((prev) =>
        prev.map((item) => (item.id === editingHotel.id ? updated : item))
      );
      setIsFormOpen(false);
      setEditingHotel(null);
      setToast({
        type: 'success',
        message: `"${updated.title}" has been updated.`,
      });
    } else {
      const created = await createHotel(formData);
      setHotels((prev) => [created, ...prev]);
      setIsFormOpen(false);
      setCurrentPage(1);
      if (route.view !== 'list') {
        navigateHome();
      }
      setToast({
        type: 'success',
        message: `"${created.title}" has been added to listings.`,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingHotel) return;
    setIsDeleting(true);
    try {
      const targetTitle = deletingHotel.title;
      const targetId = deletingHotel.id;
      await deleteHotel(targetId);
      setHotels((prev) => prev.filter((item) => item.id !== targetId));
      setDeletingHotel(null);
      if (route.view === 'details' && route.hotelId === targetId) {
        navigateHome();
      }
      setToast({
        type: 'success',
        message: `"${targetTitle}" has been deleted.`,
      });
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Unable to delete hotel listing.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (nextPage) => {
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleHeaderSearchChange}
        onAddHotelClick={openAddModal}
        onNavigateHome={navigateHome}
        currentRoute={route.view}
      />

      {route.view === 'details' ? (
        <HotelDetails
          hotel={selectedHotel}
          onBack={navigateHome}
          onEdit={openEditModal}
          onDelete={setDeletingHotel}
        />
      ) : (
        <HotelList
          hotels={paginatedHotels}
          totalHotelsCount={filteredHotels.length}
          searchQuery={searchQuery}
          minPrice={minPrice}
          maxPrice={maxPrice}
          currentPage={safePage}
          totalPages={totalPages}
          itemsPerPage={ITEMS_PER_PAGE}
          hasActiveFilters={hasActiveFilters}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          onPageChange={handlePageChange}
          onViewDetails={navigateToDetails}
          onEditHotel={openEditModal}
          onDeleteHotel={setDeletingHotel}
          onAddHotel={openAddModal}
        />
      )}

      <footer className="app-footer">
        <div className="app-footer-inner">
          <span className="app-footer-brand">Hotel Explorer</span>
          <span>Hotel Listing Management · Built with ReactJS, HTML5 &amp; CSS3</span>
        </div>
      </footer>

      <HotelForm
        isOpen={isFormOpen}
        initialHotel={editingHotel}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingHotel(null);
        }}
      />

      <ConfirmationModal
        isOpen={Boolean(deletingHotel)}
        title="Delete Hotel Listing"
        message={
          deletingHotel
            ? `Are you sure you want to permanently delete "${deletingHotel.title}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Hotel"
        cancelLabel="Cancel"
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingHotel(null)}
      />

      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

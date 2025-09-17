import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ParticleBackground from './ParticleBackground';

// --- START: Define API_BASE_URL using environment variable ---
const API_BASE_URL = import.meta.env.VITE_API_URL;
// --- END: API_BASE_URL Definition ---

// Reusable Styles for all content pages
const ContentPageStyles = `
  .page-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem;
    position: relative;
    overflow: hidden;
    font-family: 'Ithra Bold', sans-serif !important;
  }

  .page-header {
    width: 100%;
    max-width: 1400px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    position: relative;
    z-index: 2;
    flex-wrap: wrap; 
    gap: 1rem;
  }

  .page-title {
    font-size: 2.5rem;
    color: #ffffff;
    text-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
  }

  .header-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .back-button {
    padding: 10px 25px;
    font-size: 1rem;
    font-family: 'Ithra Bold', sans-serif !important;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  }
  
  .search-bar {
    position: relative;
    flex-grow: 1;
    min-width: 250px;
    max-width: 400px;
  }

  .search-input {
    width: 100%;
    padding: 10px 40px 10px 15px; 
    font-size: 1rem;
    font-family: 'Ithra Bold', sans-serif !important;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    transition: all 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  }

  .search-icon {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.4);
  }

  .page-content {
    flex-grow: 1;
    width: 100%;
    max-width: 1400px;
    background: rgba(15, 24, 37, 0.5);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 2rem;
    color: var(--text-secondary);
    z-index: 2;
    overflow-y: auto;
  }
  
  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2.5rem;
  }

  /* --- START: Final Animated Holographic Card Design --- */
  @keyframes rotate {
    100% {
      transform: rotate(1turn);
    }
  }

  .card-wrapper {
    position: relative;
    transition: transform 0.3s ease;
    padding: 2px; /* This creates the space for the border to appear "outside" */
    border-radius: 14px; /* Slightly larger than the card's border-radius */
    overflow: hidden;
  }

  .card-wrapper::before {
    content: '';
    position: absolute;
    z-index: -1;
    left: -50%;
    top: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 180deg at 50% 50%,
      transparent 0%,
      #00ffff 35%,
      transparent 70%,
      transparent 100%
    );
    animation: rotate 6s linear infinite;
  }

  .card-wrapper:hover {
    transform: translateY(-8px);
  }

  .content-card {
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    background: #0f1825;
    height: 100%;
    display: flex;
    flex-direction: column;
    isolation: isolate; /* Fixes video overlapping the border */
  }
  
  .subcategory-card {
    position: relative;
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #ffffff;
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
    overflow: hidden;
  }
  
  .subcategory-card::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0%;
    height: 0%;
    background: radial-gradient(circle, rgba(0, 255, 255, 0.25) 0%, rgba(0, 255, 255, 0) 70%);
    border-radius: 50%;
    transition: width 0.4s ease, height 0.4s ease, opacity 0.4s ease;
    opacity: 0;
  }

  .subcategory-card:hover {
    transform: translateY(-5px);
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }

  .subcategory-card:hover::before {
    width: 200%;
    height: 200%;
    opacity: 1;
  }

  .card-media-container {
    width: 100%;
    height: 180px;
    background-color: transparent;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
  }
  
  .card-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .card-body {
    padding: 1rem;
    background-color: transparent;
  }
  /* --- END: Final Animated Holographic Card Design --- */

  .card-title {
    font-size: 1.1rem;
    color: #ffffff;
    margin-bottom: 0.5rem;
  }

  .card-description {
    font-size: 0.85rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #b8c5d6;
  }

  .loading-text, .error-text, .empty-text {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
  }

  .error-text {
    color: #ff8a8a;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(10, 25, 47, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-view {
    width: 90%;
    height: 90%;
    max-width: 1200px;
    max-height: 80vh;
    background: rgba(15, 24, 37, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    display: flex;
    overflow: hidden;
  }

  .modal-media {
    flex: 3;
    background-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .modal-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    cursor: zoom-in;
    transition: transform 0.3s ease;
  }

  .modal-image.zoomed {
    transform: scale(1.5);
    cursor: zoom-out;
  }

  .modal-video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .modal-details {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .modal-title {
    font-size: 1.8rem;
    color: #ffffff;
    margin-bottom: 1rem;
  }

  .modal-description {
    font-size: 1rem;
    line-height: 1.7;
    color: #b8c5d6;
    white-space: pre-wrap;
    flex-grow: 1;
  }

  .modal-close-button {
    position: absolute;
    top: 15px;
    left: 15px;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    line-height: 1;
    z-index: 1001;
    transition: all 0.3s ease;
  }

  .modal-close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }

  @media (max-width: 992px) {
    .modal-view { flex-direction: column; max-height: 90vh; }
    .modal-media { flex: 2; }
    .modal-details { flex: 1; padding: 1.5rem; }
    .modal-title { font-size: 1.5rem; }
    .modal-description { font-size: 0.9rem; }
  }

  @media (max-width: 768px) {
    .page-container { padding: 1rem; }
    .page-header { flex-direction: column; gap: 1rem; align-items: center; text-align: center; }
    .page-title { font-size: 1.8rem; }
    .content-grid { grid-template-columns: 1fr; }
    .search-bar { width: 100%; max-width: 100%; }
  }
`;

const isVideoUrl = (url) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.mov', '.ogg'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

function ContentDisplayPage({ pageTitle, category, onBack }) {
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        // --- تم التعديل هنا ---
        const response = await axios.get(`${API_BASE_URL}/api/content/${category}/subcategories`);
        setSubcategories(response.data);
      } catch (err) {
        setError('فشل في جلب الأقسام الفرعية.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategories();
  }, [category]);

  useEffect(() => {
    if (!selectedSubcategory) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        const params = searchTerm ? { q: searchTerm } : {};
        // --- تم التعديل هنا ---
        const response = await axios.get(`${API_BASE_URL}/api/content/${category}/${selectedSubcategory.id}`, { params });
        setItems(response.data);
        setError('');
      } catch (err) {
         setError('فشل في جلب المحتوى.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedSubcategory, searchTerm, category]);

  const handleBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
      setItems([]);
      setError('');
      setSearchTerm('');
    } else {
      onBack();
    }
  };
  
  const openModal = (item) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsZoomed(false);
  };

  const renderCardMedia = (item) => {
    if (!item.imageUrl) {
      return (
        <div className="card-media-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8892b0' }}>
          لا يوجد محتوى مرئي
        </div>
      );
    }
    if (isVideoUrl(item.imageUrl)) {
      return <video className="card-video" src={item.imageUrl} autoPlay loop muted playsInline />;
    }
    return <div className="card-media-container" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>;
  };

  return (
    <>
      <style>{ContentPageStyles}</style>
      <motion.div className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
        <ParticleBackground />
        
        <div className="page-header">
          <h1 className="page-title">{selectedSubcategory ? selectedSubcategory.name : pageTitle}</h1>
          {selectedSubcategory && (
            <div className="search-bar">
                <input 
                  type="text" 
                  className="search-input"
                  placeholder="...ابحث في هذا القسم"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          )}
          <div className="header-actions">
            <button className="back-button" onClick={onBack}>القائمة الرئيسية</button>
            <button className="back-button" onClick={handleBack}>→ رجوع</button>
          </div>
        </div>

        <div className="page-content">
          {loading && <p className="loading-text">جاري التحميل...</p>}
          {error && <p className="error-text">{error}</p>}
          {!loading && !error && (
            !selectedSubcategory ? (
              <div className="content-grid">
                {subcategories.map(sub => (
                  <motion.div 
                    className="subcategory-card"
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {sub.name}
                  </motion.div>
                ))}
                {subcategories.length === 0 && <p className="empty-text">لا توجد أقسام فرعية في هذا القسم بعد.</p>}
              </div>
            ) : (
              items.length > 0 ? (
                <div className="content-grid">
                  {items.map(item => (
                    <motion.div 
                      className="card-wrapper"
                      key={item.id}
                      onClick={() => openModal(item)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="content-card">
                        {renderCardMedia(item)}
                        <div className="card-body">
                          <h2 className="card-title">{item.title}</h2>
                          <p className="card-description">{item.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="empty-text">لا يوجد محتوى لعرضه في هذا القسم الفرعي حالياً.</p>
              )
            )
          )}
        </div>
      </motion.div>
      
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="modal-backdrop"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-view"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button className="modal-close-button" onClick={closeModal}>&times;</button>
              <div className="modal-media">
                {isVideoUrl(selectedItem.imageUrl) ? (
                  <video className="modal-video" src={selectedItem.imageUrl} controls autoPlay />
                ) : (
                  selectedItem.imageUrl && <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.title} 
                    className={`modal-image ${isZoomed ? 'zoomed' : ''}`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                )}
              </div>
              <div className="modal-details">
                <h2 className="modal-title">{selectedItem.title}</h2>
                <p className="modal-description">{selectedItem.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ContentDisplayPage;
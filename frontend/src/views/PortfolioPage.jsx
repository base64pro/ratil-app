import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ParticleBackground from '../components/ParticleBackground';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Reusing and adapting styles from ContentDisplayPage for consistency
const PortfolioPageStyles = `
  /* Most styles are inherited or similar to ContentDisplayPage, adding specifics here */
  .page-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }
  .page-header { width: 100%; max-width: 1600px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; z-index: 2; flex-wrap: wrap; gap: 1rem; }
  .page-title { font-size: 2.5rem; color: #ffffff; }
  .header-actions { display: flex; gap: 1rem; }
  .back-button { padding: 10px 25px; font-size: 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; }
  .back-button:hover { background: rgba(255, 255, 255, 0.2); }
  
  .page-content { flex-grow: 1; width: 100%; max-width: 1600px; background: rgba(15, 24, 37, 0.5); backdrop-filter: blur(5px); border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 1.5rem; z-index: 2; overflow-y: auto; display: flex; flex-direction: column;}
  
  .filters-container { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; padding: 1.5rem; background: rgba(0,0,0,0.2); border-radius: 10px; }
  .filter-row { display: flex; flex-wrap: wrap; gap: 1.5rem; }
  .filter-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1 1 200px; }
  .filter-label { font-size: 0.9rem; color: #b8c5d6; }
  .filter-input, .filter-select { padding: 10px 12px; font-size: 1rem; background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #ffffff; width: 100%; }
  .filter-input:focus, .filter-select:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); }
  
  .content-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
  .card-wrapper { position: relative; transition: transform 0.3s ease; border-radius: 14px; overflow: hidden; }
  .card-wrapper:hover { transform: translateY(-8px); }
  .content-card { border-radius: 12px; overflow: hidden; cursor: pointer; background: #0f1825; height: 100%; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.1); }
  .card-media-container { width: 100%; height: 180px; background-color: #0a0e1a; background-size: cover; background-position: center; }
  .card-video { width: 100%; height: 100%; object-fit: cover; }
  .card-body { padding: 1rem; }
  .card-title { font-size: 1.1rem; color: #ffffff; margin-bottom: 0.5rem; }
  .card-description { font-size: 0.85rem; color: #b8c5d6; margin-bottom: 0.75rem; }
  .card-meta { font-size: 0.75rem; color: #8892b0; display: flex; justify-content: space-between; }

  /* Modal Styles */
  .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(10, 25, 47, 0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .modal-view { width: 90%; height: 90%; max-width: 1200px; max-height: 80vh; background: rgba(15, 24, 37, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 15px; display: flex; overflow: hidden; flex-direction: row-reverse; }
  .modal-media { flex: 3; background-color: #0a0e1a; display: flex; align-items: center; justify-content: center; }
  .modal-image, .modal-video { max-width: 100%; max-height: 100%; object-fit: contain; }
  .modal-details { flex: 1; padding: 2rem; overflow-y: auto; }
  .modal-title { font-size: 1.8rem; margin-bottom: 1rem; }
  .modal-description { font-size: 1rem; line-height: 1.7; color: #b8c5d6; white-space: pre-wrap; margin-bottom: 1.5rem; }
  .modal-meta { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; font-size: 0.9rem; color: #8892b0; }
  .modal-meta p { margin-bottom: 0.5rem; }
  .modal-close-button { position: absolute; top: 15px; right: 15px; /* Changed to right */ width: 40px; height: 40px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; z-index: 1001; }
`;

function PortfolioPage({ onNavigate }) {
    const [items, setItems] = useState([]);
    const [clients, setClients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);

    // --- NEW: Separate state for search/filter inputs ---
    const [filters, setFilters] = useState({
        categoryId: '',
        clientId: '',
        startDate: '',
        endDate: '',
        searchTerm: '' // For general title/description search
    });
    
    // --- NEW: State for live-filtering dropdowns ---
    const [clientFilter, setClientFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');


    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [clientsRes, categoriesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/clients`),
                    axios.get(`${API_BASE_URL}/api/content/portfolio/subcategories`)
                ]);
                setClients(clientsRes.data);
                setCategories(categoriesRes.data);
            } catch (err) {
                setError('فشل في تحميل بيانات الفلترة.');
            }
        };
        fetchInitialData();
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = {
                q: filters.searchTerm || undefined,
                category_id: filters.categoryId || undefined,
                client_id: filters.clientId || undefined,
                start_date: filters.startDate || undefined,
                end_date: filters.endDate || undefined,
            };
            const response = await axios.get(`${API_BASE_URL}/api/portfolio/items`, { params });
            setItems(response.data);
            setError('');
        } catch (err) {
            setError('فشل في جلب مواد المحفظة.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchItems();
    };

    // --- NEW: Memoized filtered lists for dropdowns ---
    const filteredClients = useMemo(() => 
        clients.filter(c => c.name.toLowerCase().includes(clientFilter.toLowerCase())),
        [clients, clientFilter]
    );

    const filteredCategories = useMemo(() => 
        categories.filter(c => c.name.toLowerCase().includes(categoryFilter.toLowerCase())),
        [categories, categoryFilter]
    );

    const isVideoUrl = (url) => url && ['.mp4', '.webm', '.mov'].some(ext => url.toLowerCase().endsWith(ext));

    return (
        <>
            <style>{PortfolioPageStyles}</style>
            <motion.div className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ParticleBackground />
                <div className="page-header">
                    <h1 className="page-title">محفظة المواد الرقمية</h1>
                    <div className="header-actions">
                        <button className="back-button" onClick={() => onNavigate('home')}>القائمة الرئيسية</button>
                    </div>
                </div>
                <div className="page-content">
                    <form onSubmit={handleFilterSubmit} className="filters-container">
                        <div className="filter-group">
                            <label className="filter-label">بحث بالاسم أو الوصف</label>
                            <input 
                                type="text" 
                                name="searchTerm" 
                                value={filters.searchTerm} 
                                onChange={handleFilterChange} 
                                className="filter-input" 
                                placeholder="اكتب للبحث..."
                            />
                        </div>
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">تصفية العملاء</label>
                                <input 
                                    type="text" 
                                    value={clientFilter} 
                                    onChange={(e) => setClientFilter(e.target.value)} 
                                    className="filter-input" 
                                    placeholder="اكتب اسم العميل..."
                                />
                                <select name="clientId" value={filters.clientId} onChange={handleFilterChange} className="filter-select" style={{marginTop: '0.5rem'}}>
                                    <option value="">اختر عميل...</option>
                                    {filteredClients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">تصفية الأقسام</label>
                                 <input 
                                    type="text" 
                                    value={categoryFilter} 
                                    onChange={(e) => setCategoryFilter(e.target.value)} 
                                    className="filter-input" 
                                    placeholder="اكتب اسم القسم..."
                                />
                                <select name="categoryId" value={filters.categoryId} onChange={handleFilterChange} className="filter-select" style={{marginTop: '0.5rem'}}>
                                    <option value="">اختر قسم...</option>
                                    {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="filter-row">
                            <div className="filter-group">
                                <label className="filter-label">من تاريخ</label>
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-input" />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">إلى تاريخ</label>
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-input" />
                            </div>
                        </div>
                         <div className="filter-group" style={{alignItems: 'flex-start'}}>
                             <button type="submit" className="back-button">بحث وتصفية</button>
                        </div>
                    </form>

                    {loading && <p>جاري التحميل...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {!loading && !error && (
                        <div className="content-grid">
                            {items.map(item => (
                                <motion.div className="card-wrapper" key={item.id} onClick={() => setSelectedItem(item)}>
                                    <div className="content-card">
                                        <div className="card-media-container">
                                            {isVideoUrl(item.file_url) ? (
                                                <video className="card-video" src={item.file_url} loop muted playsInline />
                                            ) : (
                                                <div className="card-media-container" style={{ backgroundImage: `url(${item.file_url})` }}></div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h2 className="card-title">{item.title}</h2>
                                            <p className="card-description">{item.portfolio_category.name}</p>
                                            <div className="card-meta">
                                                <span>{item.client.name}</span>
                                                <span>{new Date(item.upload_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {selectedItem && (
                    <motion.div className="modal-backdrop" onClick={() => setSelectedItem(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-view" onClick={e => e.stopPropagation()} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <button className="modal-close-button" onClick={() => setSelectedItem(null)}>&times;</button>
                            <div className="modal-media">
                                {isVideoUrl(selectedItem.file_url) ? (
                                    <video className="modal-video" src={selectedItem.file_url} controls autoPlay />
                                ) : (
                                    <img src={selectedItem.file_url} alt={selectedItem.title} className="modal-image" />
                                )}
                            </div>
                            <div className="modal-details">
                                <h2 className="modal-title">{selectedItem.title}</h2>
                                <p className="modal-description">{selectedItem.description || "لا يوجد وصف."}</p>
                                <div className="modal-meta">
                                    <p><strong>العميل:</strong> {selectedItem.client.name}</p>
                                    <p><strong>القسم:</strong> {selectedItem.portfolio_category.name}</p>
                                    <p><strong>تاريخ الرفع:</strong> {new Date(selectedItem.upload_date).toLocaleString()}</p>
                                    <p><a href={selectedItem.file_url} target="_blank" rel="noopener noreferrer">فتح في نافذة جديدة</a></p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default PortfolioPage;


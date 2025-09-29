import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ParticleBackground from '../components/ParticleBackground';

const API_BASE_URL = import.meta.env.VITE_API_URL;
// --- STYLES FOR THE NEW PORTFOLIO PAGE ---
const PortfolioPageStyles = `
  .page-container { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 2rem; position: relative; overflow: hidden; }
  .page-header { width: 100%; max-width: 1600px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; z-index: 2; flex-wrap: wrap; gap: 1rem; }
  .page-title { font-size: 2.5rem; color: #ffffff; }
  .header-actions { display: flex; gap: 1rem; }
  .back-button { padding: 10px 25px; font-size: 1rem; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; }
  .back-button:hover { background: rgba(255, 255, 255, 0.2); }
  
  .page-content { flex-grow: 1; width: 100%; max-width: 1600px; background: rgba(15, 24, 37, 0.5); backdrop-filter: blur(5px); border-radius: 15px; border: 1px solid rgba(255, 255, 255, 0.1); padding: 1.5rem; z-index: 2; overflow-y: auto; display: flex; flex-direction: column; }
  
  .filters-container { display: flex; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 1rem; padding: 1.5rem; background: rgba(0,0,0,0.2); border-radius: 10px; }
  .filter-group { display: flex; flex-direction: column; gap: 0.5rem; flex: 1 1 250px; }
  .filter-label { font-size: 0.9rem; color: #b8c5d6; }
  .filter-input, .filter-select { padding: 10px 12px; font-size: 1rem; background-color: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #ffffff; width: 100%; }
  .filter-input:focus, .filter-select:focus { outline: none; border-color: rgba(255, 255, 255, 0.5); }
  
  .breadcrumbs-container { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1.5rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.2); border-radius: 8px; z-index: 2; }
  .breadcrumb-item { color: #b8c5d6; cursor: pointer; transition: color 0.3s ease; }
  .breadcrumb-item:hover { color: #ffffff; }
  .breadcrumb-item.active { color: #ffffff; font-weight: bold; }
  .breadcrumb-separator { color: #8892b0; }

  .content-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
  
  .folder-card { cursor: pointer; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: all 0.3s ease; }
  .folder-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
  .folder-icon { font-size: 3rem; color: #3b82f6; margin-bottom: 1rem; }
  .folder-name { font-size: 1.5rem; color: #ffffff; }
  .folder-count { font-size: 0.9rem; color: #b8c5d6; margin-top: 0.25rem; }

  .card-wrapper { position: relative; transition: transform 0.3s ease; border-radius: 14px; overflow: hidden; }
  .card-wrapper:hover { transform: translateY(-8px); }
  .content-card { border-radius: 12px; overflow: hidden; cursor: pointer; background: #0f1825; height: 100%; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.1); }
  .card-media-container { width: 100%; height: 180px; background-color: #0a0e1a; background-size: cover; background-position: center; }
  .card-video { width: 100%; height: 100%; object-fit: cover; }
  .card-body { padding: 1rem; flex-grow: 1; display: flex; flex-direction: column; }
  .card-title { font-size: 1.1rem; color: #ffffff; margin-bottom: 0.5rem; }
  .card-description { font-size: 0.85rem; color: #b8c5d6; margin-bottom: 0.75rem; flex-grow: 1; }
  .card-meta { font-size: 0.75rem; color: #8892b0; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.75rem; }

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
  .modal-close-button { position: absolute; top: 15px; right: 15px; width: 40px; height: 40px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: #ffffff; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; z-index: 1001; }
`;
function PortfolioPage({ onNavigate }) {
    const [allItems, setAllItems] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [path, setPath] = useState([]); // State for folder navigation: ['2025', '09']

    const getInitialFilterDates = () => {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const formatDate = (date) => date.toISOString().split('T')[0];
        return {
            startDate: formatDate(startOfYear),
            endDate: formatDate(today)
        };
    };

    const [filters, setFilters] = useState({ 
        q: '', 
        clientId: '', 
        ...getInitialFilterDates() 
    });
    const [clientSearchTerm, setClientSearchTerm] = useState('');

    // Fetch clients only once on component mount
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const clientsRes = await axios.get(`${API_BASE_URL}/api/clients`);
                setClients(clientsRes.data);
            } catch (err) {
                setError('فشل في جلب قائمة العملاء.');
            }
        };
        fetchClients();
    }, []);

    // Fetch portfolio items whenever filters change
    useEffect(() => {
        const fetchPortfolioItems = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.q) params.append('q', filters.q);
                if (filters.clientId) params.append('client_id', filters.clientId);
                if (filters.startDate) params.append('start_date', new Date(filters.startDate).toISOString());
                if (filters.endDate) params.append('end_date', new Date(filters.endDate).toISOString());

                const itemsRes = await axios.get(`${API_BASE_URL}/api/portfolio/items`, { params });
                setAllItems(itemsRes.data);
                setError('');
            } catch (err) {
                setError('فشل في جلب مواد المحفظة.');
            } finally {
                setLoading(false);
            }
        };
        
        const delayDebounceFn = setTimeout(() => {
            fetchPortfolioItems();
        }, 500); // Debounce to avoid rapid API calls while typing

        return () => clearTimeout(delayDebounceFn);
    }, [filters]);

    // This logic for grouping into folders remains the same but now works on server-filtered data
    const contentToDisplay = useMemo(() => {
        let currentItems = allItems;
        if (path.length > 0) { // Year
            currentItems = currentItems.filter(i => new Date(i.upload_date).getFullYear() == path[0]);
        }
        if (path.length > 1) { // Month
            currentItems = currentItems.filter(i => (new Date(i.upload_date).getMonth() + 1) == path[1]);
        }
        if (path.length > 2) { // Day
            currentItems = currentItems.filter(i => new Date(i.upload_date).getDate() == path[2]);
            return { type: 'items', data: currentItems };
        }

        // Grouping logic
        let groupingFn;
        if (path.length === 0) groupingFn = (i) => new Date(i.upload_date).getFullYear();
        else if (path.length === 1) groupingFn = (i) => String(new Date(i.upload_date).getMonth() + 1).padStart(2, '0');
        else if (path.length === 2) groupingFn = (i) => String(new Date(i.upload_date).getDate()).padStart(2, '0');

        const groups = currentItems.reduce((acc, item) => {
            const key = groupingFn(item);
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
        
        return { type: 'folders', data: groups };

    }, [allItems, path]);
    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredClientsForDropdown = useMemo(() => 
        clients.filter(c => c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())),
        [clients, clientSearchTerm]
    );
    const handleBreadcrumbClick = (index) => {
        setPath(prev => prev.slice(0, index));
    };
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
                    <div className="filters-container">
                        <div className="filter-group">
                            <label className="filter-label">ابحث في هذا القسم</label>
                            <input
                                type="text"
                                name="q"
                                value={filters.q}
                                onChange={handleFilterChange}
                                className="filter-input"
                                placeholder="اكتب عنوان أو وصف المادة..."
                            />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">تصفية حسب العميل</label>
                            <input 
                                type="text" 
                                value={clientSearchTerm} 
                                onChange={(e) => setClientSearchTerm(e.target.value)} 
                                className="filter-input" 
                                placeholder="اكتب اسم العميل للبحث..."
                            />
                            <select name="clientId" value={filters.clientId} onChange={handleFilterChange} className="filter-select" style={{marginTop: '0.5rem'}}>
                                <option value="">كل العملاء</option>
                                {filteredClientsForDropdown.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">من تاريخ</label>
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-input" />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">إلى تاريخ</label>
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-input" />
                        </div>
                    </div>
                    
                    <div className="breadcrumbs-container">
                        <span className="breadcrumb-item" onClick={() => handleBreadcrumbClick(0)}>الرئيسية</span>
                        {path.map((p, i) => (
                            <React.Fragment key={p}>
                                <span className="breadcrumb-separator">/</span>
                                <span className="breadcrumb-item" onClick={() => handleBreadcrumbClick(i + 1)}>{p}</span>
                            </React.Fragment>
                        ))}
                    </div>

                    {loading && <p style={{textAlign: 'center'}}>جاري التحميل...</p>}
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                    {!loading && !error && (
                        <div className="content-grid">
                            {contentToDisplay.type === 'folders' ?
                                (
                                Object.entries(contentToDisplay.data).map(([name, groupItems]) => (
                                    <motion.div className="folder-card" key={name} onClick={() => setPath(prev => [...prev, name])} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                        <div className="folder-icon">📁</div>
                                        <div className="folder-name">{name}</div>
                                        <div className="folder-count">{groupItems.length} {path.length < 2 ? 'مادة' : 'مواد'}</div>
                                    </motion.div>
                                ))
                                ) : (
                                contentToDisplay.data.map(item => (
                                    <motion.div className="card-wrapper" key={item.id} onClick={() => setSelectedItem(item)} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                        <div className="content-card">
                                            <div className="card-media-container">
                                                {isVideoUrl(item.file_url) ?
                                                    (
                                                    <video className="card-video" src={item.file_url} loop muted playsInline />
                                                    ) : (
                                                    <div className="card-media-container" style={{ backgroundImage: `url(${item.file_url})` }}></div>
                                                )}
                                            </div>
                                            <div className="card-body">
                                                <h2 className="card-title">{item.title}</h2>
                                                <p className="card-description">{item.category.display_name}</p>
                                                <div className="card-meta">
                                                    <span>{item.client.name}</span>
                                                    <span>{new Date(item.upload_date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
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
                                {isVideoUrl(selectedItem.file_url) ?
                                    (
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
                                    <p><strong>القسم:</strong> {selectedItem.category.display_name}</p>
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
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';
import ParticleBackground from '../components/ParticleBackground';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;
// --- START: PROFESSIONAL ADMIN DASHBOARD STYLES ---
const AdminDashboardStyles = `
  :root { --admin-primary: #3b82f6; --admin-primary-dark: #2563eb; --admin-danger: #ef4444; --admin-danger-dark: #dc2626; --admin-success: #22c55e; --admin-success-dark: #16a34a; --admin-bg-light: rgba(255, 255, 255, 0.05); --admin-bg-dark: rgba(0, 0, 0, 0.2); --admin-border-color: rgba(255, 255, 255, 0.1); }
  .page-container { width: 100vw; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 2rem; position: relative; overflow: hidden; }
  .page-header { width: 100%; max-width: 1600px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; position: relative; z-index: 2; }
  .page-title { font-size: 2.2rem; color: #ffffff; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
  .back-button { padding: 10px 25px; font-size: 1rem; background: var(--admin-bg-light); border: 1px solid var(--admin-border-color); color: #ffffff; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; }
  .back-button:hover { background: rgba(255, 255, 255, 0.1); box-shadow: 0 0 15px rgba(255, 255, 255, 0.1); }

  .page-content { flex-grow: 1; width: 100%; max-width: 1600px; background: rgba(15, 24, 37, 0.6); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 15px; border: 1px solid var(--admin-border-color); z-index: 2; overflow: hidden; display: flex; flex-direction: column; }
  
  .dashboard-layout { display: flex; height: 100%; }
  .tabs-nav { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.5rem; background: rgba(0,0,0,0.15); border-left: 1px solid var(--admin-border-color); }
  .tab-button { width: 100%; padding: 12px 20px; font-size: 1rem; text-align: right; border: none; background: transparent; color: #b8c5d6; border-radius: 8px; cursor: pointer; transition: all 0.2s ease-in-out; border-right: 3px solid transparent; }
  .tab-button.active { color: #ffffff; background: var(--admin-bg-light); border-right-color: var(--admin-primary); }
  .tab-button:hover:not(.active) { background: rgba(255, 255, 255, 0.03); color: #ffffff; }

  .tab-content { flex-grow: 1; padding: 2rem; overflow-y: auto; }
  .dashboard-section { margin-bottom: 2.5rem; }
  .section-title { font-size: 1.5rem; color: #ffffff; padding-bottom: 0.75rem; border-bottom: 1px solid var(--admin-border-color); margin-bottom: 1.5rem; }
  
  .form-row, .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
  .form-input-group { display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
  .form-label { font-size: 0.9rem; }
  .form-input, .form-select, .form-textarea { width: 100%; padding: 10px 12px; font-size: 1rem; background-color: var(--admin-bg-dark); border: 1px solid var(--admin-border-color); border-radius: 8px; color: #ffffff; transition: all 0.3s ease; }
  .form-input:focus, .form-select:focus, .form-textarea:focus { outline: none; border-color: var(--admin-primary); box-shadow: 0 0 10px rgba(59, 130, 246, 0.2); }
  .form-textarea { min-height: 100px; resize: vertical; }

  .form-button { padding: 12px 30px; font-size: 1rem; color: #ffffff; background: var(--admin-primary); border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
  .form-button:hover:not(:disabled) { background: var(--admin-primary-dark); }
  .form-button.danger { background: var(--admin-danger); }
  .form-button.danger:hover { background: var(--admin-danger-dark); }
  .form-button.secondary { background-color: rgba(255, 255, 255, 0.1); }
  .form-button.secondary:hover { background-color: rgba(255, 255, 255, 0.2); }
  .form-button:disabled { opacity: 0.5; cursor: not-allowed; }

  .data-table { width: 100%; border-collapse: collapse; color: #ffffff; }
  .data-table th, .data-table td { padding: 12px 15px; text-align: right; border-bottom: 1px solid var(--admin-border-color); }
  .data-table thead th { font-size: 1.1rem; }
  .data-table tbody tr:hover { background-color: var(--admin-bg-light); }
  .action-button { padding: 5px 15px; font-size: 0.9rem; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; margin-left: 0.5rem; border: 1px solid transparent; }
  .edit-button { background-color: rgba(50, 173, 230, 0.2); border-color: rgba(50, 173, 230, 0.5); color: #87ceeb; }
  .edit-button:hover { background-color: rgba(50, 173, 230, 0.5); color: #ffffff; }
  .delete-button { background-color: rgba(255, 59, 48, 0.2); border-color: rgba(255, 59, 48, 0.5); color: #ff8a8a; }
  .delete-button:hover { background-color: rgba(255, 59, 48, 0.5); color: #ffffff; }
  
  .checkbox-group { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; }
  .checkbox-group label { cursor: pointer; }

  .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal-content { background: #0f1825; padding: 2rem; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); width: 90%; max-width: 600px; }
  .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }


  @media (max-width: 992px) {
    .dashboard-layout { flex-direction: column; }
    .tabs-nav { flex-direction: row; border-left: none; border-bottom: 1px solid var(--admin-border-color); overflow-x: auto; }
    .tab-button { border-right: none; border-bottom: 3px solid transparent; }
    .tab-button.active { border-bottom-color: var(--admin-primary); }
  }
`;

const Section = ({ title, children }) => (
    <motion.div
        className="dashboard-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
        <h2 className="section-title">{title}</h2>
        {children}
    </motion.div>
);
function AdminDashboard({ onBack }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('portfolio');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [users, setUsers] = useState([]);
    const [clients, setClients] = useState([]);
    const [publicContent, setPublicContent] = useState([]);
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [publicSubcategories, setPublicSubcategories] = useState({});
    const [mainCategories, setMainCategories] = useState([]);
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [
                usersRes, clientsRes, publicContentRes, portfolioItemsRes,
                printedMaterialsRes, billboardsRes, eventsRes, exhibitionRes
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/users`),
                axios.get(`${API_BASE_URL}/api/clients`),
                axios.get(`${API_BASE_URL}/api/admin/content`),
                axios.get(`${API_BASE_URL}/api/portfolio/items`),
                axios.get(`${API_BASE_URL}/api/content/printedMaterials/subcategories`),
                axios.get(`${API_BASE_URL}/api/content/billboards/subcategories`),
                axios.get(`${API_BASE_URL}/api/content/events/subcategories`),
                axios.get(`${API_BASE_URL}/api/content/exhibition/subcategories`),
            ]);

            setUsers(usersRes.data);
            setClients(clientsRes.data);
            setPublicContent(publicContentRes.data);
            setPortfolioItems(portfolioItemsRes.data);
            setPublicSubcategories({
                printedMaterials: printedMaterialsRes.data,
                billboards: billboardsRes.data,
                events: eventsRes.data,
                exhibition: exhibitionRes.data,
            });
            // Assuming IDs are created in order by the backend
            setMainCategories([
                { id: 1, display_name: 'المواد المطبوعة' },
                { id: 2, display_name: 'تاجير لافتات طرقية عملاقة' },
                { id: 3, display_name: 'تنظيم المؤتمرات والمناسبات' },
                { id: 4, display_name: 'بيع الاجهزة والمعدات الطباعية' },
            ]);
            setError('');
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError('فشل في جلب بيانات لوحة التحكم.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);
    const TabButton = ({ tabId, children }) => (
        <button
            className={`tab-button ${activeTab === tabId ? 'active' : ''}`}
            onClick={() => setActiveTab(tabId)}
        >
            {children}
        </button>
    );
    return (
        <>
            <style>{AdminDashboardStyles}</style>
            <motion.div className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ParticleBackground />
                <div className="page-header">
                    <h1 className="page-title">لوحة التحكم</h1>
                    <button className="back-button" onClick={onBack}>→ القائمة الرئيسية</button>
                </div>
                <div className="page-content">
                    {loading ? (
                        <p style={{padding: '2rem', textAlign: 'center'}}>جاري تحميل البيانات...</p>
                    ) : error ? (
                        <p style={{ color: 'red', padding: '2rem', textAlign: 'center' }}>{error}</p>
                    ) : (
                        <div className="dashboard-layout">
                            <nav className="tabs-nav">
                                <TabButton tabId="portfolio">المحفظة الرقمية</TabButton>
                                <TabButton tabId="clients">العملاء</TabButton>
                                <TabButton tabId="content">المحتوى العام</TabButton>
                                <TabButton tabId="system">إدارة النظام</TabButton>
                            </nav>
                            <main className="tab-content">
                                {activeTab === 'portfolio' && <PortfolioManager clients={clients} mainCategories={mainCategories} items={portfolioItems} onUpdate={fetchAllData} />}
                                {activeTab === 'clients' && <ClientManager clients={clients} onUpdate={fetchAllData} />}
                                {activeTab === 'content' && <PublicContentManager categoriesMap={publicSubcategories} items={publicContent} onUpdate={fetchAllData} />}
                                {activeTab === 'system' && <SystemManager currentUser={user} users={users} onUpdate={fetchAllData} />}
                            </main>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}

const PortfolioManager = ({ clients, mainCategories, items, onUpdate }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [clientId, setClientId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [file, setFile] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const filteredClients = useMemo(() => {
        if (!clientSearchTerm) return clients;
        return clients.filter(c => 
            c.name.toLowerCase().includes(clientSearchTerm.toLowerCase())
        );
    }, [clients, clientSearchTerm]);
    useEffect(() => {
        if (clients.length > 0 && !clientId) setClientId(clients[0].id);
        if (mainCategories.length > 0 && !categoryId) setCategoryId(mainCategories[0].id);
    }, [clients, mainCategories]);
    const handleUpload = async (e) => {
        e.preventDefault();
        if ((!file && !linkUrl) || !clientId || !categoryId) {
            Swal.fire('خطأ', 'الرجاء اختيار عميل وقسم ورفع ملف أو إضافة رابط.', 'error');
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('client_id', clientId);
        formData.append('category_id', categoryId);
        if (file) formData.append('file', file);
        if (linkUrl) formData.append('link_url', linkUrl);

        try {
            await axios.post(`${API_BASE_URL}/api/portfolio/upload`, formData);
            Swal.fire('نجاح', 'تم رفع المادة بنجاح', 'success');
            onUpdate();
        } catch (err) {
            Swal.fire('خطأ', 'فشل رفع المادة', 'error');
        } finally {
            setIsUploading(false);
        }
    };
    const handleDelete = (id, name) => {
        Swal.fire({
            title: `هل أنت متأكد من حذف المادة "${name}"؟`,
            text: "لا يمكن التراجع عن هذا الإجراء!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، قم بالحذف'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE_URL}/api/portfolio/items/${id}`);
                    Swal.fire('نجاح', `تم حذف المادة بنجاح`, 'success');
                    onUpdate();
                } catch (err) {
                    Swal.fire('خطأ', `فشل حذف المادة`, 'error');
                }
            }
        });
    };

    return (
        <div>
            <Section title="إضافة مادة جديدة للمحفظة">
                <form onSubmit={handleUpload}>
                    <div className="form-grid">
                        <div className="form-input-group"><label>العنوان</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required /></div>
                        
                        <div className="form-input-group">
                            <label>العميل</label>
                            <input 
                                type="text" 
                                placeholder="ابحث عن عميل..." 
                                value={clientSearchTerm}
                                onChange={e => setClientSearchTerm(e.target.value)}
                                className="form-input"
                                style={{marginBottom: '0.5rem'}}
                            />
                            <select value={clientId} onChange={e => setClientId(e.target.value)} className="form-select">
                                {filteredClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="form-input-group">
                            <label>القسم</label>
                            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-select">
                                {mainCategories.map(c => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                            </select>
                        </div>

                        <div className="form-input-group"><label>الوصف</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="form-textarea"></textarea></div>
                        <div className="form-input-group"><label>الملف (اختياري)</label><input type="file" onChange={e => setFile(e.target.files[0])} className="form-input" /></div>
                        <div className="form-input-group"><label>أو رابط المادة (اختياري)</label><input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} className="form-input" placeholder="https://example.com" /></div>
                    </div>
                    <button type="submit" className="form-button" style={{marginTop: '1rem'}} disabled={isUploading}>{isUploading ? 'جارِ الرفع...' : 'رفع المادة'}</button>
                </form>
                 <table className="data-table" style={{marginTop: '2rem'}}>
                    <thead><tr><th>العنوان</th><th>العميل</th><th>القسم</th><th>إجراءات</th></tr></thead>
                    <tbody>
                        {items.map(i => <tr key={i.id}><td>{i.title}</td><td>{i.client.name}</td><td>{i.category.display_name}</td><td><button className="delete-button" onClick={() => handleDelete(i.id, i.title)}>حذف</button></td></tr>)}
                    </tbody>
                </table>
            </Section>
        </div>
    );
};

const ClientManager = ({ clients, onUpdate }) => {
    const [addFormState, setAddFormState] = useState({ name: '', contact_person: '', phone: '', email: '', address: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingClient, setEditingClient] = useState(null); // State for the client being edited

    const filteredClients = useMemo(() => {
        if (!searchTerm) return clients;
        return clients.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.contact_person && c.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [clients, searchTerm]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateClient = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/clients`, addFormState);
            Swal.fire('نجاح', 'تم تعريف العميل بنجاح', 'success');
            setAddFormState({ name: '', contact_person: '', phone: '', email: '', address: '' });
            onUpdate();
        } catch (err) {
            Swal.fire('خطأ', 'فشل تعريف العميل', 'error');
        }
    };
    
    const handleEditClick = (client) => {
        setEditingClient({ ...client }); // Set the client to be edited, creating a copy
    };
    const handleUpdateClient = async (e) => {
        e.preventDefault();
        if (!editingClient) return;
        try {
            await axios.put(`${API_BASE_URL}/api/clients/${editingClient.id}`, editingClient);
            Swal.fire('نجاح', 'تم تحديث بيانات العميل بنجاح', 'success');
            setEditingClient(null); // Close the modal
            onUpdate();
        } catch (err) {
            Swal.fire('خطأ', 'فشل تحديث بيانات العميل', 'error');
        }
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditingClient(prev => ({ ...prev, [name]: value }));
    };


    const handleDeleteClient = (clientId, clientName) => {
        Swal.fire({
            title: `هل أنت متأكد من حذف العميل "${clientName}"؟`,
            text: "سيتم حذف جميع مواد المحفظة المرتبطة به!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، قم بالحذف'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE_URL}/api/clients/${clientId}`);
                    Swal.fire('نجاح', `تم حذف العميل بنجاح`, 'success');
                    onUpdate();
                } catch (err) {
                    Swal.fire('خطأ', `فشل حذف العميل`, 'error');
                }
            }
        });
    };

    return (
        <div>
            <Section title="إضافة عميل جديد">
                <form onSubmit={handleCreateClient}>
                    <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="form-input-group"><label>اسم العميل</label><input type="text" name="name" value={addFormState.name} onChange={handleInputChange} className="form-input" required /></div>
                        <div className="form-input-group"><label>الشخص المسؤول</label><input type="text" name="contact_person" value={addFormState.contact_person} onChange={handleInputChange} className="form-input" /></div>
                        <div className="form-input-group"><label>الهاتف</label><input type="text" name="phone" value={addFormState.phone} onChange={handleInputChange} className="form-input" /></div>
                        <div className="form-input-group"><label>البريد الإلكتروني</label><input type="email" name="email" value={addFormState.email} onChange={handleInputChange} className="form-input" /></div>
                    </div>
                    <div className="form-input-group" style={{marginTop: '1.5rem'}}>
                        <label>العنوان</label>
                        <textarea name="address" value={addFormState.address} onChange={handleInputChange} className="form-textarea"></textarea>
                    </div>
                    <button type="submit" className="form-button" style={{marginTop: '1rem'}}>حفظ العميل</button>
                </form>
            </Section>
            <Section title="قائمة العملاء">
                <div className="form-input-group" style={{ maxWidth: '400px', marginBottom: '1.5rem' }}>
                    <label>ابحث عن عميل</label>
                    <input
                        type="text"
                        placeholder="اكتب اسم العميل أو المسؤول..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="form-input"
                    />
                </div>
                <table className="data-table">
                    <thead><tr><th>اسم العميل</th><th>المسؤول</th><th>الهاتف</th><th>الإجراءات</th></tr></thead>
                    <tbody>
                        {filteredClients.map(c => (
                            <tr key={c.id}>
                                <td>{c.name}</td>
                                <td>{c.contact_person || '-'}</td>
                                <td>{c.phone || '-'}</td>
                                <td>
                                    <button className="action-button edit-button" onClick={() => handleEditClick(c)}>تعديل</button>
                                    <button className="action-button delete-button" onClick={() => handleDeleteClient(c.id, c.name)}>حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            <AnimatePresence>
                {editingClient && (
                    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <Section title={`تعديل بيانات: ${editingClient.name}`}>
                                <form onSubmit={handleUpdateClient}>
                                     <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                        <div className="form-input-group"><label>اسم العميل</label><input type="text" name="name" value={editingClient.name} onChange={handleEditFormChange} className="form-input" required /></div>
                                        <div className="form-input-group"><label>الشخص المسؤول</label><input type="text" name="contact_person" value={editingClient.contact_person || ''} onChange={handleEditFormChange} className="form-input" /></div>
                                        <div className="form-input-group"><label>الهاتف</label><input type="text" name="phone" value={editingClient.phone || ''} onChange={handleEditFormChange} className="form-input" /></div>
                                        <div className="form-input-group"><label>البريد الإلكتروني</label><input type="email" name="email" value={editingClient.email || ''} onChange={handleEditFormChange} className="form-input" /></div>
                                    </div>
                                    <div className="form-input-group" style={{marginTop: '1.5rem'}}>
                                        <label>العنوان</label>
                                        <textarea name="address" value={editingClient.address || ''} onChange={handleEditFormChange} className="form-textarea"></textarea>
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" className="form-button secondary" onClick={() => setEditingClient(null)}>إلغاء</button>
                                        <button type="submit" className="form-button">حفظ التعديلات</button>
                                    </div>
                                </form>
                            </Section>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const PublicContentManager = ({ categoriesMap, items, onUpdate }) => {
    const [activeMainCategory, setActiveMainCategory] = useState('printedMaterials');
    const [newSubcategoryName, setNewSubcategoryName] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subcategoryId, setSubcategoryId] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const currentSubcategories = categoriesMap[activeMainCategory] || [];
    useEffect(() => {
        if (currentSubcategories.length > 0) {
            setSubcategoryId(currentSubcategories[0].id);
        } else {
            setSubcategoryId('');
        }
    }, [activeMainCategory, categoriesMap]);
    const handleCreateSubcategory = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/admin/content/${activeMainCategory}/subcategories`, { name: newSubcategoryName });
            Swal.fire('نجاح', 'تم إنشاء القسم الفرعي', 'success');
            setNewSubcategoryName('');
            onUpdate();
        } catch (err) {
            Swal.fire('خطأ', 'فشل إنشاء القسم الفرعي', 'error');
        }
    };
    
    const handleDeleteSubcategory = (subcatId, subcatName) => {
         Swal.fire({
            title: `هل أنت متأكد من حذف قسم "${subcatName}"؟`,
            text: "سيتم حذف كل المحتوى بداخله!", icon: 'warning',
            showCancelButton: true, confirmButtonText: 'نعم، قم بالحذف'
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE_URL}/api/admin/content/${activeMainCategory}/subcategories/${subcatId}`);
                    Swal.fire('نجاح', 'تم حذف القسم', 'success');
                    onUpdate();
                } catch (err) {
                    Swal.fire('خطأ', 'فشل حذف القسم', 'error');
                }
            }
        });
    };

    const handleAddContent = async (e) => {
        e.preventDefault();
        if (!title || !subcategoryId) {
            Swal.fire('خطأ', 'الرجاء إدخال عنوان واختيار قسم فرعي.', 'error');
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (file) formData.append('file', file);
        
        try {
            await axios.post(`${API_BASE_URL}/api/admin/content/${activeMainCategory}/${subcategoryId}`, formData);
            Swal.fire('نجاح', 'تمت إضافة المحتوى', 'success');
            setTitle(''); setDescription(''); setFile(null);
            onUpdate();
        } catch (err) {
             Swal.fire('خطأ', 'فشلت إضافة المحتوى', 'error');
        } finally {
            setIsUploading(false);
        }
    };
    const handleDeleteContent = (item) => {
         Swal.fire({
            title: `هل أنت متأكد من حذف "${item.title}"؟`,
            icon: 'warning', showCancelButton: true, confirmButtonText: 'نعم، قم بالحذف'
        }).then(async (result) => {
            if(result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE_URL}/api/admin/content/${item.category}/${item.subcategory_id}/${item.id}`);
                    Swal.fire('نجاح', 'تم حذف المحتوى', 'success');
                    onUpdate();
                } catch (err) {
                    Swal.fire('خطأ', 'فشل حذف المحتوى', 'error');
                }
            }
        });
    };

    return ( 
        <div>
            <Section title="إدارة الأقسام الفرعية العامة">
                <div className="form-input-group" style={{maxWidth: '400px', marginBottom: '1.5rem'}}>
                    <label>اختر القسم الرئيسي</label>
                    <select value={activeMainCategory} onChange={e => setActiveMainCategory(e.target.value)} className="form-select">
                        <option value="printedMaterials">المواد المطبوعة</option>
                        <option value="billboards">تاجير لافتات</option>
                        <option value="events">تنظيم المؤتمرات</option>
                        <option value="exhibition">معرض البيع</option>
                    </select>
                </div>
                 <form onSubmit={handleCreateSubcategory} style={{display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem'}}>
                    <div className="form-input-group"><label>اسم القسم الفرعي الجديد</label><input type="text" value={newSubcategoryName} onChange={e => setNewSubcategoryName(e.target.value)} className="form-input" required /></div>
                    <button type="submit" className="form-button">إضافة قسم</button>
                </form>
                 <table className="data-table"><thead><tr><th>اسم القسم الفرعي</th><th>إجراءات</th></tr></thead><tbody>{currentSubcategories.map(s => <tr key={s.id}><td>{s.name}</td><td><button className="delete-button" onClick={() => handleDeleteSubcategory(s.id, s.name)}>حذف</button></td></tr>)}</tbody></table>
            </Section>
            <Section title="إضافة محتوى عام جديد">
                <form onSubmit={handleAddContent}>
                    <div className="form-grid">
                        <div className="form-input-group"><label>العنوان</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" required /></div>
                        <div className="form-input-group"><label>القسم الفرعي (من القسم الرئيسي المحدد أعلاه)</label><select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} className="form-select">{currentSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div className="form-input-group"><label>الوصف</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="form-textarea"></textarea></div>
                        <div className="form-input-group"><label>الملف (اختياري)</label><input type="file" onChange={e => setFile(e.target.files[0])} className="form-input" /></div>
                    </div>
                    <button type="submit" className="form-button" style={{marginTop: '1rem'}} disabled={isUploading}>{isUploading ? 'جارِ الرفع...' : 'إضافة المحتوى'}</button>
                </form>
                 <table className="data-table" style={{marginTop: '2rem'}}><thead><tr><th>العنوان</th><th>القسم الرئيسي</th><th>القسم الفرعي</th><th>إجراءات</th></tr></thead><tbody>{items.map(i => <tr key={i.id}><td>{i.title}</td><td>{i.category}</td><td>{i.subcategory_name}</td><td><button className="delete-button" onClick={() => handleDeleteContent(i)}>حذف</button></td></tr>)}</tbody></table>
            </Section>
        </div> 
    );
};

const SystemManager = ({ currentUser, users, onUpdate }) => {
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [canAccessPortfolio, setCanAccessPortfolio] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/api/users`, { username: newUsername, password: newPassword, can_access_portfolio: canAccessPortfolio });
            Swal.fire('نجاح', 'تم إنشاء المستخدم بنجاح', 'success');
            setNewUsername('');
            setNewPassword('');
            onUpdate();
        } catch (err) {
            Swal.fire('خطأ', err.response?.data?.detail || 'فشل إنشاء المستخدم', 'error');
        }
    };
    
    const handleDeleteUser = (username) => {
        if (username === 'admin') {
            Swal.fire('خطأ', 'لا يمكن حذف المستخدم الرئيسي', 'error');
            return;
        }
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "لا يمكن التراجع عن هذا الإجراء!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، قم بالحذف'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE_URL}/api/users/${username}`);
                    Swal.fire('نجاح', 'تم حذف المستخدم', 'success');
                    onUpdate();
                } catch (err) {
                    Swal.fire('خطأ', 'فشل حذف المستخدم', 'error');
                }
            }
        });
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newAdminPassword !== confirmAdminPassword) {
            Swal.fire('خطأ', 'كلمات المرور الجديدة غير متطابقة', 'error');
            return;
        }
        try {
            await axios.put(`${API_BASE_URL}/api/users/${currentUser.username}/change-password`, {
                current_password: currentPassword,
                new_password: newAdminPassword
            });
            Swal.fire('نجاح', 'تم تغيير كلمة المرور بنجاح', 'success');
            setCurrentPassword(''); setNewAdminPassword(''); setConfirmAdminPassword('');
        } catch (err) {
             Swal.fire('خطأ', err.response?.data?.detail || 'فشل تغيير كلمة المرور', 'error');
        }
    };

    return (
        <div>
            <Section title="إدارة المستخدمين">
                <form onSubmit={handleCreateUser}>
                    <div className="form-grid">
                        <div className="form-input-group">
                            <label htmlFor="new-username">اسم المستخدم</label>
                            <input id="new-username" type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="form-input" required />
                        </div>
                        <div className="form-input-group">
                             <label htmlFor="new-password">كلمة المرور</label>
                            <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-input" required />
                        </div>
                        <div className="form-input-group" style={{justifyContent: 'center'}}>
                            <div className="checkbox-group">
                                <input id="can-access" type="checkbox" checked={canAccessPortfolio} onChange={e => setCanAccessPortfolio(e.target.checked)} />
                                <label htmlFor="can-access">يمكنه الوصول للمحفظة</label>
                            </div>
                        </div>
                    </div>
                     <button type="submit" className="form-button" style={{marginTop: '1rem'}}>إنشاء مستخدم</button>
                </form>
                <table className="data-table" style={{marginTop: '2rem'}}>
                    <thead><tr><th>اسم المستخدم</th><th>يصل للمحفظة</th><th>إجراءات</th></tr></thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.username}>
                                <td>{u.username}</td>
                                <td>{u.can_access_portfolio ? 'نعم' : 'لا'}</td>
                                <td>
                                    <button className="action-button delete-button" onClick={() => handleDeleteUser(u.username)} disabled={u.username === 'admin'}>حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>
            <Section title="تغيير كلمة المرور (الحساب الحالي)">
                 <form onSubmit={handleChangePassword}>
                    <div className="form-grid">
                        <div className="form-input-group">
                            <label htmlFor="current-pass">كلمة المرور الحالية</label>
                            <input id="current-pass" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="form-input" required />
                        </div>
                        <div className="form-input-group">
                            <label htmlFor="new-admin-pass">كلمة المرور الجديدة</label>
                            <input id="new-admin-pass" type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} className="form-input" required />
                        </div>
                         <div className="form-input-group">
                            <label htmlFor="confirm-admin-pass">تأكيد الجديدة</label>
                            <input id="confirm-admin-pass" type="password" value={confirmAdminPassword} onChange={e => setConfirmAdminPassword(e.target.value)} className="form-input" required />
                         </div>
                    </div>
                    <button type="submit" className="form-button" style={{marginTop: '1rem'}}>حفظ التغييرات</button>
                 </form>
            </Section>
        </div>
    );
};

export default AdminDashboard;
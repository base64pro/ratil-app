import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Swal from 'sweetalert2';
import ParticleBackground from '../components/ParticleBackground';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get current user

// Styles for the Admin Dashboard
const AdminDashboardStyles = `
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
  }

  .page-title {
    font-size: 2.5rem;
    color: #ffffff;
    text-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
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
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .dashboard-section {
    width: 100%;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.5rem;
    color: #ffffff;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-grow: 1;
  }
  
  .admin-search-bar {
    max-width: 300px;
  }

  .create-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-bottom: 2rem;
  }
  
  .form-row {
    display: flex;
    gap: 1.5rem;
  }

  .form-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex-grow: 1;
    position: relative;
  }

  .form-label {
    font-size: 0.9rem;
  }

  .form-input, .form-select, .form-textarea, .form-file-input {
    padding: 10px 12px;
    font-size: 1rem;
    font-family: 'Ithra Bold', sans-serif !important;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #ffffff;
    transition: all 0.3s ease;
  }

  input[type="password"] {
    padding-left: 40px;
  }
  
  .form-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: left 0.75rem center;
    background-size: 16px 12px;
    padding-left: 2.5rem; 
  }
  
  .form-file-input::-webkit-file-upload-button {
    background: var(--navy-light);
    border: none;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 10px;
  }

  .form-textarea {
    min-height: 80px;
    resize: vertical;
  }
  
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  }

  .form-button {
    padding: 12px 30px;
    font-size: 1rem;
    font-family: 'Ithra Bold', sans-serif !important;
    color: #ffffff;
    background: var(--navy-light);
    border: 1px solid var(--navy-glow);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    align-self: flex-start;
  }

  .form-button:hover:not(:disabled) {
    background: var(--navy-blue);
  }

  .form-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .password-toggle-icon {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(25%);
    cursor: pointer;
    color: #8892b0;
    transition: color 0.3s ease;
  }

  .password-toggle-icon:hover {
    color: #ffffff;
  }

  .progress-bar-container {
    width: 100%;
    height: 10px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .progress-bar {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, var(--navy-light), var(--navy-blue));
    border-radius: 5px;
    transition: width 0.3s ease-in-out;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    color: #ffffff;
  }

  .data-table th, .data-table td {
    padding: 12px 15px;
    text-align: right;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .data-table thead th {
    font-size: 1.1rem;
    font-weight: 700;
  }
  
  .data-table tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .action-button {
    padding: 5px 15px;
    font-size: 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 0.5rem;
    border: 1px solid transparent;
  }

  .edit-button { background-color: rgba(50, 173, 230, 0.2); border-color: rgba(50, 173, 230, 0.5); color: #87ceeb; }
  .edit-button:hover { background-color: rgba(50, 173, 230, 0.5); color: #ffffff; }
  .delete-button { background-color: rgba(255, 59, 48, 0.2); border-color: rgba(255, 59, 48, 0.5); color: #ff8a8a; }
  .delete-button:hover { background-color: rgba(255, 59, 48, 0.5); color: #ffffff; }
  .delete-button:disabled { opacity: 0.4; cursor: not-allowed; }

  .loading-text, .error-text {
    text-align: center;
    padding: 1rem;
    font-size: 1rem;
  }
  
  .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal-content { background: #0f1825; padding: 2rem; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); width: 90%; max-width: 600px; }
  .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem; }

  .file-input-container {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .camera-button {
    padding: 10px 15px;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  .camera-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .camera-modal-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    max-width: 90vw;
  }

  .camera-feed, .camera-preview {
    width: 100%;
    max-width: 500px;
    height: auto;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  @media (max-width: 768px) {
    .page-container { padding: 1rem; }
    .page-header { flex-direction: column; gap: 1rem; text-align: center; }
    .page-title { font-size: 1.8rem; }
    .data-table th, .data-table td { padding: 10px 8px; font-size: 0.9rem; }
    .form-row, .create-form, .file-input-container { flex-direction: column; align-items: stretch; }
  }
`;

function AdminDashboard({ onBack }) {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // User Management State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewUserPass, setShowNewUserPass] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);
  const [showConfirmAdminPass, setShowConfirmAdminPass] = useState(false);

  // Content Management State
  const [allContent, setAllContent] = useState([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [contentError, setContentError] = useState('');
  const [contentCategory, setContentCategory] = useState('printedMaterials');
  const [subcategories, setSubcategories] = useState([]);
  const [contentSubcategory, setContentSubcategory] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [contentDesc, setContentDesc] = useState('');
  const [contentFile, setContentFile] = useState(null);
  
  // Search State
  const [contentSearchTerm, setContentSearchTerm] = useState('');
  
  // Edit Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);

  // Upload Progress State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  const fetchAllData = async () => {
    setLoadingUsers(true);
    setLoadingContent(true);
    try {
      const [userResponse, contentResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/users`),
        axios.get(`${API_BASE_URL}/api/admin/content`)
      ]);
      setUsers(userResponse.data);
      setAllContent(contentResponse.data);
      setUserError('');
      setContentError('');
    } catch (err) {
      console.error("Failed to fetch data:", err);
      const errorMsg = 'فشل في جلب البيانات.';
      setUserError(errorMsg);
      setContentError(errorMsg);
    } finally {
      setLoadingUsers(false);
      setLoadingContent(false);
    }
  };
  
  const fetchSubcategories = async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/content/${category}/subcategories`);
      setSubcategories(response.data);
      if (response.data.length > 0) {
        if (!contentSubcategory || !response.data.some(sub => sub.id.toString() === contentSubcategory)) {
          setContentSubcategory(response.data[0].id.toString());
        }
      } else {
        setContentSubcategory('');
      }
    } catch (err) {
      console.error("Failed to fetch subcategories:", err);
      setSubcategories([]);
      setContentSubcategory('');
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchSubcategories(contentCategory);
  }, []);

  useEffect(() => {
    fetchSubcategories(contentCategory);
  }, [contentCategory]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    if (!newUsername || !newPassword) {
      Swal.fire({ title: 'حقول فارغة', text: 'الرجاء ملء حقول المستخدم', icon: 'warning' });
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users`, { username: newUsername, password: newPassword });
      Swal.fire({ title: 'نجاح!', text: `تم إنشاء المستخدم "${response.data.username}" بنجاح!`, icon: 'success' });
      setNewUsername(''); setNewPassword('');
      fetchAllData();
    } catch (err) {
      const detail = err.response?.data?.detail || 'حدث خطأ أثناء إنشاء المستخدم.';
      Swal.fire({ title: 'خطأ!', text: detail, icon: 'error' });
    }
  };

  const handleDeleteUser = (username) => {
    Swal.fire({
      title: `هل أنت متأكد؟`,
      text: `سيتم حذف المستخدم "${username}" بشكل نهائي!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، قم بالحذف!',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${API_BASE_URL}/api/users/${username}`);
          Swal.fire('تم الحذف!', response.data.message, 'success');
          fetchAllData();
        } catch (err) {
          const detail = err.response?.data?.detail || 'حدث خطأ أثناء حذف المستخدم.';
          Swal.fire('خطأ!', detail, 'error');
        }
      }
    });
  };
  
  const handleAddContent = async (event) => {
    event.preventDefault();
    if (!contentTitle || !contentDesc || !contentSubcategory) {
        Swal.fire({ title: 'بيانات ناقصة', text: 'الرجاء ملء حقلي العنوان والوصف واختيار قسم فرعي', icon: 'warning' });
        return;
    }
    const formData = new FormData();
    formData.append('title', contentTitle);
    formData.append('description', contentDesc);
    if (contentFile) { formData.append('file', contentFile); }
    const axiosConfig = { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)) };
    setIsUploading(true);
    try {
        const response = await axios.post(`${API_BASE_URL}/api/content/${contentCategory}/${contentSubcategory}`, formData, axiosConfig);
        Swal.fire({ title: 'نجاح!', text: `تمت إضافة "${response.data.title}" بنجاح.`, icon: 'success' });
        setContentTitle(''); setContentDesc(''); setContentFile(null); event.target.reset();
        fetchAllData();
    } catch (err) {
        const detail = err.response?.data?.detail || 'حدث خطأ أثناء إضافة المحتوى.';
        Swal.fire({ title: 'خطأ!', text: detail, icon: 'error' });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteContent = (category, subcategory_id, itemId, itemTitle) => {
    Swal.fire({
      title: 'هل أنت متأكد؟',
      text: `سيتم حذف العنصر "${itemTitle}" بشكل نهائي!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، قم بالحذف!',
      cancelButtonText: 'إلغاء'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${API_BASE_URL}/api/content/${category}/${subcategory_id}/${itemId}`);
          Swal.fire('تم الحذف!', response.data.message, 'success');
          fetchAllData();
        } catch (err) {
          const detail = err.response?.data?.detail || 'حدث خطأ أثناء حذف المحتوى.';
          Swal.fire('خطأ!', detail, 'error');
        }
      }
    });
  };
  
  const handleUpdateContent = async (event) => {
    event.preventDefault();
    if (!editingItem) return;

    const formData = new FormData();
    formData.append('title', editingItem.title);
    formData.append('description', editingItem.description);
    if (editingFile) {
      formData.append('file', editingFile);
    }
    
    const axiosConfig = {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
    };

    setIsUploading(true);
    try {
        const { category, subcategory_id, id } = editingItem;
        const response = await axios.put(`${API_BASE_URL}/api/content/${category}/${subcategory_id}/${id}`, formData, axiosConfig);
        Swal.fire({ title: 'نجاح!', text: `تم تحديث "${response.data.title}" بنجاح.`, icon: 'success' });
        setEditingItem(null); setEditingFile(null);
        fetchAllData();
    } catch (err) {
        const detail = err.response?.data?.detail || 'حدث خطأ أثناء تحديث المحتوى.';
        Swal.fire({ title: 'خطأ!', text: detail, icon: 'error' });
    } finally {
        setIsUploading(false);
        setUploadProgress(0);
    }
  };
  
  const handleCreateSubcategory = async (event) => {
    event.preventDefault();
    if (!newSubcategoryName.trim()) {
      Swal.fire({ title: 'حقل فارغ', text: 'اسم القسم الفرعي لا يمكن أن يكون فارغًا', icon: 'warning' });
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/api/content/${contentCategory}/subcategories`, { name: newSubcategoryName });
      Swal.fire({ title: 'نجاح!', text: `تم إنشاء القسم الفرعي "${response.data.name}" بنجاح.`, icon: 'success' });
      setNewSubcategoryName('');
      fetchSubcategories(contentCategory);
    } catch (err) {
      const detail = err.response?.data?.detail || 'حدث خطأ أثناء إنشاء القسم الفرعي.';
      Swal.fire({ title: 'خطأ!', text: detail, icon: 'error' });
    }
  };
  
  const openSubcategoryEditModal = (subcategory) => {
    setEditingSubcategory({ ...subcategory });
  };
  
  const handleUpdateSubcategory = async (event) => {
    event.preventDefault();
    if (!editingSubcategory || !editingSubcategory.name.trim()) {
        Swal.fire({ title: 'حقل فارغ', text: 'اسم القسم الفرعي لا يمكن أن يكون فارغًا.', icon: 'warning'});
        return;
    }
    try {
        const { id, name } = editingSubcategory;
        const response = await axios.put(`${API_BASE_URL}/api/content/${contentCategory}/subcategories/${id}`, { name });
        Swal.fire('نجاح!', `تم تحديث القسم الفرعي إلى "${response.data.name}".`, 'success');
        setEditingSubcategory(null);
        fetchSubcategories(contentCategory);
    } catch (err) {
        const detail = err.response?.data?.detail || 'حدث خطأ أثناء تحديث القسم.';
        Swal.fire('خطأ!', detail, 'error');
    }
  };
  
  const handleDeleteSubcategory = (subcategory) => {
    Swal.fire({
      title: `هل أنت متأكد؟`,
      text: `سيتم حذف القسم الفرعي "${subcategory.name}" وكل المحتوى الذي بداخله بشكل نهائي!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، قم بالحذف!',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#d33',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`${API_BASE_URL}/api/content/${contentCategory}/subcategories/${subcategory.id}`);
          Swal.fire('تم الحذف!', response.data.message, 'success');
          fetchSubcategories(contentCategory);
          fetchAllData();
        } catch (err) {
          const detail = err.response?.data?.detail || 'حدث خطأ أثناء الحذف.';
          Swal.fire('خطأ!', detail, 'error');
        }
      }
    });
  };

  const openEditModal = (item) => {
    setEditingItem({ ...item });
  };

  const filteredContent = useMemo(() => {
    if (!contentSearchTerm) {
      return allContent;
    }
    const lowercasedFilter = contentSearchTerm.toLowerCase();
    return allContent.filter(item =>
      item.title.toLowerCase().includes(lowercasedFilter) ||
      item.subcategory_name.toLowerCase().includes(lowercasedFilter)
    );
  }, [allContent, contentSearchTerm]);

  const openCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      Swal.fire('خطأ', 'متصفحك لا يدعم الوصول إلى الكاميرا.', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      Swal.fire('خطأ في الوصول', 'تم رفض الوصول إلى الكاميرا. يرجى التحقق من أذونات المتصفح.', 'error');
    }
  };

  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setCameraStream(null);
    setCapturedImage(null);
  };

  const takePicture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      setCapturedImage(canvas.toDataURL('image/png'));
    }
  };

  const confirmCapture = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
        setContentFile(capturedFile);
        closeCamera();
      }, 'image/png');
    }
  };
  
  const retakePicture = () => {
    setCapturedImage(null);
  };
  
  // --- START: New Handler for Changing Password ---
  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (!currentPassword || !newAdminPassword || !confirmAdminPassword) {
      Swal.fire({ title: 'حقول فارغة', text: 'الرجاء ملء جميع حقول كلمة المرور.', icon: 'warning' });
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      Swal.fire({ title: 'خطأ', text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين.', icon: 'error' });
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${user.username}/change-password`, {
        current_password: currentPassword,
        new_password: newAdminPassword
      });
      Swal.fire({ title: 'نجاح!', text: response.data.message, icon: 'success' });
      // Clear fields on success
      setCurrentPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } catch (err) {
      const detail = err.response?.data?.detail || 'حدث خطأ أثناء تغيير كلمة المرور.';
      Swal.fire({ title: 'خطأ!', text: detail, icon: 'error' });
    }
  };
  // --- END: New Handler for Changing Password ---
  
  // Helper for password toggle icon
  const PasswordToggleIcon = ({ isVisible, onToggle }) => (
    <span className="password-toggle-icon" onClick={onToggle}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {isVisible ? (
          <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></>
        ) : (
          <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></>
        )}
      </svg>
    </span>
  );

  return (
    <>
      <style>{AdminDashboardStyles}</style>
      <motion.div className="page-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
        <ParticleBackground />
        <div className="page-header"><h1 className="page-title">لوحة تحكم الأدمن</h1><button className="back-button" onClick={onBack}>→ رجوع</button></div>
        <div className="page-content">
          
          <div className="dashboard-section">
            <h2 className="section-title">إدارة الأقسام الفرعية</h2>
            <form onSubmit={handleCreateSubcategory} className="create-form">
              <div className="form-row">
                <div className="form-input-group">
                  <label className="form-label" htmlFor="new-subcategory-name">اسم القسم الفرعي الجديد</label>
                  <input id="new-subcategory-name" type="text" className="form-input" value={newSubcategoryName} onChange={(e) => setNewSubcategoryName(e.target.value)} placeholder="مثال: طباعة داخلية" />
                </div>
                <div className="form-input-group" style={{ justifyContent: 'flex-end' }}>
                   <button type="submit" className="form-button">إنشاء قسم فرعي</button>
                </div>
              </div>
            </form>
            <table className="data-table">
              <thead><tr><th>اسم القسم الفرعي</th><th>إجراءات</th></tr></thead>
              <tbody>
                {subcategories.map(sub => (
                  <tr key={sub.id}>
                    <td>{sub.name}</td>
                    <td>
                      <button className="action-button edit-button" onClick={() => openSubcategoryEditModal(sub)}>تعديل</button>
                      <button className="action-button delete-button" onClick={() => handleDeleteSubcategory(sub)}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">إضافة محتوى جديد</h2>
            <form onSubmit={handleAddContent} className="create-form">
              <div className="form-row">
                <div className="form-input-group">
                  <label className="form-label" htmlFor="content-category">اختر القسم الرئيسي</label>
                  <select id="content-category" className="form-select" value={contentCategory} onChange={e => setContentCategory(e.target.value)}>
                      <option value="printedMaterials">المواد المطبوعة</option>
                      <option value="billboards">تاجير لافتات طرقية عملاقة</option>
                      <option value="events">تنظيم المؤتمرات والمناسبات</option>
                      <option value="exhibition">معرض بيع الاجهزة والمعدات الطباعية</option>
                  </select>
                </div>
                <div className="form-input-group">
                  <label className="form-label" htmlFor="content-subcategory">اختر القسم الفرعي</label>
                  <select id="content-subcategory" className="form-select" value={contentSubcategory} onChange={e => setContentSubcategory(e.target.value)} disabled={subcategories.length === 0}>
                    {subcategories.length > 0 ? (
                      subcategories.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)
                    ) : (
                      <option>الرجاء إنشاء قسم فرعي أولاً</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="form-input-group">
                <label className="form-label" htmlFor="content-title">العنوان</label>
                <input id="content-title" type="text" className="form-input" value={contentTitle} onChange={e => setContentTitle(e.target.value)} placeholder="عنوان العنصر" />
              </div>
              <div className="form-input-group">
                <label className="form-label" htmlFor="content-desc">الوصف</label>
                <textarea id="content-desc" className="form-textarea" value={contentDesc} onChange={e => setContentDesc(e.target.value)} placeholder="وصف موجز للعنصر"></textarea>
              </div>
              <div className="form-input-group">
                <label className="form-label" htmlFor="content-file">ملف الصورة أو الفيديو (اختياري)</label>
                <div className="file-input-container">
                    <input id="content-file" type="file" className="form-file-input" onChange={e => setContentFile(e.target.files[0])} />
                    <button type="button" className="camera-button" onClick={openCamera}>التقاط صورة</button>
                </div>
                {contentFile && <p style={{fontSize: '0.8rem', marginTop: '5px'}}>الملف المختار: {contentFile.name}</p>}
                {isUploading && (
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
              </div>
              <button type="submit" className="form-button" disabled={isUploading}>
                {isUploading ? `جارِ الرفع... ${uploadProgress}%` : 'إضافة المحتوى'}
              </button>
            </form>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">إدارة المحتوى الحالي</h2>
              <div className="admin-search-bar">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="...ابحث عن عنصر" 
                  value={contentSearchTerm}
                  onChange={(e) => setContentSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {loadingContent ? <p className="loading-text">جاري تحميل المحتوى...</p> : contentError ? <p className="error-text">{contentError}</p> : (
              <table className="data-table">
                <thead><tr><th>العنوان</th><th>القسم الفرعي</th><th>إجراءات</th></tr></thead>
                <tbody>
                  {filteredContent.map(item => (
                    <tr key={`${item.category}-${item.id}`}>
                      <td>{item.title}</td>
                      <td>{item.subcategory_name}</td>
                      <td>
                        <button className="action-button edit-button" onClick={() => openEditModal(item)}>تعديل</button>
                        <button 
                          className="action-button delete-button" 
                          onClick={() => handleDeleteContent(item.category, item.subcategory_id, item.id, item.title)}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">إدارة المستخدمين</h2>
            <form onSubmit={handleCreateUser} className="create-form">
                <div className="form-row">
                    <div className="form-input-group">
                        <label className="form-label" htmlFor="new-username">اسم المستخدم الجديد</label>
                        <input id="new-username" type="text" className="form-input" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="اسم المستخدم" />
                    </div>
                    <div className="form-input-group">
                        <label className="form-label" htmlFor="new-password">كلمة المرور</label>
                        <input id="new-password" type={showNewUserPass ? 'text' : 'password'} className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="كلمة المرور" />
                        <PasswordToggleIcon isVisible={showNewUserPass} onToggle={() => setShowNewUserPass(!showNewUserPass)} />
                    </div>
                </div>
                <button type="submit" className="form-button">إنشاء مستخدم</button>
            </form>
            
            {loadingUsers ? <p className="loading-text">جاري تحميل المستخدمين...</p> : userError ? <p className="error-text">{userError}</p> : (
              <table className="data-table">
                <thead><tr><th>اسم المستخدم</th><th>الدور</th><th>إجراء</th></tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.username}>
                      <td>{user.username}</td><td>{user.role}</td>
                      <td><button className="delete-button" onClick={() => handleDeleteUser(user.username)} disabled={user.username === 'admin'}>حذف</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">تغيير كلمة المرور</h2>
            <form onSubmit={handleChangePassword} className="create-form">
              <div className="form-input-group">
                <label className="form-label" htmlFor="current-password">كلمة المرور الحالية</label>
                <input id="current-password" type={showCurrentPass ? 'text' : 'password'} className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="أدخل كلمة المرور الحالية" />
                <PasswordToggleIcon isVisible={showCurrentPass} onToggle={() => setShowCurrentPass(!showCurrentPass)} />
              </div>
              <div className="form-row">
                <div className="form-input-group">
                  <label className="form-label" htmlFor="new-admin-password">كلمة المرور الجديدة</label>
                  <input id="new-admin-password" type={showNewAdminPass ? 'text' : 'password'} className="form-input" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} placeholder="أدخل كلمة المرور الجديدة" />
                  <PasswordToggleIcon isVisible={showNewAdminPass} onToggle={() => setShowNewAdminPass(!showNewAdminPass)} />
                </div>
                <div className="form-input-group">
                  <label className="form-label" htmlFor="confirm-admin-password">تأكيد كلمة المرور الجديدة</label>
                  <input id="confirm-admin-password" type={showConfirmAdminPass ? 'text' : 'password'} className="form-input" value={confirmAdminPassword} onChange={(e) => setConfirmAdminPassword(e.target.value)} placeholder="أعد إدخال كلمة المرور الجديدة" />
                  <PasswordToggleIcon isVisible={showConfirmAdminPass} onToggle={() => setShowConfirmAdminPass(!showConfirmAdminPass)} />
                </div>
              </div>
              <button type="submit" className="form-button">حفظ كلمة المرور</button>
            </form>
          </div>

        </div>

        <AnimatePresence>
            {isCameraOpen && (
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCamera}>
                <motion.div className="modal-content camera-modal-content" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} onClick={e => e.stopPropagation()}>
                <h2 className="section-title">التقاط صورة</h2>
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured Preview" className="camera-preview" />
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="camera-feed" />
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                <div className="modal-actions">
                    <button type="button" className="action-button" onClick={closeCamera}>إغلاق</button>
                    {capturedImage ? (
                    <>
                        <button type="button" className="action-button edit-button" onClick={retakePicture}>إعادة الالتقاط</button>
                        <button type="button" className="form-button" onClick={confirmCapture}>تأكيد الصورة</button>
                    </>
                    ) : (
                    <button type="button" className="form-button" onClick={takePicture}>التقاط</button>
                    )}
                </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
          {editingSubcategory && (
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal-content" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                <h2 className="section-title">تعديل القسم الفرعي</h2>
                <form onSubmit={handleUpdateSubcategory} className="create-form">
                  <div className="form-input-group">
                    <label className="form-label">اسم القسم الفرعي</label>
                    <input type="text" className="form-input" value={editingSubcategory.name} onChange={e => setEditingSubcategory({...editingSubcategory, name: e.target.value})} />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="action-button" onClick={() => setEditingSubcategory(null)}>إلغاء</button>
                    <button type="submit" className="form-button">حفظ التغييرات</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editingItem && (
            <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="modal-content" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}>
                <h2 className="section-title">تعديل العنصر</h2>
                <form onSubmit={handleUpdateContent} className="create-form">
                  <div className="form-input-group">
                    <label className="form-label">العنوان</label>
                    <input type="text" className="form-input" value={editingItem.title} onChange={e => setEditingItem({...editingItem, title: e.target.value})} />
                  </div>
                  <div className="form-input-group">
                    <label className="form-label">الوصف</label>
                    <textarea className="form-textarea" value={editingItem.description} onChange={e => setEditingItem({...editingItem, description: e.target.value})}></textarea>
                  </div>
                  <div className="form-input-group">
                    <label className="form-label">رفع ملف جديد (اختياري)</label>
                    <input type="file" className="form-file-input" onChange={e => setEditingFile(e.target.files[0])} />
                    {isUploading && (
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    )}
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="action-button" onClick={() => setEditingItem(null)}>إلغاء</button>
                    <button type="submit" className="form-button" disabled={isUploading}>
                      {isUploading ? `جارِ الرفع... ${uploadProgress}%` : 'حفظ التغييرات'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export default AdminDashboard;
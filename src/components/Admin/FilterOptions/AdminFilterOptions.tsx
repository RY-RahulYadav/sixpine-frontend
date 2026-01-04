import React, { useState, useEffect } from 'react';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';
import '../../../styles/admin-theme.css';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category: number;
  description?: string;
  is_active: boolean;
}

interface Color {
  id: number;
  name: string;
  hex_code: string;
  is_active: boolean;
}

interface Material {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
}

interface Discount {
  id: number;
  percentage: number;
  label: string;
  is_active: boolean;
  created_at: string;
}

type FilterSection = 'categories' | 'colors' | 'materials' | 'discounts';

const AdminFilterOptions: React.FC = () => {
  const api = useAdminAPI();
  const { showConfirmation } = useNotification();
  const [activeSection, setActiveSection] = useState<FilterSection>('categories');
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState<boolean>(false);
  const [showColorModal, setShowColorModal] = useState<boolean>(false);
  const [showMaterialModal, setShowMaterialModal] = useState<boolean>(false);
  const [showDiscountModal, setShowDiscountModal] = useState<boolean>(false);
  
  // Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, Subcategory[]>>({});
  
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  
  // Specification Templates
  const [specTemplatesMap, setSpecTemplatesMap] = useState<Record<number, any[]>>({});
  const [showSpecTemplateModal, setShowSpecTemplateModal] = useState<boolean>(false);
  const [editingSpecTemplate, setEditingSpecTemplate] = useState<any | null>(null);
  const [specTemplateForm, setSpecTemplateForm] = useState({ 
    category: '', 
    section: 'specifications', 
    field_name: '', 
    sort_order: 0, 
    is_active: true 
  });
  const [expandedSpecSection, setExpandedSpecSection] = useState<{categoryId: number, section: string} | null>(null);
  const [bulkAddInput, setBulkAddInput] = useState<string>('');
  const [useBulkAdd, setUseBulkAdd] = useState<boolean>(false);
  
  // Form data
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '', is_active: true });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', slug: '', category: '', description: '', is_active: true });
  const [colorForm, setColorForm] = useState({ name: '', hex_code: '#000000', is_active: true });
  const [materialForm, setMaterialForm] = useState({ name: '', description: '', is_active: true });
  const [discountForm, setDiscountForm] = useState({ 
    percentage: 0, 
    label: '', 
    is_active: true 
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (expandedCategory) {
      fetchSubcategories(expandedCategory);
      fetchSpecTemplates(expandedCategory);
    }
  }, [expandedCategory]);
  
  const fetchSpecTemplates = async (categoryId: number) => {
    try {
      // First try to get all results with a large page_size
      let response = await adminAPI.getCategorySpecificationTemplates({ 
        category: categoryId,
        page_size: 1000  // Request large page size to get all results
      });
      
      let allTemplates: any[] = [];
      let templates: any[] = [];
      
      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          templates = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          templates = response.data.results;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          templates = response.data.data;
        }
      }
      
      allTemplates = [...templates];
      
      // If there's pagination and we didn't get all results, fetch remaining pages
      if (response.data && response.data.next) {
        let nextUrl = response.data.next;
        let page = 2;
        
        while (nextUrl) {
          const nextResponse = await adminAPI.getCategorySpecificationTemplates({ 
            category: categoryId,
            page: page
          });
          
          let nextTemplates: any[] = [];
          if (nextResponse.data) {
            if (Array.isArray(nextResponse.data)) {
              nextTemplates = nextResponse.data;
              nextUrl = null;
            } else if (nextResponse.data.results && Array.isArray(nextResponse.data.results)) {
              nextTemplates = nextResponse.data.results;
              nextUrl = nextResponse.data.next || null;
            } else if (nextResponse.data.data && Array.isArray(nextResponse.data.data)) {
              nextTemplates = nextResponse.data.data;
              nextUrl = null;
            }
          }
          
          allTemplates = [...allTemplates, ...nextTemplates];
          
          if (nextUrl) {
            page++;
          } else {
            break;
          }
        }
      }
      
      // Ensure templates is an array
      if (!Array.isArray(allTemplates)) {
        allTemplates = [];
      }
      
      // Update state with all templates
      setSpecTemplatesMap(prev => ({ 
        ...prev, 
        [categoryId]: allTemplates 
      }));
    } catch (err) {
      console.error('Error fetching specification templates:', err);
      // On error, set empty array to ensure UI updates
      setSpecTemplatesMap(prev => ({ 
        ...prev, 
        [categoryId]: [] 
      }));
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
        await Promise.all([
          fetchCategories(),
          fetchColors(),
          fetchMaterials(),
          fetchDiscounts()
        ]);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      showToast('Failed to load filter options', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.getCategories();
      const cats = response.data.results || response.data || [];
      setCategories(cats);
      // Fetch subcategories for all categories
      for (const cat of cats) {
        fetchSubcategories(cat.id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    try {
      const response = await api.getSubcategories({ category: categoryId });
      const subcats = response.data.results || response.data || [];
      setSubcategoriesMap(prev => ({
        ...prev,
        [categoryId]: subcats
      }));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const fetchColors = async () => {
    try {
      let allColors: any[] = [];
      let hasNext = true;
      let page = 1;
      
      // Fetch all pages until no more pages
      while (hasNext) {
        const response = await api.getColors({ page });
        const data = response.data;
        
        if (data.results && Array.isArray(data.results)) {
          allColors = [...allColors, ...data.results];
        } else if (Array.isArray(data)) {
          allColors = [...allColors, ...data];
          hasNext = false; // Non-paginated response
          break;
        }
        
        // Check if there's a next page
        hasNext = !!data.next;
        if (hasNext) {
          page++;
        }
      }
      
      setColors(allColors);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setColors([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await api.getMaterials();
      const mats = response.data.results || response.data || [];
      setMaterials(mats);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await adminAPI.getDiscounts();
      console.log('Discounts API Response:', response.data);
      // Handle both paginated and non-paginated responses
      let discs = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          discs = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          discs = response.data.results;
        } else if (response.data.count !== undefined) {
          // Paginated response
          discs = response.data.results || [];
        }
      }
      console.log('Parsed discounts:', discs);
      setDiscounts(discs);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      setDiscounts([]);
    }
  };

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory.id, categoryForm);
        showToast('Category updated successfully', 'success');
      } else {
        await adminAPI.createCategory(categoryForm);
        showToast('Category created successfully', 'success');
      }
      resetCategoryForm();
        await fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      is_active: category.is_active
    });
    setShowCategoryModal(true);
    setExpandedCategory(category.id);
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', slug: '', description: '', is_active: true });
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This will also delete all subcategories.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }
    try {
      await adminAPI.deleteCategory(id);
      showToast('Category deleted successfully', 'success');
        await fetchCategories();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  // Subcategory handlers
  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subcategoryForm.category) {
      showToast('Please select a category', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingSubcategory) {
        await adminAPI.updateSubcategory(editingSubcategory.id, subcategoryForm);
        showToast('Subcategory updated successfully', 'success');
      } else {
        await adminAPI.createSubcategory(subcategoryForm);
        showToast('Subcategory created successfully', 'success');
      }
      resetSubcategoryForm();
      await fetchSubcategories(parseInt(subcategoryForm.category));
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save subcategory', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      slug: subcategory.slug,
      category: subcategory.category.toString(),
      description: subcategory.description || '',
      is_active: subcategory.is_active
    });
    setShowSubcategoryModal(true);
  };

  const resetSubcategoryForm = () => {
    setEditingSubcategory(null);
    setSubcategoryForm({ name: '', slug: '', category: '', description: '', is_active: true });
    setShowSubcategoryModal(false);
  };

  const handleDeleteSubcategory = async (id: number, categoryId: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Subcategory',
      message: 'Are you sure you want to delete this subcategory?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }
    try {
      await adminAPI.deleteSubcategory(id);
      showToast('Subcategory deleted successfully', 'success');
      await fetchSubcategories(categoryId);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete subcategory', 'error');
    }
  };

  // Specification Template handlers
  const handleSpecTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle bulk add mode
    if (useBulkAdd && bulkAddInput.trim()) {
      const categoryId = parseInt(specTemplateForm.category);
      await handleBulkAddSpecTemplates(categoryId, specTemplateForm.section);
      return;
    }
    
    // Handle single item mode
    if (!specTemplateForm.category || !specTemplateForm.field_name) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setSaving(true);
    // Save category ID before resetting form
    const categoryId = parseInt(specTemplateForm.category);
    try {
      if (editingSpecTemplate) {
        await adminAPI.updateCategorySpecificationTemplate(editingSpecTemplate.id, specTemplateForm);
        showToast('Specification template updated successfully', 'success');
      } else {
        await adminAPI.createCategorySpecificationTemplate(specTemplateForm);
        showToast('Specification template created successfully', 'success');
      }
      resetSpecTemplateForm();
      // Fetch templates after reset, using saved categoryId
      await fetchSpecTemplates(categoryId);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save specification template', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSpecTemplate = (template: any) => {
    setEditingSpecTemplate(template);
    setSpecTemplateForm({
      category: template.category.toString(),
      section: template.section,
      field_name: template.field_name,
      sort_order: template.sort_order || 0,
      is_active: template.is_active !== false
    });
    setShowSpecTemplateModal(true);
  };

  const resetSpecTemplateForm = () => {
    setEditingSpecTemplate(null);
    setSpecTemplateForm({ category: '', section: 'specifications', field_name: '', sort_order: 0, is_active: true });
    setShowSpecTemplateModal(false);
    setUseBulkAdd(false);
    setBulkAddInput('');
  };

  const handleDeleteSpecTemplate = async (id: number, categoryId: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Specification Template',
      message: 'Are you sure you want to delete this specification template?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }
    try {
      await adminAPI.deleteCategorySpecificationTemplate(id);
      showToast('Specification template deleted successfully', 'success');
      await fetchSpecTemplates(categoryId);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete specification template', 'error');
    }
  };

  const handleBulkAddSpecTemplates = async (categoryId: number, section: string) => {
    if (!bulkAddInput.trim()) {
      showToast('Please enter at least one field name', 'error');
      return;
    }

    // Parse comma-separated values
    const fieldNames = bulkAddInput
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (fieldNames.length === 0) {
      showToast('Please enter at least one valid field name', 'error');
      return;
    }

    setSaving(true);
    try {
      // Get existing templates for this section to determine next sort_order
      const existingTemplates = getTemplatesBySection(categoryId, section);
      const maxSortOrder = existingTemplates.length > 0 
        ? Math.max(...existingTemplates.map(t => t.sort_order || 0))
        : -1;

      // Create templates in sequence (left to right order)
      let createdCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < fieldNames.length; i++) {
        try {
          await adminAPI.createCategorySpecificationTemplate({
            category: categoryId.toString(),
            section: section,
            field_name: fieldNames[i],
            sort_order: maxSortOrder + 1 + i, // Sequential order from left to right
            is_active: true
          });
          createdCount++;
        } catch (error: any) {
          console.error(`Failed to create template for "${fieldNames[i]}":`, error);
          failedCount++;
        }
      }

      // Refresh templates
      await fetchSpecTemplates(categoryId);

      // Show success/error message
      if (createdCount > 0 && failedCount === 0) {
        showToast(`Successfully created ${createdCount} field${createdCount !== 1 ? 's' : ''}`, 'success');
      } else if (createdCount > 0 && failedCount > 0) {
        showToast(`Created ${createdCount} field${createdCount !== 1 ? 's' : ''}, ${failedCount} failed`, 'error');
      } else {
        showToast('Failed to create fields', 'error');
      }

      // Reset and close modal
      resetSpecTemplateForm();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create specification templates', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getSectionDisplayName = (section: string) => {
    const names: Record<string, string> = {
      'specifications': 'Specifications',
      'measurement_specs': 'Measurement Specifications',
      'style_specs': 'Style Specifications',
      'features': 'Features',
      'user_guide': 'User Guide',
      'item_details': 'Item Details'
    };
    return names[section] || section;
  };

  const getTemplatesBySection = (categoryId: number, section: string) => {
    const templates = specTemplatesMap[categoryId] || [];
    return templates.filter(t => t.section === section);
  };

  // Color handlers
  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingColor) {
        await adminAPI.updateColor(editingColor.id, colorForm);
        showToast('Color updated successfully', 'success');
      } else {
        await adminAPI.createColor(colorForm);
        showToast('Color created successfully', 'success');
      }
      resetColorForm();
        await fetchColors();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save color', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setColorForm({
      name: color.name,
      hex_code: color.hex_code,
      is_active: color.is_active
    });
    setShowColorModal(true);
  };

  const resetColorForm = () => {
    setEditingColor(null);
    setColorForm({ name: '', hex_code: '#000000', is_active: true });
    setShowColorModal(false);
  };

  const handleDeleteColor = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Color',
      message: 'Are you sure you want to delete this color?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }
    try {
      await adminAPI.deleteColor(id);
      showToast('Color deleted successfully', 'success');
        await fetchColors();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete color', 'error');
    }
  };

  // Material handlers
  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingMaterial) {
        await adminAPI.updateMaterial(editingMaterial.id, materialForm);
        showToast('Material updated successfully', 'success');
      } else {
        await adminAPI.createMaterial(materialForm);
        showToast('Material created successfully', 'success');
      }
      resetMaterialForm();
        await fetchMaterials();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save material', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialForm({
      name: material.name,
      description: material.description || '',
      is_active: material.is_active
    });
    setShowMaterialModal(true);
  };

  const resetMaterialForm = () => {
    setEditingMaterial(null);
    setMaterialForm({ name: '', description: '', is_active: true });
    setShowMaterialModal(false);
  };

  const handleDeleteMaterial = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }
    try {
      await adminAPI.deleteMaterial(id);
      showToast('Material deleted successfully', 'success');
        await fetchMaterials();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete material', 'error');
    }
  };

  // Discount handlers
  const handleDiscountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingDiscount) {
        await adminAPI.updateDiscount(editingDiscount.id, discountForm);
        showToast('Discount filter option updated successfully', 'success');
      } else {
        await adminAPI.createDiscount(discountForm);
        showToast('Discount filter option created successfully', 'success');
      }
      resetDiscountForm();
        await fetchDiscounts();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to save discount filter option', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    setDiscountForm({
      percentage: discount.percentage,
      label: discount.label || '',
      is_active: discount.is_active
    });
    setShowDiscountModal(true);
  };

  const resetDiscountForm = () => {
    setEditingDiscount(null);
    setDiscountForm({ percentage: 0, label: '', is_active: true });
    setShowDiscountModal(false);
  };

  const handleDeleteDiscount = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Delete Discount',
      message: 'Are you sure you want to delete this discount?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }
    try {
      await adminAPI.deleteDiscount(id);
      showToast('Discount deleted successfully', 'success');
        await fetchDiscounts();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete discount', 'error');
    }
  };

  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading filter options...</p>
      </div>
    );
  }

  return (
    <div className="admin-filter-options">
      <div className="admin-header-actions">
          <h2>Filter Options Management</h2>
      </div>

      {/* Section Tabs */}
      <div className="admin-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          <span className="material-symbols-outlined">category</span>
          Categories & Subcategories
        </button>
        <button
          className={`${activeSection === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveSection('colors')}
        >
          <span className="material-symbols-outlined">palette</span>
          Colors
        </button>
        <button
          className={`${activeSection === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveSection('materials')}
        >
          <span className="material-symbols-outlined">texture</span>
          Materials
        </button>
        <button
          className={`${activeSection === 'discounts' ? 'active' : ''}`}
          onClick={() => setActiveSection('discounts')}
        >
          <span className="material-symbols-outlined">percent</span>
          Discount Filters
        </button>
      </div>

      {/* Categories Section */}
      {activeSection === 'categories' && (
        <div>
          <div className="admin-content-main">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Categories</h3>
                  <button
                    className="admin-btn primary"
                    onClick={() => {
                      resetCategoryForm();
                      setShowCategoryModal(true);
                    }}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Category
                  </button>
              </div>

              <div className="categories-list">
                {categories.map((category) => (
                  <div key={category.id} className="category-item">
                    <div className="category-header" onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <h4 style={{ margin: 0 }}>{category.name}</h4>
                        {!category.is_active && <span className="status-badge inactive">Inactive</span>}
                        {category.is_active && <span className="status-badge active">Active</span>}
                      </div>
                      <div className="category-actions">
                            <button
                              className="admin-btn icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category);
                              }}
                              title="Edit Category"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              className="admin-btn icon"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const token = localStorage.getItem('authToken');
                                  const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';
                                  const downloadUrl = `${baseURL}/admin/categories/${category.id}/download_excel_template/`;
                                  
                                  const response = await fetch(downloadUrl, {
                                    headers: {
                                      'Authorization': `Token ${token}`
                                    }
                                  });
                                  
                                  if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({}));
                                    throw new Error(errorData.error || 'Failed to download template');
                                  }
                                  
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `product_template_${category.name.replace(/\s+/g, '_')}_${category.id}.xlsx`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                  
                                  showToast('Base template downloaded successfully', 'success');
                                } catch (error: any) {
                                  console.error('Download error:', error);
                                  showToast(error.message || 'Failed to download template', 'error');
                                }
                              }}
                              title="Download Base Template"
                            >
                              <span className="material-symbols-outlined">download</span>
                            </button>
                            <button
                              className="admin-btn icon danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.id);
                              }}
                              title="Delete Category"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                        <span className="material-symbols-outlined" style={{ marginLeft: '8px', fontSize: '24px' }}>
                          {expandedCategory === category.id ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                    </div>

                    {expandedCategory === category.id && (
                      <div className="subcategories-section">
                        <div className="subcategories-header">
                          <h5>Subcategories</h5>
                            <button
                              className="admin-btn primary"
                              onClick={() => {
                                resetSubcategoryForm();
                                setSubcategoryForm(prev => ({ ...prev, category: category.id.toString() }));
                                setShowSubcategoryModal(true);
                              }}
                              style={{ fontSize: '13px', padding: '8px 16px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                              Add Subcategory
                            </button>
                        </div>

                        <div className="subcategories-list">
                          {(subcategoriesMap[category.id] || []).map((subcat) => (
                            <div key={subcat.id} className="subcategory-item">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                <strong>{subcat.name}</strong>
                                {!subcat.is_active && <span className="status-badge inactive">Inactive</span>}
                                {subcat.is_active && <span className="status-badge active">Active</span>}
                              </div>
                              <div className="category-actions">
                                    <button
                                      className="admin-btn icon"
                                      onClick={() => handleEditSubcategory(subcat)}
                                      title="Edit Subcategory"
                                    >
                                      <span className="material-symbols-outlined">edit</span>
                                    </button>
                                    <button
                                      className="admin-btn icon danger"
                                      onClick={() => handleDeleteSubcategory(subcat.id, category.id)}
                                      title="Delete Subcategory"
                                    >
                                      <span className="material-symbols-outlined">delete</span>
                                    </button>
                              </div>
                            </div>
                          ))}
                          {(subcategoriesMap[category.id] || []).length === 0 && (
                            <p className="empty-state">No subcategories yet</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Specification Templates Section */}
                    {expandedCategory === category.id && (
                      <div className="subcategories-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <div className="subcategories-header">
                          <h5>Specification Templates (Filter/Configuration)</h5>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              className="admin-btn primary"
                              onClick={() => {
                                resetSpecTemplateForm();
                                setSpecTemplateForm(prev => ({ ...prev, category: category.id.toString() }));
                                setShowSpecTemplateModal(true);
                              }}
                              style={{ fontSize: '13px', padding: '8px 16px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                              Add Template
                            </button>
                          </div>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                          {['specifications', 'measurement_specs', 'style_specs', 'features', 'user_guide', 'item_details'].map((section) => {
                            const sectionTemplates = getTemplatesBySection(category.id, section);
                            const isExpanded = expandedSpecSection?.categoryId === category.id && expandedSpecSection?.section === section;
                            
                            return (
                              <div key={section} style={{ marginBottom: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px' }}>
                                <div 
                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                  onClick={() => {
                                    const newExpanded = isExpanded ? null : { categoryId: category.id, section };
                                    setExpandedSpecSection(newExpanded);
                                    // Reset bulk add mode when collapsing
                                    if (!newExpanded) {
                                      setBulkAddMode(null);
                                      setBulkAddInput('');
                                    }
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#666' }}>
                                      {isExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                    <strong>{getSectionDisplayName(section)}</strong>
                                    <span style={{ fontSize: '12px', color: '#888', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>
                                      {sectionTemplates.length} field{sectionTemplates.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                  <button
                                    className="admin-btn primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      resetSpecTemplateForm();
                                      setSpecTemplateForm(prev => ({ ...prev, category: category.id.toString(), section }));
                                      setUseBulkAdd(false);
                                      setBulkAddInput('');
                                      setShowSpecTemplateModal(true);
                                    }}
                                    style={{ fontSize: '12px', padding: '6px 12px' }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                                    Add Field
                                  </button>
                                </div>
                                
                                {isExpanded && (
                                  <div style={{ marginTop: '10px', paddingLeft: '30px' }}>
                                    {sectionTemplates.length > 0 ? (
                                      <div>
                                        {sectionTemplates.map((template) => (
                                          <div key={template.id} style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            padding: '8px',
                                            marginBottom: '5px',
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: '4px'
                                          }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                              <span style={{ fontWeight: '500' }}>{template.field_name}</span>
                                              {template.sort_order !== undefined && (
                                                <span style={{ fontSize: '11px', color: '#888' }}>(Order: {template.sort_order})</span>
                                              )}
                                              {!template.is_active && (
                                                <span className="status-badge inactive" style={{ fontSize: '10px' }}>Inactive</span>
                                              )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                              <button
                                                className="admin-btn icon"
                                                onClick={() => handleEditSpecTemplate(template)}
                                                title="Edit"
                                                style={{ padding: '4px 8px' }}
                                              >
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                                              </button>
                                              <button
                                                className="admin-btn icon danger"
                                                onClick={() => handleDeleteSpecTemplate(template.id, category.id)}
                                                title="Delete"
                                                style={{ padding: '4px 8px' }}
                                              >
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                              </button>
                                            </div>
                  </div>
                ))}
              </div>
                                    ) : (
                                      <p className="empty-state" style={{ fontSize: '13px', color: '#888', marginTop: '10px' }}>
                                        No fields defined for this section
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Modal */}
          {showCategoryModal && (
            <div className="admin-modal-overlay" onClick={resetCategoryForm}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h2>{editingCategory ? 'Edit Category' : 'New Category'}</h2>
                  <button className="admin-modal-close" onClick={resetCategoryForm}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleCategorySubmit} className="admin-modal-body">
                  <div className="form-group">
                    <label>Name*</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug*</label>
                    <input
                      type="text"
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={categoryForm.is_active}
                        onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="admin-btn secondary" onClick={resetCategoryForm}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn primary" disabled={saving}>
                      {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Subcategory Modal */}
          {showSubcategoryModal && (
            <div className="admin-modal-overlay" onClick={resetSubcategoryForm}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h2>{editingSubcategory ? 'Edit Subcategory' : 'New Subcategory'}</h2>
                  <button className="admin-modal-close" onClick={resetSubcategoryForm}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleSubcategorySubmit} className="admin-modal-body">
                  <div className="form-group">
                    <label>Category*</label>
                    <select
                      value={subcategoryForm.category}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, category: e.target.value })}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Name*</label>
                    <input
                      type="text"
                      value={subcategoryForm.name}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug*</label>
                    <input
                      type="text"
                      value={subcategoryForm.slug}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={subcategoryForm.description}
                      onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={subcategoryForm.is_active}
                        onChange={(e) => setSubcategoryForm({ ...subcategoryForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="admin-btn secondary" onClick={resetSubcategoryForm}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn primary" disabled={saving}>
                      {saving ? 'Saving...' : editingSubcategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Specification Template Modal */}
          {showSpecTemplateModal && (
            <div className="admin-modal-overlay" onClick={resetSpecTemplateForm}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h2>{editingSpecTemplate ? 'Edit Specification Template' : 'New Specification Template'}</h2>
                  <button className="admin-modal-close" onClick={resetSpecTemplateForm}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleSpecTemplateSubmit} className="admin-modal-body">
                  <div className="form-group">
                    <label>Category*</label>
                    <select
                      value={specTemplateForm.category}
                      onChange={(e) => setSpecTemplateForm({ ...specTemplateForm, category: e.target.value })}
                      required
                      disabled={!!specTemplateForm.category || !!editingSpecTemplate}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Section*</label>
                    <select
                      value={specTemplateForm.section}
                      onChange={(e) => setSpecTemplateForm({ ...specTemplateForm, section: e.target.value })}
                      required
                      disabled={!!editingSpecTemplate}
                    >
                      <option value="specifications">Specifications</option>
                      <option value="measurement_specs">Measurement Specifications</option>
                      <option value="style_specs">Style Specifications</option>
                      <option value="features">Features</option>
                      <option value="user_guide">User Guide</option>
                      <option value="item_details">Item Details</option>
                    </select>
                  </div>
                  
                  {/* Toggle between single and bulk add (only for new items) */}
                  {!editingSpecTemplate && (
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={useBulkAdd}
                          onChange={(e) => {
                            setUseBulkAdd(e.target.checked);
                            if (e.target.checked) {
                              setBulkAddInput('');
                            } else {
                              setSpecTemplateForm({ ...specTemplateForm, field_name: '' });
                            }
                          }}
                        />
                        Add multiple fields (comma-separated)
                      </label>
                    </div>
                  )}
                  
                  {useBulkAdd && !editingSpecTemplate ? (
                    <>
                      <div className="form-group">
                        <label>Field Names (Comma-separated)*</label>
                        <textarea
                          value={bulkAddInput}
                          onChange={(e) => setBulkAddInput(e.target.value)}
                          placeholder="e.g., Brand, Weight, Bed Type, Material"
                          rows={4}
                          required
                          style={{ 
                            width: '100%', 
                            padding: '10px', 
                            fontSize: '14px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          Enter multiple field names separated by commas. They will be created in order (left to right).
                        </small>
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={specTemplateForm.is_active}
                            onChange={(e) => setSpecTemplateForm({ ...specTemplateForm, is_active: e.target.checked })}
                          />
                          Active (applies to all fields)
                        </label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Field Name*</label>
                        <input
                          type="text"
                          value={specTemplateForm.field_name}
                          onChange={(e) => setSpecTemplateForm({ ...specTemplateForm, field_name: e.target.value })}
                          placeholder="e.g., Brand, Weight, Bed Type"
                          required={!useBulkAdd}
                        />
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                          This will be the default field name that appears when creating products in this category
                        </small>
                      </div>
                      <div className="form-group">
                        <label>Sort Order</label>
                        <input
                          type="number"
                          value={specTemplateForm.sort_order}
                          onChange={(e) => setSpecTemplateForm({ ...specTemplateForm, sort_order: parseInt(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={specTemplateForm.is_active}
                            onChange={(e) => setSpecTemplateForm({ ...specTemplateForm, is_active: e.target.checked })}
                          />
                          Active
                        </label>
                      </div>
                    </>
                  )}
                  <div className="form-actions">
                    <button type="button" className="admin-btn secondary" onClick={resetSpecTemplateForm}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn primary" disabled={saving}>
                      {saving ? 'Saving...' : editingSpecTemplate ? 'Update' : useBulkAdd ? 'Create All' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Colors Section */}
      {activeSection === 'colors' && (
        <div>
          <div className="admin-content-main">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Colors</h3>
                  <button
                    className="admin-btn primary"
                    onClick={() => {
                      resetColorForm();
                      setShowColorModal(true);
                    }}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Color
                  </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Color</th>
                      <th>Name</th>
                      <th>Hex Code</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((color) => (
                      <tr key={color.id}>
                        <td>
                          <div
                            className="color-preview"
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: color.hex_code,
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}
                          />
                        </td>
                        <td>{color.name}</td>
                        <td>{color.hex_code}</td>
                        <td>
                          <span className={`status-badge ${color.is_active ? 'active' : 'inactive'}`}>
                            {color.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                              <button
                                className="admin-btn icon"
                                onClick={() => handleEditColor(color)}
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button
                                className="admin-btn icon danger"
                                onClick={() => handleDeleteColor(color.id)}
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Color Modal */}
          {showColorModal && (
            <div className="admin-modal-overlay" onClick={resetColorForm}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h2>{editingColor ? 'Edit Color' : 'New Color'}</h2>
                  <button className="admin-modal-close" onClick={resetColorForm}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleColorSubmit} className="admin-modal-body">
                  <div className="form-group">
                    <label>Name*</label>
                    <input
                      type="text"
                      value={colorForm.name}
                      onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Hex Code*</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={colorForm.hex_code}
                        onChange={(e) => setColorForm({ ...colorForm, hex_code: e.target.value })}
                        style={{ width: '60px', height: '40px' }}
                      />
                      <input
                        type="text"
                        value={colorForm.hex_code}
                        onChange={(e) => setColorForm({ ...colorForm, hex_code: e.target.value })}
                        placeholder="#000000"
                        style={{ flex: 1 }}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={colorForm.is_active}
                        onChange={(e) => setColorForm({ ...colorForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="admin-btn secondary" onClick={resetColorForm}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn primary" disabled={saving}>
                      {saving ? 'Saving...' : editingColor ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Materials Section */}
      {activeSection === 'materials' && (
        <div>
          <div className="admin-content-main">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Materials</h3>
                  <button
                    className="admin-btn primary"
                    onClick={() => {
                      resetMaterialForm();
                      setShowMaterialModal(true);
                    }}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Material
                  </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((material) => (
                      <tr key={material.id}>
                        <td>{material.name}</td>
                        <td>{material.description || '-'}</td>
                        <td>
                          <span className={`status-badge ${material.is_active ? 'active' : 'inactive'}`}>
                            {material.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                              <button
                                className="admin-btn icon"
                                onClick={() => handleEditMaterial(material)}
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              <button
                                className="admin-btn icon danger"
                                onClick={() => handleDeleteMaterial(material.id)}
                              >
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Material Modal */}
          {showMaterialModal && (
            <div className="admin-modal-overlay" onClick={resetMaterialForm}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h2>{editingMaterial ? 'Edit Material' : 'New Material'}</h2>
                  <button className="admin-modal-close" onClick={resetMaterialForm}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleMaterialSubmit} className="admin-modal-body">
                  <div className="form-group">
                    <label>Name*</label>
                    <input
                      type="text"
                      value={materialForm.name}
                      onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={materialForm.description}
                      onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={materialForm.is_active}
                        onChange={(e) => setMaterialForm({ ...materialForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="admin-btn secondary" onClick={resetMaterialForm}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn primary" disabled={saving}>
                      {saving ? 'Saving...' : editingMaterial ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Discounts Section */}
      {activeSection === 'discounts' && (
        <div>
          <div className="admin-content-main">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Discount Filter Options</h3>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                  These are filter options for product pages. For checkout discounts, use Coupons.
                </p>
                  <button
                    className="admin-btn primary"
                    onClick={() => {
                      resetDiscountForm();
                      setShowDiscountModal(true);
                    }}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Discount Filter
                  </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Percentage</th>
                      <th>Label</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                          <div className="empty-list">
                            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#ccc', display: 'block', marginBottom: '16px' }}>
                              percent
                            </span>
                            <h3>No discount filters found</h3>
                            <p>Create discount filter options for product page filtering</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      discounts.map((discount) => (
                        <tr key={discount.id}>
                          <td><strong>{discount.percentage}%</strong></td>
                          <td>{discount.label || `${discount.percentage}%`}</td>
                          <td>
                            <span className={`status-badge ${discount.is_active ? 'active' : 'inactive'}`}>
                              {discount.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                                <button
                                  className="admin-btn icon"
                                  onClick={() => handleEditDiscount(discount)}
                                >
                                  <span className="material-symbols-outlined">edit</span>
                                </button>
                                <button
                                  className="admin-btn icon danger"
                                  onClick={() => handleDeleteDiscount(discount.id)}
                                >
                                  <span className="material-symbols-outlined">delete</span>
                                </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Discount Modal */}
          {showDiscountModal && (
            <div className="admin-modal-overlay" onClick={resetDiscountForm}>
              <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                <div className="admin-modal-header">
                  <h2>{editingDiscount ? 'Edit Discount Filter' : 'New Discount Filter'}</h2>
                  <button className="admin-modal-close" onClick={resetDiscountForm}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <form onSubmit={handleDiscountSubmit} className="admin-modal-body">
                  <div className="form-group">
                    <label>Discount Percentage*</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={discountForm.percentage}
                      onChange={(e) => setDiscountForm({ ...discountForm, percentage: parseInt(e.target.value) || 0 })}
                      required
                      placeholder="e.g., 10, 20, 30, 50"
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      Percentage value (0-100) for filtering products by discount
                    </small>
                  </div>
                  <div className="form-group">
                    <label>Label (Optional)</label>
                    <input
                      type="text"
                      value={discountForm.label}
                      onChange={(e) => setDiscountForm({ ...discountForm, label: e.target.value })}
                      placeholder="e.g., 10% Off"
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      If empty, will auto-generate as "{discountForm.percentage || 'X'}%"
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={discountForm.is_active}
                        onChange={(e) => setDiscountForm({ ...discountForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                      Only active discount filters will appear in product filter options
                    </small>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="admin-btn secondary" onClick={resetDiscountForm}>
                      Cancel
                    </button>
                    <button type="submit" className="admin-btn primary" disabled={saving}>
                      {saving ? 'Saving...' : editingDiscount ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFilterOptions;


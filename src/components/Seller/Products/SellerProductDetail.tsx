import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import { showToast } from '../../Admin/utils/adminUtils';
import { useNotification } from '../../../context/NotificationContext';

interface ProductImage {
  id?: number;
  image: string;
  alt_text: string;
  sort_order: number;
  is_active?: boolean;
}

interface VariantImage {
  id?: number;
  image: string;
  alt_text: string;
  sort_order: number;
  is_active?: boolean;
}

interface ProductVariant {
  id?: number;
  title?: string;
  color_id: number;
  color?: {
    id: number;
  name: string;
    hex_code: string;
  };
  size: string;
  pattern: string;
  price: string | number;
  old_price: string | number | null;
  stock_quantity: number;
  is_in_stock: boolean;
  image: string;
  images: VariantImage[];
  is_active: boolean;
}

interface Specification {
  id?: number;
  name: string;
  value: string;
  sort_order: number;
  is_active?: boolean;
}

interface Feature {
  id?: number;
  feature: string;
  sort_order: number;
  is_active?: boolean;
}

interface Offer {
  id?: number;
  title: string;
  description: string;
  discount_percentage: number | null;
  discount_amount: string | number | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

interface Recommendation {
  id?: number;
  recommended_product_id: number;
  recommended_product_title?: string;
  recommendation_type: 'buy_with' | 'inspired_by' | 'frequently_viewed' | 'similar' | 'recommended';
  sort_order: number;
  is_active: boolean;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  sku: string | null;
  short_description: string;
  long_description: string;
  category: { id: number; name: string };
  subcategory?: { id: number; name: string } | null;
  material?: { id: number; name: string } | null;
  brand: string;
  dimensions: string;
  weight: string;
  warranty: string;
  assembly_required: boolean;
  screen_offer?: string[];
  user_guide?: string;
  care_instructions?: string;
  meta_title: string;
  meta_description: string;
  is_featured: boolean;
  is_active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: Specification[];
  features: Feature[];
  offers: Offer[];
  recommendations: Recommendation[];
  created_at: string;
  updated_at: string;
}

const SellerProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const api = useAdminAPI();
  const { showConfirmation } = useNotification();
  const isSellerPanel = location.pathname.startsWith('/seller');
  const basePath = isSellerPanel ? '/seller' : '/admin';
  const isNew = id === 'new' || !id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'variants' | 'details' | 'seo'>('basic');
  const [activeDetailSection, setActiveDetailSection] = useState<'specifications' | 'features' | 'screen_offer' | 'user_guide' | 'care_instructions' | 'recommendations' | 'offers' | null>('specifications');
  
  // Form data
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    sku: string;
    short_description: string;
    long_description: string;
    category_id: string;
    subcategory_id: string;
    material_id: string;
    brand: string;
    dimensions: string;
    weight: string;
    warranty: string;
    assembly_required: boolean;
    screen_offer: string[];
    user_guide: string;
    care_instructions: string;
    meta_title: string;
    meta_description: string;
    is_featured: boolean;
    is_active: boolean;
  }>({
    title: '',
    slug: '',
    sku: '',
    short_description: '',
    long_description: '',
    category_id: '',
    subcategory_id: '',
    material_id: '',
    brand: 'Sixpine',
    dimensions: '',
    weight: '',
    warranty: '',
    assembly_required: false,
    screen_offer: [],
    user_guide: '',
    care_instructions: '',
    meta_title: '',
    meta_description: '',
    is_featured: false,
    is_active: true,
  });
  
  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [lastSelectedColorId, setLastSelectedColorId] = useState<number | null>(null);
  
  // Specifications
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  
  // Features
  const [features, setFeatures] = useState<Feature[]>([]);
  
  // Offers
  const [offers, setOffers] = useState<Offer[]>([]);
  
  // Recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  
  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dropdown data
        const [categoriesRes, colorsRes, materialsRes, productsRes] = await Promise.all([
          api.getCategories(),
          api.getColors(),
          api.getMaterials(),
          api.getProducts({ page_size: 1000 }) // Get all products for recommendations
        ]);
        
        setCategories(categoriesRes.data.results || categoriesRes.data || []);
        setColors(colorsRes.data.results || colorsRes.data || []);
        setMaterials(materialsRes.data.results || materialsRes.data || []);
        setAllProducts(productsRes.data.results || productsRes.data || []);
        
        // Fetch product if editing
        if (!isNew) {
          const response = await api.getProduct(parseInt(id!));
          const productData = response.data;
          setProduct(productData);
          
          // Populate form
          setFormData({
            title: productData.title || '',
            slug: productData.slug || '',
            sku: productData.sku || '',
            short_description: productData.short_description || '',
            long_description: productData.long_description || '',
            category_id: productData.category?.id?.toString() || '',
            subcategory_id: productData.subcategory?.id?.toString() || '',
            material_id: productData.material?.id?.toString() || '',
            brand: productData.brand || 'Sixpine',
            dimensions: productData.dimensions || '',
            weight: productData.weight || '',
            warranty: productData.warranty || '',
            assembly_required: productData.assembly_required || false,
            screen_offer: Array.isArray(productData.screen_offer) ? productData.screen_offer : (productData.screen_offer ? [productData.screen_offer] : []),
            user_guide: productData.user_guide || '',
            care_instructions: productData.care_instructions || '',
            meta_title: productData.meta_title || '',
            meta_description: productData.meta_description || '',
            is_featured: productData.is_featured || false,
            is_active: productData.is_active ?? true,
          });
          
          // Normalize variants: ensure color_id is set from color.id if needed
          const normalizedVariants = (productData.variants || []).map((v: any) => {
            // Extract color_id - it should now come from backend, but fallback to color.id if needed
            const colorId = v.color_id || (v.color?.id ? parseInt(v.color.id) : null) || 0;
            return {
              ...v,
              color_id: colorId
            };
          });
          setVariants(normalizedVariants);
          
          // Set last selected color from existing variants (use first variant's color if available)
          if (normalizedVariants.length > 0 && normalizedVariants[0].color_id && normalizedVariants[0].color_id !== 0) {
            setLastSelectedColorId(normalizedVariants[0].color_id);
          }
          setSpecifications(productData.specifications || []);
          setFeatures(productData.features || []);
          setOffers(productData.offers || []);
          // Normalize recommendations: ensure recommended_product_id is set
          const normalizedRecommendations = (productData.recommendations || []).map((rec: any) => {
            // Extract recommended_product_id from various possible sources
            let productId = 0;
            if (rec.recommended_product_id) {
              productId = typeof rec.recommended_product_id === 'number' 
                ? rec.recommended_product_id 
                : parseInt(rec.recommended_product_id);
            } else if (rec.recommended_product?.id) {
              productId = typeof rec.recommended_product.id === 'number'
                ? rec.recommended_product.id
                : parseInt(rec.recommended_product.id);
            }
            
            return {
              id: rec.id,
              recommended_product_id: productId,
              recommended_product_title: rec.recommended_product_title || rec.recommended_product?.title,
              recommendation_type: rec.recommendation_type,
              sort_order: rec.sort_order || 0,
              is_active: rec.is_active !== false
            };
          });
          setRecommendations(normalizedRecommendations);
          
          // Load subcategories for the selected category
          if (productData.category?.id) {
            fetchSubcategories(productData.category.id);
          }
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.detail || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, isNew]);
  
  const fetchSubcategories = async (categoryId: number) => {
    try {
      const response = await api.getSubcategories({ category: categoryId });
      setSubcategories(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };
  
  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(parseInt(formData.category_id));
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from title
      if (name === 'title' && isNew) {
        const slug = value.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  };
  
  // Image management
  // Variant management
  const handleAddVariant = () => {
    // Use last selected color, or first color, or 0 if no colors available
    const defaultColorId = lastSelectedColorId || colors[0]?.id || 0;
    setVariants([...variants, {
      color_id: defaultColorId,
      size: '',
      pattern: '',
      price: '',
      old_price: null,
      stock_quantity: 0,
      is_in_stock: true,
      image: '',
      images: [],
      is_active: true
    }]);
  };
  
  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };
  
  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
      updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
    
    // Remember the last selected color for new variants
    if (field === 'color_id' && value) {
      setLastSelectedColorId(value);
    }
  };
  
  const handleAddVariantImage = (variantIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].images = [...(updated[variantIndex].images || []), {
      image: '',
      alt_text: '',
      sort_order: updated[variantIndex].images?.length || 0,
      is_active: true
    }];
    setVariants(updated);
  };
  
  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].images = updated[variantIndex].images.filter((_, i) => i !== imageIndex);
    setVariants(updated);
  };
  
  const handleVariantImageChange = (variantIndex: number, imageIndex: number, field: string, value: any) => {
    const updated = [...variants];
    updated[variantIndex].images[imageIndex] = {
      ...updated[variantIndex].images[imageIndex],
      [field]: value
    };
    setVariants(updated);
  };
  
  // Specification management
  const handleAddSpecification = () => {
    setSpecifications([...specifications, {
      name: '',
      value: '',
      sort_order: specifications.length,
      is_active: true
    }]);
  };
  
  const handleRemoveSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };
  
  const handleSpecificationChange = (index: number, field: string, value: any) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
  };
  
  // Feature management
  const handleAddFeature = () => {
    setFeatures([...features, {
      feature: '',
      sort_order: features.length,
      is_active: true
    }]);
  };
  
  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };
  
  const handleFeatureChange = (index: number, field: string, value: any) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    setFeatures(updated);
  };
  
  // Offer management
  const handleAddOffer = () => {
    setOffers([...offers, {
      title: '',
      description: '',
      discount_percentage: null,
      discount_amount: null,
      is_active: true,
      valid_from: null,
      valid_until: null
    }]);
  };
  
  const handleRemoveOffer = (index: number) => {
    setOffers(offers.filter((_, i) => i !== index));
  };
  
  const handleOfferChange = (index: number, field: string, value: any) => {
    const updated = [...offers];
    updated[index] = { ...updated[index], [field]: value };
    setOffers(updated);
  };
  
  // Recommendation management
  const handleAddRecommendation = (type: Recommendation['recommendation_type']) => {
    setRecommendations([...recommendations, {
      recommended_product_id: 0,
      recommendation_type: type,
      sort_order: recommendations.filter(r => r.recommendation_type === type).length,
      is_active: true
    }]);
  };
  
  const handleRemoveRecommendation = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };
  
  const handleRecommendationChange = (index: number, field: string, value: any) => {
    const updated = [...recommendations];
    updated[index] = { ...updated[index], [field]: value };
    setRecommendations(updated);
  };
  
  const showSuccess = (message: string) => {
    setSuccess(message);
    showToast(message, 'success');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category_id) {
      setError('Title and Category are required');
      return;
    }
    
    // Validate category_id is a valid number
    const categoryId = parseInt(formData.category_id);
    if (isNaN(categoryId) || categoryId <= 0) {
      setError('Please select a valid category');
      return;
    }
    
    // Validate all variants have a color_id
    const invalidVariants = variants.filter(v => {
      const colorId = v.color_id || v.color?.id;
      return !colorId || colorId === 0;
    });
    
    if (invalidVariants.length > 0) {
      setError(`Please select a color for all ${invalidVariants.length} variant(s)`);
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const payload: any = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: formData.sku || null,
        short_description: formData.short_description,
        long_description: formData.long_description,
        category_id: categoryId,
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
        material_id: formData.material_id ? parseInt(formData.material_id) : null,
        brand: formData.brand,
        dimensions: formData.dimensions,
        weight: formData.weight,
        warranty: formData.warranty,
        assembly_required: formData.assembly_required,
        screen_offer: formData.screen_offer,
        user_guide: formData.user_guide,
        care_instructions: formData.care_instructions,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        variants: variants.map(v => {
          // Ensure color_id is always set (from v.color_id or v.color.id)
          const colorId = v.color_id || v.color?.id;
          if (!colorId) {
            throw new Error(`Variant ${v.id || 'new'} is missing a color selection`);
          }
          return {
            id: v.id,
            color_id: colorId,
            size: v.size || '',
            pattern: v.pattern || '',
            title: v.title || '',
          price: v.price ? parseFloat(v.price.toString()) : null,
          old_price: v.old_price ? parseFloat(v.old_price.toString()) : null,
            stock_quantity: parseInt(v.stock_quantity.toString()) || 0,
            is_in_stock: v.is_in_stock !== false,
            image: v.image || '',
            is_active: v.is_active !== false,
            images: (v.images || []).map(img => ({
              image: img.image,
              alt_text: img.alt_text,
              sort_order: img.sort_order,
              is_active: img.is_active !== false
            }))
          };
        }),
        specifications: specifications.map(s => ({
          name: s.name,
          value: s.value,
          sort_order: s.sort_order,
          is_active: s.is_active !== false
        })),
        features: features.map(f => ({
          feature: f.feature,
          sort_order: f.sort_order,
          is_active: f.is_active !== false
        })),
        offers: offers.map(o => ({
          title: o.title,
          description: o.description,
          discount_percentage: o.discount_percentage,
          discount_amount: o.discount_amount ? parseFloat(o.discount_amount.toString()) : null,
          is_active: o.is_active !== false,
          valid_from: o.valid_from || null,
          valid_until: o.valid_until || null
        })),
        recommendations: recommendations.map(r => ({
          id: r.id,
          recommended_product_id: r.recommended_product_id,
          recommendation_type: r.recommendation_type,
          sort_order: r.sort_order || 0,
          is_active: r.is_active !== false
        }))
      };
      
      console.log('Saving product with payload:', payload);
      
      let response;
      if (isNew) {
        response = await api.createProduct(payload);
        showSuccess('Product created successfully!');
        navigate(`${basePath}/products/${response.data.id}`);
      } else {
        response = await api.updateProduct(parseInt(id!), payload);
        setProduct(response.data);
        showSuccess('Product updated successfully!');
      }
      
    } catch (err: any) {
      console.error('Error saving product:', err);
      let errorMessage = 'Failed to save product';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      }
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleActive = async () => {
    if (isNew || !product) {
      setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
      return;
    }
    
    try {
      await api.toggleProductActive(product.id);
      setFormData(prev => ({ ...prev, is_active: !prev.is_active }));
      showSuccess(`Product ${formData.is_active ? 'hidden' : 'shown'}`);
    } catch (err) {
      setError('Failed to toggle product status');
    }
  };
  
  const handleToggleFeatured = async () => {
    if (isNew || !product) {
      setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }));
      return;
    }
    
    try {
      await api.toggleProductFeatured(product.id);
      setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }));
      showSuccess(`Product ${formData.is_featured ? 'removed from' : 'added to'} featured`);
    } catch (err) {
      setError('Failed to toggle featured status');
    }
  };
  
  const handleDelete = async () => {
    if (!product) return;
    
    const confirmed = await showConfirmation({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonStyle: 'danger',
    });

    if (!confirmed) {
      return;
    }
    
    try {
      await api.deleteProduct(product.id);
      showSuccess('Product deleted successfully');
      navigate(`${basePath}/products`);
    } catch (err) {
      setError('Failed to delete product');
    }
  };
  
  if (loading) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="admin-product-detail">
      <div className="admin-header-actions">
        <div className="admin-header-with-back">
          <button className="admin-back-button" onClick={() => navigate(`${basePath}/products`)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2>{isNew ? 'Add New Product' : 'Edit Product'}</h2>
        </div>
        {!isNew && product && (
          <div className="header-actions">
            <button className="admin-btn secondary" onClick={() => window.open(`/products-details/${product.slug}`, '_blank')}>
              <span className="material-symbols-outlined">visibility</span>
              View Product
            </button>
            <button className="admin-btn danger" onClick={handleDelete}>
              <span className="material-symbols-outlined">delete</span>
              Delete Product
            </button>
          </div>
        )}
      </div>
      
      {error && (
        <div className="admin-error-message">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="admin-success-message">
          <span className="material-symbols-outlined">check_circle</span>
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Tabs */}
        <div className="admin-tabs" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={activeTab === 'basic' ? 'active' : ''}
            onClick={() => setActiveTab('basic')}
          >
            Basic Info
          </button>
          <button
            type="button"
            className={activeTab === 'variants' ? 'active' : ''}
            onClick={() => setActiveTab('variants')}
          >
            Variants ({variants.length})
          </button>
          <button
            type="button"
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          {/* <button
            type="button"
            className={activeTab === 'seo' ? 'active' : ''}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button> */}
        </div>
        
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="admin-card">
            <h3>Basic Information</h3>
            
              <div className="form-row">
              <div className="form-group tw-flex-1">
                <label htmlFor="title">Product Title*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="slug">Slug*</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                  className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sku">SKU</label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="Stock Keeping Unit"
                  className="tw-w-full"
                  />
                </div>
              </div>
              
              <div className="form-group">
              <label htmlFor="short_description">Short Description*</label>
                <textarea
                id="short_description"
                name="short_description"
                value={formData.short_description}
                  onChange={handleChange}
                rows={3}
                  required
                className="tw-w-full"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="long_description">Long Description</label>
              <textarea
                id="long_description"
                name="long_description"
                value={formData.long_description}
                onChange={handleChange}
                rows={6}
                className="tw-w-full"
                />
              </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_id">Category*</label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="tw-w-full"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="subcategory_id">Subcategory</label>
                <select
                  id="subcategory_id"
                  name="subcategory_id"
                  value={formData.subcategory_id}
                  onChange={handleChange}
                  className="tw-w-full"
                  disabled={!formData.category_id}
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="material_id">Material</label>
                <select
                  id="material_id"
                  name="material_id"
                  value={formData.material_id}
                  onChange={handleChange}
                  className="tw-w-full"
                >
                  <option value="">Select material</option>
                  {materials.map(mat => (
                    <option key={mat.id} value={mat.id}>{mat.name}</option>
                  ))}
                </select>
              </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                <label htmlFor="brand">Brand</label>
                  <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                    onChange={handleChange}
                  className="tw-w-full"
                  />
                </div>
                <div className="form-group">
                <label htmlFor="dimensions">Dimensions</label>
                <input
                  type="text"
                  id="dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                    onChange={handleChange}
                  placeholder="e.g., L x W x H"
                  className="tw-w-full"
                />
              </div>
              <div className="form-group">
                <label htmlFor="weight">Weight</label>
                <input
                  type="text"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="e.g., 5kg"
                  className="tw-w-full"
                />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                <label htmlFor="warranty">Warranty</label>
                  <input
                    type="text"
                  id="warranty"
                  name="warranty"
                  value={formData.warranty}
                    onChange={handleChange}
                  placeholder="e.g., 1 Year"
                  className="tw-w-full"
                  />
                </div>
              <div className="form-group tw-flex tw-items-end">
                <label className="tw-flex tw-items-center tw-gap-2">
                  <input
                    type="checkbox"
                    id="assembly_required"
                    name="assembly_required"
                    checked={formData.assembly_required}
                    onChange={handleChange}
                  />
                  <span>Assembly Required</span>
                </label>
                </div>
              </div>
              
              <div className="form-row checkbox-row">
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_active">Active</label>
                </div>
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                  />
                  <label htmlFor="is_featured">Featured</label>
                </div>
            </div>
          </div>
        )}
        
        {/* Variants Tab */}
        {activeTab === 'variants' && (
          <div className="admin-card">
            <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
              <div>
                <h3 className="tw-text-xl tw-font-bold tw-text-gray-800">Product Variants</h3>
                <p className="tw-text-sm tw-text-gray-500 tw-mt-1">Manage product variations by color, size, and pattern</p>
              </div>
              <button 
                type="button" 
                className="admin-modern-btn primary"
                onClick={handleAddVariant}
              >
                <span className="material-symbols-outlined">add</span>
                Add Variant
              </button>
            </div>
            
            <div className="tw-space-y-6">
              {variants.map((variant, variantIndex) => {
                const selectedColor = colors.find(c => c.id === (variant.color_id || variant.color?.id));
                return (
                  <div 
                    key={variantIndex} 
                    className="tw-border-2 tw-border-gray-200 tw-rounded-xl tw-overflow-hidden tw-bg-white hover:tw-border-blue-300 tw-transition-all tw-shadow-sm hover:tw-shadow-md"
                  >
                    {/* Variant Header */}
                    <div className="tw-bg-gradient-to-r tw-from-gray-50 tw-to-gray-100 tw-px-6 tw-py-4 tw-border-b tw-border-gray-200">
                      <div className="tw-flex tw-justify-between tw-items-center">
                        <div className="tw-flex tw-items-center tw-gap-3">
                          <div className="tw-w-10 tw-h-10 tw-bg-blue-100 tw-rounded-lg tw-flex tw-items-center tw-justify-center">
                            <span className="material-symbols-outlined tw-text-blue-600">style</span>
                          </div>
                          <div>
                            <h4 className="tw-font-bold tw-text-gray-800 tw-text-lg">Variant {variantIndex + 1}</h4>
                            {variant.title && (
                              <p className="tw-text-sm tw-text-gray-500">{variant.title}</p>
                            )}
                          </div>
                        </div>
                          <button
                            type="button"
                          className="admin-modern-btn danger icon-only"
                      onClick={() => handleRemoveVariant(variantIndex)}
                          title="Delete Variant"
                          >
                      <span className="material-symbols-outlined">delete</span>
                          </button>
                      </div>
                        </div>
                  
                    {/* Variant Content */}
                    <div className="tw-p-6">
                      {/* Basic Information */}
                      <div className="tw-mb-6">
                        <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                          <span className="material-symbols-outlined tw-text-base">info</span>
                          Basic Information
                        </h5>
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-4">
                          <div className="admin-form-group">
                            <label className="tw-flex tw-items-center tw-gap-1">
                              Color <span className="tw-text-red-500">*</span>
                            </label>
                            <div className="tw-relative">
                      <select
                        value={String(variant.color_id || variant.color?.id || '')}
                        onChange={(e) => {
                          const colorId = e.target.value ? parseInt(e.target.value) : 0;
                          handleVariantChange(variantIndex, 'color_id', colorId);
                        }}
                                className="admin-input tw-pr-10"
                        required
                      >
                        <option value="">Select color</option>
                        {colors.map(color => (
                          <option key={color.id} value={String(color.id)}>
                            {color.name} {color.hex_code && `(${color.hex_code})`}
                          </option>
                        ))}
                      </select>
                              {selectedColor?.hex_code && (
                                <div 
                                  className="tw-absolute tw-right-3 tw-top-1/2 tw-transform -tw-translate-y-1/2 tw-w-5 tw-h-5 tw-rounded tw-border tw-border-gray-300"
                                  style={{ backgroundColor: selectedColor.hex_code }}
                                  title={selectedColor.name}
                                />
                              )}
                    </div>
                          </div>
                          
                          <div className="admin-form-group">
                      <label>Size</label>
                            <input
                              type="text"
                        value={variant.size}
                        onChange={(e) => handleVariantChange(variantIndex, 'size', e.target.value)}
                        placeholder="e.g., M, L, 3-Seater"
                              className="admin-input"
                            />
                          </div>
                          
                          <div className="admin-form-group">
                      <label>Pattern</label>
                            <input
                              type="text"
                        value={variant.pattern}
                        onChange={(e) => handleVariantChange(variantIndex, 'pattern', e.target.value)}
                        placeholder="e.g., Classic, Modern"
                              className="admin-input"
                            />
                          </div>
                          
                          <div className="admin-form-group">
                      <label>Variant Title</label>
                      <input
                        type="text"
                        value={variant.title || ''}
                        onChange={(e) => handleVariantChange(variantIndex, 'title', e.target.value)}
                        placeholder="Auto-generated if empty"
                              className="admin-input"
                      />
                        </div>
                        </div>
                      </div>
                      
                      {/* Pricing & Stock */}
                      <div className="tw-mb-6 tw-pt-6 tw-border-t tw-border-gray-200">
                        <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                          <span className="material-symbols-outlined tw-text-base">payments</span>
                          Pricing & Stock
                        </h5>
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                          <div className="admin-form-group">
                            <label>Price</label>
                            <div className="tw-relative">
                              <span className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-500">₹</span>
                            <input
                              type="number"
                              value={variant.price}
                        onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
                              step="0.01"
                        placeholder="Inherits from product"
                                className="admin-input tw-pl-8"
                            />
                          </div>
                          </div>
                          
                          <div className="admin-form-group">
                      <label>Old Price</label>
                            <div className="tw-relative">
                              <span className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-500">₹</span>
                      <input
                        type="number"
                        value={variant.old_price || ''}
                        onChange={(e) => handleVariantChange(variantIndex, 'old_price', e.target.value || null)}
                        step="0.01"
                                className="admin-input tw-pl-8"
                      />
                    </div>
                          </div>
                          
                          <div className="admin-form-group">
                            <label className="tw-flex tw-items-center tw-gap-1">
                              Stock Quantity <span className="tw-text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={variant.stock_quantity}
                        onChange={(e) => handleVariantChange(variantIndex, 'stock_quantity', parseInt(e.target.value) || 0)}
                              min="0"
                        required
                              className="admin-input"
                            />
                            <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
                              {variant.stock_quantity > 0 ? (
                                <span className="tw-text-green-600 tw-font-medium">In Stock</span>
                              ) : (
                                <span className="tw-text-red-600 tw-font-medium">Out of Stock</span>
                              )}
                            </p>
                          </div>
                          
                          <div className="admin-form-group tw-flex tw-items-end">
                            <label className="tw-flex tw-items-center tw-gap-2 tw-cursor-pointer tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-w-full hover:tw-bg-gray-50">
                              <input
                                type="checkbox"
                                checked={variant.is_active !== false}
                                onChange={(e) => handleVariantChange(variantIndex, 'is_active', e.target.checked)}
                                className="tw-w-4 tw-h-4"
                              />
                              <span className="tw-font-medium">Active</span>
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Variant Image */}
                      <div className="tw-mb-6 tw-pt-6 tw-border-t tw-border-gray-200">
                        <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-mb-4 tw-flex tw-items-center tw-gap-2">
                          <span className="material-symbols-outlined tw-text-base">image</span>
                          Variant Image
                        </h5>
                        <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                          <div className="admin-form-group">
                            <label>Image URL</label>
                      <input
                        type="url"
                        value={variant.image}
                        onChange={(e) => handleVariantChange(variantIndex, 'image', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                              className="admin-input"
                      />
                        </div>
                          <div className="admin-form-group">
                            {variant.image ? (
                              <div className="tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-bg-gray-50">
                                <img 
                                  src={variant.image} 
                                  alt="Variant" 
                                  className="tw-w-full tw-h-48 tw-object-contain tw-rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg tw-p-8 tw-text-center tw-bg-gray-50">
                                <span className="material-symbols-outlined tw-text-gray-400 tw-text-4xl">image</span>
                                <p className="tw-text-sm tw-text-gray-500 tw-mt-2">No image added</p>
                              </div>
                            )}
                          </div>
                      </div>
                  </div>
                  
                  {/* Variant Images */}
                      <div className="tw-pt-6 tw-border-t tw-border-gray-200">
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                          <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                            <span className="material-symbols-outlined tw-text-base">photo_library</span>
                            Variant Images ({variant.images?.length || 0})
                          </h5>
                    <button
                      type="button"
                            className="admin-modern-btn secondary"
                        onClick={() => handleAddVariantImage(variantIndex)}
                    >
                            <span className="material-symbols-outlined">add</span>
                        Add Image
                    </button>
                    </div>
                        <div className="tw-space-y-4">
                      {variant.images?.map((img, imgIndex) => (
                            <div key={imgIndex} className="tw-border tw-border-gray-200 tw-rounded-lg tw-p-4 tw-bg-gray-50">
                              <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-12 tw-gap-4 tw-items-start">
                                <div className="md:tw-col-span-4">
                                  {img.image ? (
                                    <div className="tw-border tw-border-gray-200 tw-rounded-lg tw-overflow-hidden tw-bg-white">
                                      <img 
                                        src={img.image} 
                                        alt={img.alt_text || 'Variant image'} 
                                        className="tw-w-full tw-h-32 tw-object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg tw-p-4 tw-text-center tw-bg-white tw-h-32 tw-flex tw-items-center tw-justify-center">
                                      <span className="material-symbols-outlined tw-text-gray-400">image</span>
                                    </div>
                                  )}
                                </div>
                                <div className="md:tw-col-span-7 tw-space-y-3">
                                  <div className="admin-form-group">
                                    <label>Image URL</label>
                          <input
                            type="url"
                            value={img.image}
                            onChange={(e) => handleVariantImageChange(variantIndex, imgIndex, 'image', e.target.value)}
                                      placeholder="https://example.com/image.jpg"
                                      className="admin-input"
                          />
                                  </div>
                                  <div className="tw-grid tw-grid-cols-2 tw-gap-3">
                                    <div className="admin-form-group">
                                      <label>Alt Text</label>
                          <input
                            type="text"
                            value={img.alt_text}
                            onChange={(e) => handleVariantImageChange(variantIndex, imgIndex, 'alt_text', e.target.value)}
                                        placeholder="Image description"
                                        className="admin-input"
                          />
                                    </div>
                                    <div className="admin-form-group">
                                      <label>Sort Order</label>
                            <input
                              type="number"
                              value={img.sort_order}
                              onChange={(e) => handleVariantImageChange(variantIndex, imgIndex, 'sort_order', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        className="admin-input"
                            />
                                    </div>
                                  </div>
                                </div>
                                <div className="md:tw-col-span-1 tw-flex tw-items-start tw-justify-end">
                            <button
                              type="button"
                                    className="admin-modern-btn danger icon-only"
                              onClick={() => handleRemoveVariantImage(variantIndex, imgIndex)}
                                    title="Remove Image"
                            >
                                    <span className="material-symbols-outlined">delete</span>
                            </button>
                                </div>
                        </div>
                      </div>
                    ))}
                          {(!variant.images || variant.images.length === 0) && (
                            <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                              <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">photo_library</span>
                              <p className="tw-mt-2">No variant images added</p>
                    </div>
                          )}
                  </div>
                </div>
                    </div>
                  </div>
                );
              })}
              
              {variants.length === 0 && (
                <div className="tw-text-center tw-py-12 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-xl tw-bg-gray-50">
                  <span className="material-symbols-outlined tw-text-6xl tw-text-gray-400 tw-mb-4">style</span>
                  <h4 className="tw-text-lg tw-font-semibold tw-text-gray-700 tw-mb-2">No variants added</h4>
                  <p className="tw-text-gray-500 tw-mb-4">Click "Add Variant" to create your first product variant</p>
                  <button 
                    type="button" 
                    className="admin-modern-btn primary"
                    onClick={handleAddVariant}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Your First Variant
                  </button>
                  </div>
                )}
              </div>
          </div>
        )}
        
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="admin-card tw-space-y-3">
            {/* Specifications Section */}
            <div className="tw-border-2 tw-border-blue-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-blue-50 tw-via-blue-100 tw-to-blue-50">
                <button
                  type="button"
                  className="btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform " 
                  onClick={() => setActiveDetailSection(activeDetailSection === 'specifications' ? null : 'specifications')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-blue-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'specifications' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">Specifications</h3>
                </button>
                <button 
                  type="button" 
                  className="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-2.5 tw-bg-orange-600 tw-text-white tw-rounded-lg hover:tw-bg-orange-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-sm hover:tw-scale-105 active:tw-scale-95"
                  onClick={handleAddSpecification}
                >
                  <span className="material-symbols-outlined tw-text-lg tw-font-bold">add</span>
                  Add Specifications
                </button>
              </div>
              {activeDetailSection === 'specifications' && (
                <div className="tw-p-5 tw-bg-white tw-space-y-3">
                  {specifications.map((spec, index) => (
                    <div key={index} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-grid tw-grid-cols-4 tw-gap-3 hover:tw-shadow-md tw-transition-shadow">
                      <div>
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                        <input
                          type="text"
                          value={spec.name}
                          onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                          placeholder="e.g., Brand"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div>
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div>
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                        <input
                          type="number"
                          value={spec.sort_order}
                          onChange={(e) => handleSpecificationChange(index, 'sort_order', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div className="tw-flex tw-items-end">
                        <button
                          type="button"
                          className="tw-w-full tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center tw-gap-1"
                          onClick={() => handleRemoveSpecification(index)}
                        >
                          <span className="material-symbols-outlined tw-text-lg">delete</span>
                          <span className="tw-text-sm tw-font-medium">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {specifications.length === 0 && (
                    <div className="tw-text-center tw-py-8 tw-text-gray-400">
                      <span className="material-symbols-outlined tw-text-5xl tw-mb-2">inventory_2</span>
                      <p className="tw-text-sm">No specifications added yet. Click "Add" to create one.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Features Section */}
            <div className="tw-border-2 tw-border-blue-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-blue-50 tw-via-blue-100 tw-to-blue-50">
                <button
                  type="button"
                  className="btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform"
                  onClick={() => setActiveDetailSection(activeDetailSection === 'features' ? null : 'features')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-blue-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'features' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">Features</h3>
                </button>
                <button 
                  type="button" 
                  className="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-2.5 tw-bg-blue-600 tw-text-white tw-rounded-lg hover:tw-bg-blue-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-sm hover:tw-scale-105 active:tw-scale-95"
                  onClick={handleAddFeature}
                >
                  <span className="material-symbols-outlined tw-text-lg tw-font-bold">add</span>
                  Add Features
                </button>
              </div>
              {activeDetailSection === 'features' && (
                <div className="tw-p-5 tw-bg-white tw-space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3 hover:tw-shadow-md tw-transition-shadow">
                      <div className="tw-flex-1">
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Feature Description</label>
                        <textarea
                          value={feature.feature}
                          onChange={(e) => handleFeatureChange(index, 'feature', e.target.value)}
                          placeholder="Describe the feature..."
                          rows={2}
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm tw-resize-none"
                        />
                      </div>
                      <div className="tw-w-24">
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                        <input
                          type="number"
                          value={feature.sort_order}
                          onChange={(e) => handleFeatureChange(index, 'sort_order', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div className="tw-flex tw-items-end">
                        <button
                          type="button"
                          className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                          onClick={() => handleRemoveFeature(index)}
                        >
                          <span className="material-symbols-outlined tw-text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <div className="tw-text-center tw-py-8 tw-text-gray-400">
                      <span className="material-symbols-outlined tw-text-5xl tw-mb-2">stars</span>
                      <p className="tw-text-sm">No features added yet. Click "Add" to create one.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
              
            {/* Screen Offer Section */}
            <div className="tw-border-2 tw-border-purple-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-purple-50 tw-via-purple-100 tw-to-purple-50">
                <button
                  type="button"
                  className="btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform"
                  onClick={() => setActiveDetailSection(activeDetailSection === 'screen_offer' ? null : 'screen_offer')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-purple-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'screen_offer' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">Screen Offer</h3>
                </button>
                <button 
                  type="button" 
                  className="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-2.5 tw-bg-purple-600 tw-text-white tw-rounded-lg hover:tw-bg-purple-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-sm hover:tw-scale-105 active:tw-scale-95"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      screen_offer: [...prev.screen_offer, '']
                    }));
                  }}
                >
                  <span className="material-symbols-outlined tw-text-lg tw-font-bold">add</span>
                  Add Screen Offer
                </button>
              </div>
              {activeDetailSection === 'screen_offer' && (
                <div className="tw-p-5 tw-bg-white tw-space-y-3">
                  {formData.screen_offer.map((offer, index) => (
                    <div key={index} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3 hover:tw-shadow-md tw-transition-shadow">
                      <div className="tw-flex-1">
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Offer Text</label>
                        <textarea
                          value={offer}
                          onChange={(e) => {
                            const updated = [...formData.screen_offer];
                            updated[index] = e.target.value;
                            setFormData(prev => ({ ...prev, screen_offer: updated }));
                          }}
                          placeholder="Enter screen offer text..."
                          rows={2}
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-text-sm tw-resize-none"
                        />
                      </div>
                      <div className="tw-flex tw-items-end">
                        <button
                          type="button"
                          className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                          onClick={() => {
                            const updated = formData.screen_offer.filter((_, i) => i !== index);
                            setFormData(prev => ({ ...prev, screen_offer: updated }));
                          }}
                        >
                          <span className="material-symbols-outlined tw-text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.screen_offer.length === 0 && (
                    <div className="tw-text-center tw-py-8 tw-text-gray-400">
                      <span className="material-symbols-outlined tw-text-5xl tw-mb-2">local_offer</span>
                      <p className="tw-text-sm">No screen offers added yet. Click "Add" to create one.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Guide Section */}
            <div className="tw-border-2 tw-border-teal-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-teal-50 tw-via-teal-100 tw-to-teal-50">
                <button
                  type="button"
                  className=" btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform"
                  onClick={() => setActiveDetailSection(activeDetailSection === 'user_guide' ? null : 'user_guide')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-teal-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'user_guide' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">User Guide</h3>
                </button>
              </div>
              {activeDetailSection === 'user_guide' && (
                <div className="tw-p-5 tw-bg-white">
                  <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-2">Instructions</label>
                  <textarea
                    id="user_guide"
                    name="user_guide"
                    value={formData.user_guide}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter user guide instructions..."
                    className="tw-w-full tw-px-4 tw-py-3 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-teal-500 focus:tw-border-transparent tw-text-sm tw-resize-none"
                  />
                </div>
              )}
            </div>

            {/* Care Instructions Section */}
            <div className="tw-border-2 tw-border-green-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-green-50 tw-via-green-100 tw-to-green-50">
                <button
                  type="button"
                  className="btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform"
                  onClick={() => setActiveDetailSection(activeDetailSection === 'care_instructions' ? null : 'care_instructions')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-green-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'care_instructions' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">Care Instructions</h3>
                </button>
              </div>
              {activeDetailSection === 'care_instructions' && (
                <div className="tw-p-5 tw-bg-white">
                  <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-2">Instructions</label>
                  <textarea
                    id="care_instructions"
                    name="care_instructions"
                    value={formData.care_instructions}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter care and maintenance instructions (e.g., Wipe with a dry soft cloth. Avoid water and harsh chemicals.)"
                    className="tw-w-full tw-px-4 tw-py-3 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent tw-text-sm tw-resize-none"
                  />
                </div>
              )}
            </div>
            
            {/* Recommendations Section */}
            <div className="tw-border-2 tw-border-indigo-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-indigo-50 tw-via-indigo-100 tw-to-indigo-50">
                <button
                  type="button"
                  className="btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform"
                  onClick={() => setActiveDetailSection(activeDetailSection === 'recommendations' ? null : 'recommendations')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-indigo-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'recommendations' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">Product Recommendations</h3>
                </button>
              </div>
              {activeDetailSection === 'recommendations' && (
                <div className="tw-p-5 tw-bg-white tw-space-y-6">
                  {/* Recommendation Types */}
                  {(['buy_with', 'inspired_by', 'frequently_viewed', 'similar', 'recommended'] as const).map((type) => {
                    const typeRecommendations = recommendations.filter(r => r.recommendation_type === type);
                    const typeLabels = {
                      buy_with: 'Buy with it',
                      inspired_by: 'Inspired by browsing history',
                      frequently_viewed: 'Frequently viewed',
                      similar: 'Similar products',
                      recommended: 'Recommended for you'
                    };
                    
                    return (
                      <div key={type} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg">
                        <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                          <h4 className="tw-font-semibold tw-text-md tw-text-gray-700">{typeLabels[type]}</h4>
                          <button 
                            type="button" 
                            className="tw-flex tw-items-center tw-gap-1 tw-px-3 tw-py-1.5 tw-bg-indigo-600 tw-text-white tw-rounded-md hover:tw-bg-indigo-700 tw-transition-colors tw-text-sm tw-font-medium"
                            onClick={() => handleAddRecommendation(type)}
                          >
                            <span className="material-symbols-outlined tw-text-base">add</span>
                            Add
                          </button>
                        </div>
                        <div className="tw-space-y-3">
                          {typeRecommendations.map((rec, recIndex) => {
                            const globalIndex = recommendations.findIndex(r => r === rec);
                        return (
                          <div key={recIndex} className="tw-p-4 tw-bg-white tw-border tw-border-gray-300 tw-rounded-lg tw-grid tw-grid-cols-1 md:tw-grid-cols-4 tw-gap-3 hover:tw-shadow-md tw-transition-shadow">
                            <div>
                              <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Recommended Product*</label>
                              <select
                                value={String(rec.recommended_product_id || '')}
                                onChange={(e) => handleRecommendationChange(globalIndex, 'recommended_product_id', parseInt(e.target.value) || 0)}
                                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-transparent tw-text-sm"
                                required
                              >
                                <option value="">Select product</option>
                                {allProducts.filter(p => isNew || p.id !== product?.id).map(prod => (
                                  <option key={prod.id} value={String(prod.id)}>
                                    {prod.title}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Sort Order</label>
                              <input
                                type="number"
                                value={rec.sort_order || 0}
                                onChange={(e) => handleRecommendationChange(globalIndex, 'sort_order', parseInt(e.target.value) || 0)}
                                className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-indigo-500 focus:tw-border-transparent tw-text-sm"
                              />
                            </div>
                            <div className="tw-flex tw-items-end">
                              <label className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-bg-gray-50 tw-rounded-md tw-cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={rec.is_active !== false}
                                  onChange={(e) => handleRecommendationChange(globalIndex, 'is_active', e.target.checked)}
                                  className="tw-w-4 tw-h-4 tw-text-indigo-600 tw-rounded focus:tw-ring-2 focus:tw-ring-indigo-500"
                                />
                                <span className="tw-text-sm tw-font-medium tw-text-gray-700">Active</span>
                              </label>
                            </div>
                            <div className="tw-flex tw-items-end tw-justify-end">
                              <button
                                type="button"
                                className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                                onClick={() => handleRemoveRecommendation(globalIndex)}
                              >
                                <span className="material-symbols-outlined tw-text-lg">delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {typeRecommendations.length === 0 && (
                        <p className="tw-text-gray-400 tw-text-sm tw-italic tw-text-center tw-py-4">No {typeLabels[type].toLowerCase()} recommendations added yet.</p>
                      )}
                </div>
              </div>
                );
              })}
                </div>
              )}
            </div>
            
            {/* Offers Section */}
            <div className="tw-border-2 tw-border-pink-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-pink-50 tw-via-pink-100 tw-to-pink-50">
                <button
                  type="button"
                  className="btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform"
                  onClick={() => setActiveDetailSection(activeDetailSection === 'offers' ? null : 'offers')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-pink-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'offers' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">Offers</h3>
                </button>
                <button 
                  type="button" 
                  className="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-2.5 tw-bg-pink-600 tw-text-white tw-rounded-lg hover:tw-bg-pink-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-sm hover:tw-scale-105 active:tw-scale-95"
                  onClick={handleAddOffer}
                >
                  <span className="material-symbols-outlined tw-text-lg tw-font-bold">add</span>
                  Add Offer
                </button>
              </div>
              {activeDetailSection === 'offers' && (
                <div className="tw-p-5 tw-bg-white tw-space-y-4">
                  {offers.map((offer, index) => (
                    <div key={index} className="tw-p-5 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg hover:tw-shadow-md tw-transition-shadow">
                      <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                        <h4 className="tw-font-semibold tw-text-md tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                          <span className="material-symbols-outlined tw-text-pink-600">local_offer</span>
                          Offer {index + 1}
                        </h4>
                        <button
                          type="button"
                          className="tw-px-3 tw-py-1.5 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-gap-1"
                          onClick={() => handleRemoveOffer(index)}
                        >
                          <span className="material-symbols-outlined tw-text-base">delete</span>
                          <span className="tw-text-sm tw-font-medium">Remove</span>
                        </button>
                      </div>
                      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                        <div>
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Title*</label>
                          <input
                            type="text"
                            value={offer.title}
                            onChange={(e) => handleOfferChange(index, 'title', e.target.value)}
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-pink-500 focus:tw-border-transparent tw-text-sm"
                            placeholder="e.g., Summer Sale"
                            required
                          />
                        </div>
                        <div>
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Description*</label>
                          <textarea
                            value={offer.description}
                            onChange={(e) => handleOfferChange(index, 'description', e.target.value)}
                            rows={2}
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-pink-500 focus:tw-border-transparent tw-text-sm tw-resize-none"
                            placeholder="Offer description..."
                            required
                          />
                        </div>
                        <div>
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Discount Percentage</label>
                          <input
                            type="number"
                            value={offer.discount_percentage || ''}
                            onChange={(e) => handleOfferChange(index, 'discount_percentage', e.target.value ? parseInt(e.target.value) : null)}
                            min="0"
                            max="100"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-pink-500 focus:tw-border-transparent tw-text-sm"
                            placeholder="e.g., 20"
                          />
                        </div>
                        <div>
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Discount Amount</label>
                          <input
                            type="number"
                            value={offer.discount_amount || ''}
                            onChange={(e) => handleOfferChange(index, 'discount_amount', e.target.value || null)}
                            step="0.01"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-pink-500 focus:tw-border-transparent tw-text-sm"
                            placeholder="e.g., 100.00"
                          />
                        </div>
                        <div>
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Valid From</label>
                          <input
                            type="datetime-local"
                            value={offer.valid_from || ''}
                            onChange={(e) => handleOfferChange(index, 'valid_from', e.target.value || null)}
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-pink-500 focus:tw-border-transparent tw-text-sm"
                          />
                        </div>
                        <div>
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Valid Until</label>
                          <input
                            type="datetime-local"
                            value={offer.valid_until || ''}
                            onChange={(e) => handleOfferChange(index, 'valid_until', e.target.value || null)}
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-pink-500 focus:tw-border-transparent tw-text-sm"
                          />
                        </div>
                        <div className="tw-flex tw-items-end">
                          <label className="tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-2 tw-bg-white tw-border tw-border-gray-300 tw-rounded-md tw-cursor-pointer hover:tw-bg-gray-50">
                            <input
                              type="checkbox"
                              checked={offer.is_active !== false}
                              onChange={(e) => handleOfferChange(index, 'is_active', e.target.checked)}
                              className="tw-w-4 tw-h-4 tw-text-pink-600 tw-rounded focus:tw-ring-2 focus:tw-ring-pink-500"
                            />
                            <span className="tw-text-sm tw-font-medium tw-text-gray-700">Active</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                  {offers.length === 0 && (
                    <div className="tw-text-center tw-py-8 tw-text-gray-400">
                      <span className="material-symbols-outlined tw-text-5xl tw-mb-2">sell</span>
                      <p className="tw-text-sm">No offers added yet. Click "Add" to create one.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* SEO Tab */}
        {/* SEO Tab - Commented for now */}
        {/* {activeTab === 'seo' && (
            <div className="admin-card">
            <h3>SEO Settings</h3>
            
            <div className="form-group">
              <label htmlFor="meta_title">Meta Title</label>
              <input
                type="text"
                id="meta_title"
                name="meta_title"
                value={formData.meta_title}
                onChange={handleChange}
                placeholder="SEO title for search engines"
                className="tw-w-full"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="meta_description">Meta Description</label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={4}
                placeholder="SEO description for search engines"
                className="tw-w-full"
              />
            </div>
          </div>
        )} */}
        
        {/* Submit Button */}
        <div className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-bg-white tw-border-t tw-p-4 tw-shadow-lg tw-z-10">
          <div className="tw-max-w-7xl tw-mx-auto tw-flex tw-justify-between tw-items-center">
                <button
                  type="button"
              className="admin-btn secondary"
              onClick={() => navigate(`${basePath}/products`)}
            >
              Cancel
            </button>
            <div className="tw-flex tw-gap-3">
              {!isNew && product && (
                <>
                  <button
                    type="button"
                    className={`admin-btn ${formData.is_active ? 'warning' : 'success'}`}
                  onClick={handleToggleActive}
                >
                  {formData.is_active ? 'Hide Product' : 'Show Product'}
                </button>
                <button
                  type="button"
                    className={`admin-btn ${formData.is_featured ? 'secondary' : 'info'}`}
                  onClick={handleToggleFeatured}
                >
                    {formData.is_featured ? 'Unmark Featured' : 'Mark Featured'}
                  </button>
                </>
              )}
              <button type="submit" className="admin-btn primary" disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-small"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">save</span>
                    {isNew ? 'Create Product' : 'Save Changes'}
                  </>
                )}
                </button>
              </div>
            </div>
          </div>
      </form>
      
      {/* Spacer for fixed footer */}
      <div className="tw-h-20"></div>
    </div>
  );
};

export default SellerProductDetail;

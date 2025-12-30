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
  quality: string;
  price: string | number;
  old_price: string | number | null;
  stock_quantity: number;
  is_in_stock: boolean;
  image: string;
  images: VariantImage[];
  specifications?: Specification[];
  measurement_specs?: Specification[];
  style_specs?: Specification[];
  features?: Specification[];
  user_guide?: Specification[];
  item_details?: Specification[];
  is_active: boolean;
  subcategories?: { id: number; name: string }[];
  subcategory_ids?: number[];
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
  feature?: string;
  item?: string; // For about_items
  sort_order: number;
  is_active?: boolean;
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
  estimated_delivery_days?: number;
  screen_offer?: (string | { title: string; description: string })[];
  style_description?: string;
  user_guide?: string;
  care_instructions?: string;
  what_in_box?: string;
  meta_title: string;
  meta_description: string;
  is_featured: boolean;
  is_active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: Specification[];
  features: Feature[];
  about_items: Feature[];
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
  const [activeDetailSection, setActiveDetailSection] = useState<'features' | 'about_items' | 'screen_offer' | 'style_description' | 'user_guide' | 'care_instructions' | 'what_in_box' | 'recommendations' | null>('features');
  
  // Form data
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    sku: string;
    short_description: string;
    long_description: string;
    category_id: string;
    material_id: string;
    brand: string;
    dimensions: string;
    weight: string;
    warranty: string;
    assembly_required: boolean;
    estimated_delivery_days: number;
    screen_offer: { title: string; description: string }[];
    style_description: string;
    user_guide: string;
    care_instructions: string;
    what_in_box: string;
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
    material_id: '',
    brand: 'Sixpine',
    dimensions: '',
    weight: '',
    warranty: '',
    assembly_required: false,
    estimated_delivery_days: 4,
    screen_offer: [],
    style_description: '',
    user_guide: '',
    care_instructions: '',
    what_in_box: '',
    meta_title: '',
    meta_description: '',
    is_featured: false,
    is_active: true,
  });
  
  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [lastSelectedColorId, setLastSelectedColorId] = useState<number | null>(null);
  const [categorySpecDefaults, setCategorySpecDefaults] = useState<any>(null);
  
  // Features
  const [features, setFeatures] = useState<Feature[]>([]);
  
  // About Items
  const [aboutItems, setAboutItems] = useState<Feature[]>([]);
  
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
          console.log('Loaded product data:', productData);
          console.log('Loaded variants raw:', productData.variants?.map((v: any) => ({ id: v.id, subcategories: v.subcategories, subcategory_ids: v.subcategory_ids })));
          setProduct(productData);
          
          // Populate form
          setFormData({
            title: productData.title || '',
            slug: productData.slug || '',
            sku: productData.sku || '',
            short_description: productData.short_description || '',
            long_description: productData.long_description || '',
            category_id: productData.category?.id?.toString() || '',
            material_id: productData.material?.id?.toString() || '',
            brand: productData.brand || 'Sixpine',
            dimensions: productData.dimensions || '',
            weight: productData.weight || '',
            warranty: productData.warranty || '',
            assembly_required: productData.assembly_required || false,
            estimated_delivery_days: productData.estimated_delivery_days || 4,
            screen_offer: Array.isArray(productData.screen_offer) 
              ? productData.screen_offer.map((offer: any) => 
                  typeof offer === 'string' 
                    ? { title: offer, description: '' }
                    : { title: offer.title || offer.text || '', description: offer.description || '' }
                )
              : [],
            style_description: productData.style_description || '',
            user_guide: productData.user_guide || '',
            care_instructions: productData.care_instructions || '',
            what_in_box: productData.what_in_box || '',
            meta_title: productData.meta_title || '',
            meta_description: productData.meta_description || '',
            is_featured: productData.is_featured || false,
            is_active: productData.is_active ?? true,
          });
          
          // Normalize variants: ensure color_id is set from color.id if needed
          const normalizedVariants = (productData.variants || []).map((v: any) => {
            // Extract color_id - it should now come from backend, but fallback to color.id if needed
            const colorId = v.color_id || (v.color?.id ? parseInt(v.color.id) : null) || 0;
            // Extract subcategory_ids from subcategories array OR from subcategory_ids field
            const subcategoryIds = v.subcategories?.map((sub: any) => sub.id) || v.subcategory_ids || [];
            console.log('Loading variant subcategories:', { variantId: v.id, subcategories: v.subcategories, subcategory_ids: v.subcategory_ids, normalized: subcategoryIds });
            return {
              ...v,
              color_id: colorId,
              subcategory_ids: subcategoryIds,
              measurement_specs: v.measurement_specs || [],
              style_specs: v.style_specs || [],
              features: v.features || [],
              user_guide: v.user_guide || [],
              item_details: v.item_details || []
            };
          });
          console.log('Normalized variants with subcategories:', normalizedVariants.map((v: ProductVariant) => ({ id: v.id, subcategory_ids: v.subcategory_ids })));
          setVariants(normalizedVariants);
          
          // Set last selected color from existing variants (use first variant's color if available)
          if (normalizedVariants.length > 0 && normalizedVariants[0].color_id && normalizedVariants[0].color_id !== 0) {
            setLastSelectedColorId(normalizedVariants[0].color_id);
          }
          // Specifications are now at variant level, not product level
          setFeatures(productData.features || []);
          // Normalize about_items - convert item field to feature field for consistency with Feature interface
          const normalizedAboutItems = (productData.about_items || []).map((item: any) => ({
            id: item.id,
            item: item.item || '',
            feature: item.item || '', // For backward compatibility with Feature interface
            sort_order: item.sort_order || 0,
            is_active: item.is_active !== false
          }));
          setAboutItems(normalizedAboutItems);
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
      // Fetch all subcategories (both active and inactive) for the variant form
      // Don't pass is_active parameter to get all subcategories
      const response = await api.getSubcategories({ category: categoryId });
      setSubcategories(response.data.results || response.data || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };
  
  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(parseInt(formData.category_id));
      // Fetch and apply specification defaults for the category
      applyCategorySpecificationDefaults(parseInt(formData.category_id));
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);
  
  const applyCategorySpecificationDefaults = async (categoryId: number) => {
    try {
      const response = await api.getCategorySpecificationDefaults(categoryId);
      const defaults = response.data;
      // Store defaults for use when adding new variants
      setCategorySpecDefaults(defaults);
      
      // Only merge defaults with existing variant specifications (only add missing fields)
      // Don't auto-create variants
      if (variants.length > 0) {
        const updatedVariants = variants.map(variant => {
          const mergedVariant = { ...variant };
          
          // For each section, add defaults that don't already exist
          Object.keys(defaults).forEach((section: string) => {
            const sectionKey = section as keyof typeof defaults;
            const existingSpecs = (variant[sectionKey as keyof typeof variant] as Specification[]) || [];
            const existingFieldNames = existingSpecs.map((s: Specification) => s.name);
            
            // Add defaults that don't exist
            (defaults[sectionKey] || []).forEach((defaultField: any) => {
              if (!existingFieldNames.includes(defaultField.field_name)) {
                existingSpecs.push({
                  id: 0,
                  name: defaultField.field_name,
                  value: '',
                  sort_order: defaultField.sort_order || existingSpecs.length
                });
              }
            });
            
            mergedVariant[sectionKey as keyof typeof mergedVariant] = existingSpecs as any;
          });
          
          return mergedVariant;
        });
        
        setVariants(updatedVariants);
      }
    } catch (err) {
      console.error('Error fetching category specification defaults:', err);
      // Silently fail - defaults are optional
      setCategorySpecDefaults(null);
    }
  };
  
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
    
    // Pre-fill with category specification defaults if available
    const defaults = categorySpecDefaults || {
      specifications: [],
      measurement_specs: [],
      style_specs: [],
      features: [],
      user_guide: [],
      item_details: []
    };
    
    const newVariant: ProductVariant = {
      color_id: defaultColorId,
      size: '',
      pattern: '',
      quality: '',
      price: '',
      old_price: null,
      stock_quantity: 0,
      is_in_stock: true,
      image: '',
      images: [],
      specifications: (defaults.specifications || []).map((d: any) => ({
        id: 0,
        name: d.field_name,
        value: '',
        sort_order: d.sort_order || 0
      })),
      subcategory_ids: [],
      measurement_specs: (defaults.measurement_specs || []).map((d: any) => ({
        id: 0,
        name: d.field_name,
        value: '',
        sort_order: d.sort_order || 0
      })),
      style_specs: (defaults.style_specs || []).map((d: any) => ({
        id: 0,
        name: d.field_name,
        value: '',
        sort_order: d.sort_order || 0
      })),
      features: (defaults.features || []).map((d: any) => ({
        id: 0,
        name: d.field_name,
        value: '',
        sort_order: d.sort_order || 0
      })),
      user_guide: (defaults.user_guide || []).map((d: any) => ({
        id: 0,
        name: d.field_name,
        value: '',
        sort_order: d.sort_order || 0
      })),
      item_details: (defaults.item_details || []).map((d: any) => ({
        id: 0,
        name: d.field_name,
        value: '',
        sort_order: d.sort_order || 0
      })),
      is_active: true
    };
    
    setVariants([...variants, newVariant]);
  };
  
  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };
  
  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
      updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
    
    // Debug logging for subcategory changes
    if (field === 'subcategory_ids') {
      console.log('handleVariantChange - subcategory_ids updated:', { 
        variantIndex: index, 
        newValue: value, 
        variantAfterUpdate: updated[index] 
      });
    }
    
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
  
  // Variant Specification management
  const handleAddVariantSpecification = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      specifications: [...(variant.specifications || []), {
      name: '',
      value: '',
        sort_order: (variant.specifications || []).length,
      is_active: true
      }]
    };
    setVariants(updated);
  };
  
  const handleRemoveVariantSpecification = (variantIndex: number, specIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      specifications: (variant.specifications || []).filter((_, i) => i !== specIndex)
    };
    setVariants(updated);
  };
  
  const handleVariantSpecificationChange = (variantIndex: number, specIndex: number, field: string, value: any) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const specs = [...(variant.specifications || [])];
    specs[specIndex] = { ...specs[specIndex], [field]: value };
    updated[variantIndex] = {
      ...variant,
      specifications: specs
    };
    setVariants(updated);
  };
  
  // Variant Measurement Specs management
  const handleAddVariantMeasurementSpec = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      measurement_specs: [...(variant.measurement_specs || []), {
        name: '',
        value: '',
        sort_order: (variant.measurement_specs || []).length,
        is_active: true
      }]
    };
    setVariants(updated);
  };
  
  const handleRemoveVariantMeasurementSpec = (variantIndex: number, specIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      measurement_specs: (variant.measurement_specs || []).filter((_, i) => i !== specIndex)
    };
    setVariants(updated);
  };
  
  const handleVariantMeasurementSpecChange = (variantIndex: number, specIndex: number, field: string, value: any) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const specs = [...(variant.measurement_specs || [])];
    specs[specIndex] = { ...specs[specIndex], [field]: value };
    updated[variantIndex] = {
      ...variant,
      measurement_specs: specs
    };
    setVariants(updated);
  };
  
  // Variant Style Specs management
  const handleAddVariantStyleSpec = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      style_specs: [...(variant.style_specs || []), {
        name: '',
        value: '',
        sort_order: (variant.style_specs || []).length,
        is_active: true
      }]
    };
    setVariants(updated);
  };
  
  const handleRemoveVariantStyleSpec = (variantIndex: number, specIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      style_specs: (variant.style_specs || []).filter((_, i) => i !== specIndex)
    };
    setVariants(updated);
  };
  
  const handleVariantStyleSpecChange = (variantIndex: number, specIndex: number, field: string, value: any) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const specs = [...(variant.style_specs || [])];
    specs[specIndex] = { ...specs[specIndex], [field]: value };
    updated[variantIndex] = {
      ...variant,
      style_specs: specs
    };
    setVariants(updated);
  };
  
  // Variant Features management
  const handleAddVariantFeature = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      features: [...(variant.features || []), {
        name: '',
        value: '',
        sort_order: (variant.features || []).length,
        is_active: true
      }]
    };
    setVariants(updated);
  };
  
  const handleRemoveVariantFeature = (variantIndex: number, specIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      features: (variant.features || []).filter((_, i) => i !== specIndex)
    };
    setVariants(updated);
  };
  
  const handleVariantFeatureChange = (variantIndex: number, specIndex: number, field: string, value: any) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const specs = [...(variant.features || [])];
    specs[specIndex] = { ...specs[specIndex], [field]: value };
    updated[variantIndex] = {
      ...variant,
      features: specs
    };
    setVariants(updated);
  };
  
  // Variant User Guide management
  const handleAddVariantUserGuide = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      user_guide: [...(variant.user_guide || []), {
        name: '',
        value: '',
        sort_order: (variant.user_guide || []).length,
        is_active: true
      }]
    };
    setVariants(updated);
  };
  
  const handleRemoveVariantUserGuide = (variantIndex: number, specIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      user_guide: (variant.user_guide || []).filter((_, i) => i !== specIndex)
    };
    setVariants(updated);
  };
  
  const handleVariantUserGuideChange = (variantIndex: number, specIndex: number, field: string, value: any) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const specs = [...(variant.user_guide || [])];
    specs[specIndex] = { ...specs[specIndex], [field]: value };
    updated[variantIndex] = {
      ...variant,
      user_guide: specs
    };
    setVariants(updated);
  };
  
  // Variant Item Details management
  const handleAddVariantItemDetail = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      item_details: [...(variant.item_details || []), {
        name: '',
        value: '',
        sort_order: (variant.item_details || []).length,
        is_active: true
      }]
    };
    setVariants(updated);
  };
  
  const handleRemoveVariantItemDetail = (variantIndex: number, specIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    updated[variantIndex] = {
      ...variant,
      item_details: (variant.item_details || []).filter((_, i) => i !== specIndex)
    };
    setVariants(updated);
  };
  
  const handleVariantItemDetailChange = (variantIndex: number, specIndex: number, field: string, value: any) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const specs = [...(variant.item_details || [])];
    specs[specIndex] = { ...specs[specIndex], [field]: value };
    updated[variantIndex] = {
      ...variant,
      item_details: specs
    };
    setVariants(updated);
  };
  
  // About Items management
  const handleAddAboutItem = () => {
    setAboutItems([...aboutItems, {
      item: '',
      feature: '', // For backward compatibility
      sort_order: aboutItems.length,
      is_active: true
    }]);
  };
  
  const handleRemoveAboutItem = (index: number) => {
    setAboutItems(aboutItems.filter((_, i) => i !== index));
  };
  
  const handleAboutItemChange = (index: number, field: string, value: any) => {
    const updated = [...aboutItems];
    updated[index] = { ...updated[index], [field]: value };
    setAboutItems(updated);
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
        material_id: formData.material_id ? parseInt(formData.material_id) : null,
        brand: formData.brand,
        dimensions: formData.dimensions,
        weight: formData.weight,
        warranty: formData.warranty,
        assembly_required: formData.assembly_required,
        estimated_delivery_days: formData.estimated_delivery_days,
        screen_offer: formData.screen_offer,
        style_description: formData.style_description,
        user_guide: formData.user_guide,
        care_instructions: formData.care_instructions,
        what_in_box: formData.what_in_box,
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
          console.log('Building variant payload:', { originalId: v.id, colorId, subcategory_ids: v.subcategory_ids });
          return {
            id: v.id,
            color_id: colorId,
            size: v.size || '',
            pattern: v.pattern || '',
            quality: v.quality || '',
            title: v.title || '',
          price: v.price ? parseFloat(v.price.toString()) : null,
          old_price: v.old_price ? parseFloat(v.old_price.toString()) : null,
            stock_quantity: parseInt(v.stock_quantity.toString()) || 0,
            is_in_stock: v.is_in_stock !== false,
            image: v.image || '',
            is_active: v.is_active !== false,
            subcategory_ids: v.subcategory_ids || [],  // Include subcategory_ids
            images: (v.images || []).map(img => ({
              image: img.image,
              alt_text: img.alt_text,
              sort_order: img.sort_order,
              is_active: img.is_active !== false
            })),
            specifications: (v.specifications || []).map((s: Specification) => ({
              name: s.name,
              value: s.value,
              sort_order: s.sort_order,
              is_active: s.is_active !== false
            })),
            measurement_specs: v.measurement_specs || {},
            style_specs: v.style_specs || {},
            features: v.features || {},
            user_guide: v.user_guide || {},
            item_details: v.item_details || {}
          };
        }),
        features: features.map(f => ({
          feature: f.feature,
          sort_order: f.sort_order,
          is_active: f.is_active !== false
        })),
        about_items: aboutItems.map(a => ({
          item: a.item || a.feature, // Support both item and feature field for backward compatibility
          sort_order: a.sort_order,
          is_active: a.is_active !== false
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
      console.log('Variant subcategories being saved:', payload.variants.map((v: any) => ({ 
        variantId: v.id, 
        color_id: v.color_id, 
        subcategory_ids: v.subcategory_ids,
        subcategory_ids_type: typeof v.subcategory_ids,
        subcategory_ids_isArray: Array.isArray(v.subcategory_ids)
      })));
      
      let response;
      if (isNew) {
        response = await api.createProduct(payload);
        showSuccess('Product created successfully!');
        navigate(`${basePath}/products/${response.data.id}`);
      } else {
        response = await api.updateProduct(parseInt(id!), payload);
        console.log('Product update response:', response.data);
        console.log('Updated variants with subcategories:', response.data.variants?.map((v: any) => ({ id: v.id, subcategories: v.subcategories, subcategory_ids: v.subcategory_ids })));
        setProduct(response.data);
        
        // CRITICAL: Update variants state with the response data to get new IDs and subcategories
        const updatedVariants = (response.data.variants || []).map((v: any) => {
          const colorId = v.color_id || (v.color?.id ? parseInt(v.color.id) : null) || 0;
          const subcategoryIds = v.subcategories?.map((sub: any) => sub.id) || v.subcategory_ids || [];
          console.log('Updating variant state after save:', { id: v.id, subcategoryIds });
          return {
            ...v,
            color_id: colorId,
            subcategory_ids: subcategoryIds,
            measurement_specs: v.measurement_specs || {},
            style_specs: v.style_specs || {},
            features: v.features || {},
            user_guide: v.user_guide || {},
            item_details: v.item_details || {}
          };
        });
        setVariants(updatedVariants);
        
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
                <div className="form-group">
                <label htmlFor="estimated_delivery_days">Estimated Delivery Days</label>
                  <input
                    type="number"
                  id="estimated_delivery_days"
                  name="estimated_delivery_days"
                  value={formData.estimated_delivery_days}
                    onChange={handleChange}
                  placeholder="e.g., 4"
                  min="1"
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
                      <label>Quality</label>
                            <input
                              type="text"
                        value={variant.quality || ''}
                        onChange={(e) => handleVariantChange(variantIndex, 'quality', e.target.value)}
                        placeholder="e.g., Premium, Standard, Luxury"
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
                        
                        {/* Subcategories for Variant */}
                        <div className="admin-form-group tw-col-span-full">
                          <label>Subcategories (Select applicable subcategories for this variant)</label>
                          <div 
                            className="tw-border tw-border-gray-300 tw-rounded tw-p-3 tw-bg-white tw-flex tw-flex-wrap tw-gap-3"
                          >
                            {subcategories.length > 0 ? (
                              subcategories.map(sub => {
                                const isChecked = Array.isArray(variant.subcategory_ids) && variant.subcategory_ids.includes(sub.id);
                                return (
                                <div key={sub.id} className="tw-flex tw-items-center tw-min-w-0">
                                  <input
                                    type="checkbox"
                                    id={`variant_${variantIndex}_subcategory_${sub.id}`}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const currentIds = Array.isArray(variant.subcategory_ids) ? variant.subcategory_ids : [];
                                      let newIds: number[];
                                      if (e.target.checked) {
                                        newIds = [...currentIds, sub.id];
                                      } else {
                                        newIds = currentIds.filter((id: number) => id !== sub.id);
                                      }
                                      console.log('Subcategory checkbox changed:', { variantIndex, subcategoryId: sub.id, checked: e.target.checked, newIds });
                                      handleVariantChange(variantIndex, 'subcategory_ids', newIds);
                                    }}
                                    className="tw-mr-2 tw-cursor-pointer tw-flex-shrink-0"
                                  />
                                  <label 
                                    htmlFor={`variant_${variantIndex}_subcategory_${sub.id}`}
                                    className="tw-cursor-pointer tw-select-none tw-whitespace-nowrap"
                                  >
                                    {sub.name}
                                  </label>
                                </div>
                              );})
                            ) : (
                              <div className="tw-text-gray-500 tw-text-sm tw-py-2 tw-w-full">
                                {formData.category_id ? 'No subcategories available' : 'Please select a category first'}
                              </div>
                            )}
                          </div>
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
                
                {/* Variant Specifications */}
                <div className="tw-pt-6 tw-border-t tw-border-gray-200">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                      <span className="material-symbols-outlined tw-text-base">list</span>
                      Specifications ({variant.specifications?.length || 0})
                    </h5>
                  <button 
                    type="button" 
                      className="admin-modern-btn secondary"
                      onClick={() => handleAddVariantSpecification(variantIndex)}
                  >
                    <span className="material-symbols-outlined">add</span>
                      Add Specification
                  </button>
                  </div>
                  <div className="tw-space-y-3">
                    {variant.specifications?.map((spec, specIndex) => (
                      <div key={specIndex} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                      <div>
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                        <input
                          type="text"
                          value={spec.name}
                              onChange={(e) => handleVariantSpecificationChange(variantIndex, specIndex, 'name', e.target.value)}
                              placeholder="e.g., Brand, Depth, Style"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div>
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                        <input
                          type="text"
                          value={spec.value}
                              onChange={(e) => handleVariantSpecificationChange(variantIndex, specIndex, 'value', e.target.value)}
                              placeholder="e.g., Atomberg, 12 inch, Modern"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                        </div>
                        <div className="tw-w-24">
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                        <input
                          type="number"
                          value={spec.sort_order}
                            onChange={(e) => handleVariantSpecificationChange(variantIndex, specIndex, 'sort_order', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div className="tw-flex tw-items-end">
                        <button
                          type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantSpecification(variantIndex, specIndex)}
                        >
                          <span className="material-symbols-outlined tw-text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                    {(!variant.specifications || variant.specifications.length === 0) && (
                      <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                        <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">list</span>
                        <p className="tw-mt-2">No specifications added for this variant</p>
                    </div>
                  )}
                </div>
                
                {/* Variant Measurement Specifications */}
                <div className="tw-pt-6 tw-border-t tw-border-gray-200">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                      <span className="material-symbols-outlined tw-text-base">straighten</span>
                      Measurement Specifications ({variant.measurement_specs?.length || 0})
                    </h5>
                    <button 
                      type="button" 
                      className="admin-modern-btn secondary"
                      onClick={() => handleAddVariantMeasurementSpec(variantIndex)}
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Measurement
                    </button>
                  </div>
                  <div className="tw-space-y-3">
                    {variant.measurement_specs?.map((spec, specIndex) => (
                      <div key={`variant-${variantIndex}-measurement-${specIndex}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantMeasurementSpecChange(variantIndex, specIndex, 'name', e.target.value)}
                              placeholder="e.g., Dimensions, Weight"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantMeasurementSpecChange(variantIndex, specIndex, 'value', e.target.value)}
                              placeholder="e.g., 64 x 29 x 36 inch, 45 kg"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-w-24">
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                          <input
                            type="number"
                            value={spec.sort_order}
                            onChange={(e) => handleVariantMeasurementSpecChange(variantIndex, specIndex, 'sort_order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                          />
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantMeasurementSpec(variantIndex, specIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!variant.measurement_specs || variant.measurement_specs.length === 0) && (
                      <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                        <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">straighten</span>
                        <p className="tw-mt-2">No measurement specifications added for this variant</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Variant Style Specifications */}
                <div className="tw-pt-6 tw-border-t tw-border-gray-200">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                      <span className="material-symbols-outlined tw-text-base">palette</span>
                      Style Specifications ({variant.style_specs?.length || 0})
                    </h5>
                    <button 
                      type="button" 
                      className="admin-modern-btn secondary"
                      onClick={() => handleAddVariantStyleSpec(variantIndex)}
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Style
                    </button>
                  </div>
                  <div className="tw-space-y-3">
                    {variant.style_specs?.map((spec, specIndex) => (
                      <div key={`variant-${variantIndex}-style-${specIndex}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantStyleSpecChange(variantIndex, specIndex, 'name', e.target.value)}
                              placeholder="e.g., Colour, Style, Shape"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantStyleSpecChange(variantIndex, specIndex, 'value', e.target.value)}
                              placeholder="e.g., Grey & Beige, Modern, Rectangular"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-w-24">
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                          <input
                            type="number"
                            value={spec.sort_order}
                            onChange={(e) => handleVariantStyleSpecChange(variantIndex, specIndex, 'sort_order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                          />
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantStyleSpec(variantIndex, specIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!variant.style_specs || variant.style_specs.length === 0) && (
                      <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                        <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">palette</span>
                        <p className="tw-mt-2">No style specifications added for this variant</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Variant Features */}
                <div className="tw-pt-6 tw-border-t tw-border-gray-200">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                      <span className="material-symbols-outlined tw-text-base">star</span>
                      Features ({variant.features?.length || 0})
                    </h5>
                    <button 
                      type="button" 
                      className="admin-modern-btn secondary"
                      onClick={() => handleAddVariantFeature(variantIndex)}
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Feature
                    </button>
                  </div>
                  <div className="tw-space-y-3">
                    {variant.features?.map((spec, specIndex) => (
                      <div key={`variant-${variantIndex}-feature-${specIndex}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantFeatureChange(variantIndex, specIndex, 'name', e.target.value)}
                              placeholder="e.g., Weight Capacity Maximum, Seating Capacity"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantFeatureChange(variantIndex, specIndex, 'value', e.target.value)}
                              placeholder="e.g., 450 Kilograms, 3.0"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-w-24">
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                          <input
                            type="number"
                            value={spec.sort_order}
                            onChange={(e) => handleVariantFeatureChange(variantIndex, specIndex, 'sort_order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                          />
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantFeature(variantIndex, specIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!variant.features || variant.features.length === 0) && (
                      <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                        <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">star</span>
                        <p className="tw-mt-2">No features added for this variant</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Variant User Guide */}
                <div className="tw-pt-6 tw-border-t tw-border-gray-200">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                      <span className="material-symbols-outlined tw-text-base">menu_book</span>
                      User Guide ({variant.user_guide?.length || 0})
                    </h5>
                    <button 
                      type="button" 
                      className="admin-modern-btn secondary"
                      onClick={() => handleAddVariantUserGuide(variantIndex)}
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add User Guide
                    </button>
                  </div>
                  <div className="tw-space-y-3">
                    {variant.user_guide?.map((spec, specIndex) => (
                      <div key={`variant-${variantIndex}-userguide-${specIndex}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantUserGuideChange(variantIndex, specIndex, 'name', e.target.value)}
                              placeholder="e.g., Assembly, Care Instructions"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantUserGuideChange(variantIndex, specIndex, 'value', e.target.value)}
                              placeholder="e.g., Required, Wipe with dry cloth"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-w-24">
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                          <input
                            type="number"
                            value={spec.sort_order}
                            onChange={(e) => handleVariantUserGuideChange(variantIndex, specIndex, 'sort_order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                          />
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantUserGuide(variantIndex, specIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!variant.user_guide || variant.user_guide.length === 0) && (
                      <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                        <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">menu_book</span>
                        <p className="tw-mt-2">No user guide added for this variant</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Variant Item Details */}
                <div className="tw-pt-6 tw-border-t tw-border-gray-200">
                  <div className="tw-flex tw-justify-between tw-items-center tw-mb-4">
                    <h5 className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-flex tw-items-center tw-gap-2">
                      <span className="material-symbols-outlined tw-text-base">inventory_2</span>
                      Item Details ({variant.item_details?.length || 0})
                    </h5>
                    <button 
                      type="button" 
                      className="admin-modern-btn secondary"
                      onClick={() => handleAddVariantItemDetail(variantIndex)}
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Item Detail
                    </button>
                  </div>
                  <div className="tw-space-y-3">
                    {variant.item_details?.map((spec, detailIndex) => (
                      <div key={`variant-${variantIndex}-itemdetail-${detailIndex}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantItemDetailChange(variantIndex, detailIndex, 'name', e.target.value)}
                              placeholder="e.g., Assembly, Warranty, Weight"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantItemDetailChange(variantIndex, detailIndex, 'value', e.target.value)}
                              placeholder="e.g., Required, 1 Year, 45 kg"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-w-24">
                          <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                          <input
                            type="number"
                            value={spec.sort_order}
                            onChange={(e) => handleVariantItemDetailChange(variantIndex, detailIndex, 'sort_order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                          />
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantItemDetail(variantIndex, detailIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!variant.item_details || variant.item_details.length === 0) && (
                      <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                        <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">inventory_2</span>
                        <p className="tw-mt-2">No item details added for this variant</p>
                      </div>
                    )}
                  </div>
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
            
            {/* About This Item Section */}
            <div className="tw-border-2 tw-border-green-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-green-50 tw-via-green-100 tw-to-green-50">
                <button
                  type="button"
                  className="btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform"
                  onClick={() => setActiveDetailSection(activeDetailSection === 'about_items' ? null : 'about_items')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-green-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'about_items' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">About This Item</h3>
                </button>
                <button 
                  type="button" 
                  className="tw-flex tw-items-center tw-gap-2 tw-px-5 tw-py-2.5 tw-bg-green-600 tw-text-white tw-rounded-lg hover:tw-bg-green-700 hover:tw-shadow-lg tw-transition-all tw-duration-200 tw-font-semibold tw-text-sm hover:tw-scale-105 active:tw-scale-95"
                  onClick={handleAddAboutItem}
                >
                  <span className="material-symbols-outlined tw-text-lg tw-font-bold">add</span>
                  Add Item
                </button>
              </div>
              {activeDetailSection === 'about_items' && (
                <div className="tw-p-5 tw-bg-white tw-space-y-3">
                  {aboutItems.map((item, index) => (
                    <div key={index} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3 hover:tw-shadow-md tw-transition-shadow">
                      <div className="tw-flex-1">
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Item Description</label>
                        <textarea
                          value={item.item || item.feature || ''}
                          onChange={(e) => handleAboutItemChange(index, 'item', e.target.value)}
                          placeholder="Describe the item point..."
                          rows={2}
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent tw-text-sm tw-resize-none"
                        />
                      </div>
                      <div className="tw-w-24">
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Order</label>
                        <input
                          type="number"
                          value={item.sort_order}
                          onChange={(e) => handleAboutItemChange(index, 'sort_order', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-green-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div className="tw-flex tw-items-end">
                        <button
                          type="button"
                          className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                          onClick={() => handleRemoveAboutItem(index)}
                        >
                          <span className="material-symbols-outlined tw-text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {aboutItems.length === 0 && (
                    <div className="tw-text-center tw-py-8 tw-text-gray-400">
                      <span className="material-symbols-outlined tw-text-5xl tw-mb-2">info</span>
                      <p className="tw-text-sm">No items added yet. Click "Add Item" to create one.</p>
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
                      screen_offer: [...prev.screen_offer, { title: '', description: '' }]
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
                    <div key={index} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-space-y-3 hover:tw-shadow-md tw-transition-shadow">
                      <div className="tw-flex-1">
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Offer Title</label>
                        <input
                          type="text"
                          value={offer.title}
                          onChange={(e) => {
                            const updated = [...formData.screen_offer];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setFormData(prev => ({ ...prev, screen_offer: updated }));
                          }}
                          placeholder="e.g., Free Delivery, 10 Days Replacement..."
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div className="tw-flex-1">
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Offer Description</label>
                        <textarea
                          value={offer.description}
                          onChange={(e) => {
                            const updated = [...formData.screen_offer];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setFormData(prev => ({ ...prev, screen_offer: updated }));
                          }}
                          placeholder="Enter detailed description that will show in the info modal..."
                          rows={3}
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-text-sm tw-resize-none"
                        />
                      </div>
                      <div className="tw-flex tw-justify-end">
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

            {/* What in Box Section */}
            <div className="tw-border-2 tw-border-purple-200 tw-rounded-xl tw-overflow-hidden tw-shadow-md hover:tw-shadow-lg tw-transition-all">
              <div className="tw-w-full tw-flex tw-justify-between tw-items-center tw-px-6 tw-py-4 tw-bg-gradient-to-r tw-from-purple-50 tw-via-purple-100 tw-to-purple-50">
                <button
                  type="button"
                  className="btndetailsbox tw-flex tw-items-center tw-gap-3 tw-flex-1 hover:tw-scale-[1.01] tw-transition-transform"
                  onClick={() => setActiveDetailSection(activeDetailSection === 'what_in_box' ? null : 'what_in_box')}
                >
                  <span 
                    className="material-symbols-outlined tw-transition-all tw-duration-300 tw-text-purple-600 tw-font-bold tw-text-2xl" 
                    style={{ transform: activeDetailSection === 'what_in_box' ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    expand_more
                  </span>
                  <h3 className="tw-font-bold tw-text-xl tw-text-gray-800 tw-tracking-tight">What is in Box</h3>
                </button>
              </div>
              {activeDetailSection === 'what_in_box' && (
                <div className="tw-p-5 tw-bg-white">
                  <label htmlFor="what_in_box" className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2">
                    What is included in the box
                  </label>
                  <textarea
                    id="what_in_box"
                    name="what_in_box"
                    value={formData.what_in_box}
                    onChange={(e) => setFormData({ ...formData, what_in_box: e.target.value })}
                    rows={8}
                    placeholder="Enter what is included in the box (e.g., Product name, Assembly parts, User manual, Warranty card, etc.)"
                    className="tw-w-full tw-px-4 tw-py-3 tw-border tw-border-gray-300 tw-rounded-lg focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-purple-500 focus:tw-border-transparent tw-text-sm tw-resize-y"
                  />
                  <p className="tw-text-xs tw-text-gray-500 tw-mt-2">
                    This description will appear in the "What is in box" section on the product detail page.
                  </p>
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
                      buy_with: 'Buy it with',
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

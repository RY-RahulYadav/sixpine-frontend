import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAPI } from '../../../hooks/useAdminAPI';
import adminAPI from '../../../services/adminApi';
import { showToast } from '../utils/adminUtils';
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
  sku?: string;
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
  video_url?: string;
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
  main_image: string;
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
  offers: Offer[];
  recommendations: Recommendation[];
  created_at: string;
  updated_at: string;
}

const AdminProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const api = useAdminAPI();
  const { showConfirmation } = useNotification();
  const isSellerPanel = location.pathname.startsWith('/seller');
  const basePath = isSellerPanel ? '/seller' : '/admin';
  const isNew = id === 'new' || !id;
  // Check if coming from Sixpine Products page
  const isFromSixpineProducts = location.state?.fromSixpine || 
                                 document.referrer.includes('/sixpine-products') ||
                                 (isNew && location.pathname.includes('sixpine'));
  const [isSixpineProduct, setIsSixpineProduct] = useState<boolean>(isFromSixpineProducts);
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [categorySpecTemplates, setCategorySpecTemplates] = useState<{ [section: string]: Array<{ field_name: string; sort_order: number }> }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importingExcel, setImportingExcel] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [importResult, setImportResult] = useState<{success: boolean, message: string, products_created?: number, variants_created?: number, errors?: string[]} | null>(null);
  const [updatingExcel, setUpdatingExcel] = useState<boolean>(false);
  const [updateProgress, setUpdateProgress] = useState<string>('');
  const [updateResult, setUpdateResult] = useState<{success: boolean, message: string, variants_created?: number, variants_updated?: number, errors?: string[]} | null>(null);
  // New sidebar navigation state
  type NavigationSection = 'basic' | 'variant' | 'variants' | 'variants-old' | 'variant-details' | 'variant-images' | 'variant-specs' | 'details';
  const [activeSection, setActiveSection] = useState<NavigationSection>('basic');
  const [activeVariantIndex, setActiveVariantIndex] = useState<number | null>(null);
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set());
  
  // Initialize: if editing and has variants, expand first variant
  useEffect(() => {
    if (!isNew && product && product.variants && product.variants.length > 0 && expandedVariants.size === 0) {
      // Don't auto-expand on load - let user choose
    }
  }, [isNew, product]);
  const [activeDetailSection, setActiveDetailSection] = useState<'features' | 'about_items' | 'screen_offer' | 'style_description' | 'user_guide' | 'care_instructions' | 'what_in_box' | 'recommendations' | null>('features');
  
  // Helper to toggle variant expansion
  const toggleVariantExpansion = (index: number) => {
    setExpandedVariants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  // Helper to navigate to variant section
  const navigateToVariantSection = (variantIndex: number, section: 'variant-details' | 'variant-images' | 'variant-specs') => {
    setActiveVariantIndex(variantIndex);
    setActiveSection(section);
    // Auto-expand the variant
    if (!expandedVariants.has(variantIndex)) {
      setExpandedVariants(prev => new Set(prev).add(variantIndex));
    }
  };
  
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
  const [originalVariants, setOriginalVariants] = useState<ProductVariant[]>([]);
  const [originalProduct, setOriginalProduct] = useState<any>(null);
  const [lastSelectedColorId, setLastSelectedColorId] = useState<number | null>(null);
  const [categorySpecDefaults, setCategorySpecDefaults] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  
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
        
        // Helper function to fetch all colors with pagination
        const fetchAllColors = async () => {
          let allColors: any[] = [];
          let hasNext = true;
          let page = 1;
          
          while (hasNext) {
            const response = await api.getColors({ page });
            const data = response.data;
            
            if (data.results && Array.isArray(data.results)) {
              allColors = [...allColors, ...data.results];
            } else if (Array.isArray(data)) {
              allColors = [...allColors, ...data];
              hasNext = false;
              break;
            }
            
            hasNext = !!data.next;
            if (hasNext) {
              page++;
            }
          }
          
          return { data: { results: allColors } };
        };
        
        // Fetch dropdown data
        const [categoriesRes, colorsRes, materialsRes, productsRes] = await Promise.all([
          api.getCategories(),
          fetchAllColors(),
          api.getMaterials(),
          api.getProducts({ page_size: 1000 }) // Get all products for recommendations
        ]);
        
        setCategories(categoriesRes.data.results || categoriesRes.data || []);
        setColors(colorsRes.data.results || colorsRes.data || []);
        setMaterials(materialsRes.data.results || materialsRes.data || []);
        setAllProducts(productsRes.data.results || productsRes.data || []);
        
        // If coming from Sixpine Products, ensure brand is Sixpine
        if (isFromSixpineProducts && isNew) {
          setFormData(prev => ({ ...prev, brand: 'Sixpine' }));
          setIsSixpineProduct(true);
        }
        
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
            // Normalize images array - ensure it's always an array and sorted by sort_order
            const normalizedImages = (v.images || [])
              .map((img: any) => ({
                id: img.id,
                image: img.image || '',
                alt_text: img.alt_text || '',
                sort_order: img.sort_order || 0,
                is_active: img.is_active !== false
              }))
              .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
            console.log('Loading variant images:', { variantId: v.id, imageCount: normalizedImages.length, images: normalizedImages });
            return {
              ...v,
              color_id: colorId,
              subcategory_ids: subcategoryIds,
              images: normalizedImages,
              specifications: (v.specifications || []).map((s: any) => ({
                id: s.id,
                name: s.name || '',
                value: s.value || '',
                sort_order: s.sort_order || 0,
                is_active: s.is_active !== false
              })),
              measurement_specs: (v.measurement_specs || []).map((s: any) => ({
                id: s.id,
                name: s.name || '',
                value: s.value || '',
                sort_order: s.sort_order || 0,
                is_active: s.is_active !== false
              })),
              style_specs: (v.style_specs || []).map((s: any) => ({
                id: s.id,
                name: s.name || '',
                value: s.value || '',
                sort_order: s.sort_order || 0,
                is_active: s.is_active !== false
              })),
              features: v.features || [],
              user_guide: v.user_guide || [],
              item_details: v.item_details || []
            };
          });
          console.log('Normalized variants with subcategories:', normalizedVariants.map((v: ProductVariant) => ({ id: v.id, subcategory_ids: v.subcategory_ids })));
          setVariants(normalizedVariants);
          // Store original variants for change tracking
          setOriginalVariants(JSON.parse(JSON.stringify(normalizedVariants)));
          setOriginalProduct(JSON.parse(JSON.stringify(productData)));
          
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
            // Fetch templates to sort specifications
            fetchCategorySpecTemplates(productData.category.id);
          }
          
          // Check if product is a Sixpine product
          if (productData.brand === 'Sixpine' || !productData.vendor) {
            setIsSixpineProduct(true);
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
  
  // Re-sort specifications when templates are loaded or updated
  useEffect(() => {
    if (variants.length > 0 && Object.keys(categorySpecTemplates).length > 0) {
      setVariants(prevVariants => prevVariants.map(variant => ({
        ...variant,
        specifications: sortSpecsByTemplate(variant.specifications || [], 'specifications'),
        measurement_specs: sortSpecsByTemplate(variant.measurement_specs || [], 'measurement_specs'),
        style_specs: sortSpecsByTemplate(variant.style_specs || [], 'style_specs'),
        features: sortSpecsByTemplate(variant.features || [], 'features'),
        user_guide: sortSpecsByTemplate(variant.user_guide || [], 'user_guide'),
        item_details: sortSpecsByTemplate(variant.item_details || [], 'item_details')
      })));
    }
  }, [categorySpecTemplates]);
  
  // Helper function to sort specifications according to template order
  const sortSpecsByTemplate = (specs: Specification[], section: 'specifications' | 'measurement_specs' | 'style_specs' | 'features' | 'user_guide' | 'item_details', templates?: { [section: string]: Array<{ field_name: string; sort_order: number }> }): Specification[] => {
    if (!specs || specs.length === 0) return specs;
    
    const templatesToUse = templates || categorySpecTemplates;
    const templateSpecs = templatesToUse[section] || [];
    if (templateSpecs.length === 0) {
      // No template, just sort by sort_order
      return [...specs].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }
    
    const templateFieldNames = new Set(templateSpecs.map(t => t.field_name.toLowerCase()));
    
    return [...specs].sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aInTemplate = templateFieldNames.has(aName);
      const bInTemplate = templateFieldNames.has(bName);
      
      // Template items come first
      if (aInTemplate && !bInTemplate) return -1;
      if (!aInTemplate && bInTemplate) return 1;
      
      // Both in template: sort by template order
      if (aInTemplate && bInTemplate) {
        const aTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === aName);
        const bTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === bName);
        if (aTemplate && bTemplate) {
          return aTemplate.sort_order - bTemplate.sort_order;
        }
      }
      
      // Both not in template: sort by sort_order
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
  };

  // Fetch category specification templates
  const fetchCategorySpecTemplates = async (categoryId: number) => {
    try {
      // Fetch templates for all sections (specifications and measurement_specs)
      const response = await adminAPI.getCategorySpecificationTemplates({ 
        category: categoryId,
        page_size: 1000
      });
      
      let templates: any[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          templates = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          templates = response.data.results;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          templates = response.data.data;
        }
      }
      
      // Group by section and store - handle all sections
      const templatesBySection: { [section: string]: Array<{ field_name: string; sort_order: number }> } = {
        specifications: [],
        measurement_specs: [],
        style_specs: [],
        features: [],
        user_guide: [],
        item_details: []
      };
      
      templates.forEach((template: any) => {
        const section = template.section;
        if (templatesBySection.hasOwnProperty(section)) {
          if (!templatesBySection[section]) {
            templatesBySection[section] = [];
          }
          templatesBySection[section].push({
            field_name: template.field_name,
            sort_order: template.sort_order
          });
        }
      });
      
      // Sort by sort_order for each section
      Object.keys(templatesBySection).forEach(section => {
        templatesBySection[section].sort((a, b) => a.sort_order - b.sort_order);
      });
      
      setCategorySpecTemplates(templatesBySection);
      
      // After templates are loaded, re-sort all existing variants' specifications for all sections
      // Also update sort_order for specs that match template names
      setVariants(prevVariants => {
        if (prevVariants.length === 0) return prevVariants;
        return prevVariants.map(variant => {
          // Update sort_order for style_specs based on template
          const updatedStyleSpecs = (variant.style_specs || []).map(spec => {
            const template = templatesBySection.style_specs?.find(
              t => t.field_name.toLowerCase() === (spec.name || '').toLowerCase()
            );
            if (template) {
              return { ...spec, sort_order: template.sort_order };
            }
            return spec;
          });
          
          // Update sort_order for specifications based on template
          const updatedSpecs = (variant.specifications || []).map(spec => {
            const template = templatesBySection.specifications?.find(
              t => t.field_name.toLowerCase() === (spec.name || '').toLowerCase()
            );
            if (template) {
              return { ...spec, sort_order: template.sort_order };
            }
            return spec;
          });
          
          // Update sort_order for measurement_specs based on template
          const updatedMeasurementSpecs = (variant.measurement_specs || []).map(spec => {
            const template = templatesBySection.measurement_specs?.find(
              t => t.field_name.toLowerCase() === (spec.name || '').toLowerCase()
            );
            if (template) {
              return { ...spec, sort_order: template.sort_order };
            }
            return spec;
          });
          
          return {
            ...variant,
            specifications: sortSpecsByTemplate(updatedSpecs, 'specifications', templatesBySection),
            measurement_specs: sortSpecsByTemplate(updatedMeasurementSpecs, 'measurement_specs', templatesBySection),
            style_specs: sortSpecsByTemplate(updatedStyleSpecs, 'style_specs', templatesBySection),
            features: sortSpecsByTemplate(variant.features || [], 'features', templatesBySection),
            user_guide: sortSpecsByTemplate(variant.user_guide || [], 'user_guide', templatesBySection),
            item_details: sortSpecsByTemplate(variant.item_details || [], 'item_details', templatesBySection)
          };
        });
      });
    } catch (err) {
      console.error('Error fetching category spec templates:', err);
      setCategorySpecTemplates({});
    }
  };
  
  const applyCategorySpecificationDefaults = async (categoryId: number) => {
    try {
      const response = await api.getCategorySpecificationDefaults(categoryId);
      const defaults = response.data;
      
      // Also fetch templates for ordering
      await fetchCategorySpecTemplates(categoryId);
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
            
            // Sort specs after merging
            if (sectionKey === 'specifications') {
              (mergedVariant as any)[sectionKey] = sortSpecsByTemplate(existingSpecs, 'specifications');
            } else if (sectionKey === 'measurement_specs') {
              (mergedVariant as any)[sectionKey] = sortSpecsByTemplate(existingSpecs, 'measurement_specs');
            } else {
            (mergedVariant as any)[sectionKey] = existingSpecs;
            }
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
    
    const newVariants = [...variants, newVariant];
    setVariants(newVariants);
    
    // Auto-expand and navigate to the new variant
    const newVariantIndex = newVariants.length - 1;
    setExpandedVariants(prev => new Set(prev).add(newVariantIndex));
    setActiveVariantIndex(newVariantIndex);
    setActiveSection('variant-details');
  };
  
  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    // Clean up navigation state if removed variant was active
    if (activeVariantIndex === index) {
      setActiveVariantIndex(null);
      setActiveSection('variants');
    } else if (activeVariantIndex !== null && activeVariantIndex > index) {
      // Adjust active index if a variant before the active one was removed
      setActiveVariantIndex(activeVariantIndex - 1);
    }
    // Remove from expanded set
    setExpandedVariants(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      // Adjust indices for variants after the removed one
      const adjustedSet = new Set<number>();
      newSet.forEach(idx => {
        if (idx > index) {
          adjustedSet.add(idx - 1);
        } else if (idx < index) {
          adjustedSet.add(idx);
        }
      });
      return adjustedSet;
    });
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
  
  // Bulk upload images to Cloudinary
  const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});
  const [imageUploadProgress, setImageUploadProgress] = useState<{ [key: number]: { current: number; total: number; percentage: number } }>({});
  const [imageUploadErrors, setImageUploadErrors] = useState<{ [key: number]: Array<{ fileName: string; error: string }> }>({});
  const [showImageUploadModal, setShowImageUploadModal] = useState<{ [key: number]: boolean }>({});
  const [uploadingVideo, setUploadingVideo] = useState<{ [key: number]: boolean }>({});
  const [videoUploadProgress, setVideoUploadProgress] = useState<{ [key: number]: number }>({});
  const [showVideoUploadModal, setShowVideoUploadModal] = useState<{ [key: number]: boolean }>({});
  
  const handleBulkImageUpload = async (variantIndex: number, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const maxImages = 10;
    const currentImageCount = (variants[variantIndex].image ? 1 : 0) + (variants[variantIndex].images?.length || 0);
    
    if (currentImageCount + fileArray.length > maxImages) {
      showToast(`Maximum ${maxImages} images allowed. You can upload ${maxImages - currentImageCount} more.`, 'error');
      return;
    }
    
    // Limit to max 10 images total
    const filesToUpload = fileArray.slice(0, maxImages - currentImageCount);
    
    setUploadingImages(prev => ({ ...prev, [variantIndex]: true }));
    setImageUploadProgress(prev => ({ 
      ...prev, 
      [variantIndex]: { current: 0, total: filesToUpload.length, percentage: 0 } 
    }));
    setImageUploadErrors(prev => ({ ...prev, [variantIndex]: [] }));
    setShowImageUploadModal(prev => ({ ...prev, [variantIndex]: true }));
    
    try {
      const uploadedUrls: string[] = [];
      const failedImages: Array<{ fileName: string; error: string }> = [];
      const totalFiles = filesToUpload.length;
      
      // Upload each image to Cloudinary with progress tracking
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        if (!file.type.startsWith('image/')) {
          const errorInfo = { fileName: file.name, error: 'Not an image file' };
          failedImages.push(errorInfo);
          
          // Update error state in real-time
          setImageUploadErrors(prev => ({
            ...prev,
            [variantIndex]: [...(prev[variantIndex] || []), errorInfo]
          }));
          
          // Update progress to account for skipped file
          const completedFiles = i + 1;
          const overallProgress = (completedFiles / totalFiles) * 100;
          setImageUploadProgress(prev => ({
            ...prev,
            [variantIndex]: {
              current: completedFiles,
              total: totalFiles,
              percentage: Math.min(Math.round(overallProgress), 99)
            }
          }));
          continue;
        }
        
        const formData = new FormData();
        formData.append('image', file);
        
        // Use XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();
        const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';
        const apiUrl = baseUrl.replace(/\/api$/, '') + '/api/admin/media/upload/';
        const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
        
        try {
          await new Promise<void>((resolve, reject) => {
            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const fileProgress = e.loaded / e.total;
                // Calculate overall progress: (completed files + current file progress) / total files
                const completedFiles = i;
                const overallProgress = ((completedFiles + fileProgress) / totalFiles) * 100;
                setImageUploadProgress(prev => ({
                  ...prev,
                  [variantIndex]: {
                    current: completedFiles + 1,
                    total: totalFiles,
                    percentage: Math.min(Math.round(overallProgress), 99) // Cap at 99% until all files complete
                  }
                }));
              }
            });
            
            // Handle completion
            xhr.addEventListener('load', () => {
              if (xhr.status === 201) {
                try {
                  const response = JSON.parse(xhr.responseText);
                  if (response.cloudinary_url) {
                    uploadedUrls.push(response.cloudinary_url);
                    // Update progress when file completes
                    const completedFiles = i + 1;
                    const overallProgress = (completedFiles / totalFiles) * 100;
                    setImageUploadProgress(prev => ({
                      ...prev,
                      [variantIndex]: {
                        current: completedFiles,
                        total: totalFiles,
                        percentage: Math.min(Math.round(overallProgress), 99)
                      }
                    }));
                    resolve();
                  } else {
                    reject(new Error('No URL in response'));
                  }
                } catch (error) {
                  reject(error);
                }
              } else {
                let errorMessage = `Upload failed with status ${xhr.status}`;
                try {
                  const errorResponse = JSON.parse(xhr.responseText);
                  errorMessage = errorResponse.error || errorResponse.message || errorMessage;
                } catch {
                  // If response is not JSON, use status-based message
                  if (xhr.status === 413) {
                    errorMessage = 'File too large';
                  } else if (xhr.status === 400) {
                    errorMessage = 'Invalid file format';
                  }
                }
                reject(new Error(errorMessage));
              }
            });
            
            // Handle errors
            xhr.addEventListener('error', () => reject(new Error('Network error')));
            xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
            xhr.addEventListener('timeout', () => reject(new Error('Upload timeout')));
            
            // Open and send request
            xhr.open('POST', apiUrl);
            if (token) {
              const authHeader = token.startsWith('Bearer ') || token.startsWith('Token ') 
                ? token 
                : `Token ${token}`;
              xhr.setRequestHeader('Authorization', authHeader);
            }
            xhr.timeout = 300000; // 5 minutes
            xhr.send(formData);
          });
        } catch (error: any) {
          // Track failed image but continue with next ones
          const errorInfo = { 
            fileName: file.name, 
            error: error.message || 'Upload failed' 
          };
          failedImages.push(errorInfo);
          
          // Update error state in real-time
          setImageUploadErrors(prev => ({
            ...prev,
            [variantIndex]: [...(prev[variantIndex] || []), errorInfo]
          }));
          
          // Update progress to account for failed file
          const completedFiles = i + 1;
          const overallProgress = (completedFiles / totalFiles) * 100;
          setImageUploadProgress(prev => ({
            ...prev,
            [variantIndex]: {
              current: completedFiles,
              total: totalFiles,
              percentage: Math.min(Math.round(overallProgress), 99)
            }
          }));
        }
      }
      
      // Update progress to 100%
      setImageUploadProgress(prev => ({
        ...prev,
        [variantIndex]: {
          current: totalFiles,
          total: totalFiles,
          percentage: 100
        }
      }));
      
      if (uploadedUrls.length > 0) {
    const updated = [...variants];
        const variant = updated[variantIndex];
        
        // First image becomes main image, rest go to images array
        if (!variant.image && uploadedUrls.length > 0) {
          variant.image = uploadedUrls[0];
          // Remaining images go to array
          const remainingImages = uploadedUrls.slice(1).map((url, idx) => ({
            image: url,
            alt_text: `Image ${idx + 2}`,
            sort_order: (variant.images?.length || 0) + idx,
            is_active: true
          }));
          variant.images = [...(variant.images || []), ...remainingImages];
        } else {
          // If main image exists, all new images go to array
          const newImages = uploadedUrls.map((url, idx) => ({
            image: url,
            alt_text: `Image ${(variant.images?.length || 0) + idx + 1}`,
            sort_order: (variant.images?.length || 0) + idx,
            is_active: true
          }));
          variant.images = [...(variant.images || []), ...newImages];
        }
        
        setVariants(updated);
        
        // Show success message with error summary if any failed
        if (failedImages.length > 0) {
          const errorSummary = failedImages.map(f => `${f.fileName}: ${f.error}`).join('; ');
          showToast(
            `Uploaded ${uploadedUrls.length} of ${totalFiles} image(s). Failed: ${failedImages.length}. ${errorSummary}`,
            uploadedUrls.length > 0 ? 'info' : 'error'
          );
        } else {
          showToast(`Successfully uploaded ${uploadedUrls.length} image(s)`, 'success');
        }
        
        // Show reminder to save changes
        if (!isNew) {
          setTimeout(() => {
            showToast('Remember to click Save to persist your changes', 'info');
          }, 2000);
        }
      } else if (failedImages.length > 0) {
        // All images failed
        const errorSummary = failedImages.map(f => `${f.fileName}: ${f.error}`).join('; ');
        showToast(`All uploads failed. ${errorSummary}`, 'error');
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      showToast(error.message || error.response?.data?.error || 'Failed to upload images', 'error');
    } finally {
      setUploadingImages(prev => ({ ...prev, [variantIndex]: false }));
      // Don't clear progress automatically - let user close modal manually
    }
  };
  
  // Helper to get all images as unified list (main image first, then array images)
  const getAllImages = (variant: ProductVariant): Array<{ image: string; alt_text: string; sort_order: number; is_active: boolean; isMain: boolean }> => {
    const allImages: Array<{ image: string; alt_text: string; sort_order: number; is_active: boolean; isMain: boolean }> = [];
    
    // Add main image as first item if it exists
    if (variant.image) {
      allImages.push({
        image: variant.image,
      alt_text: '',
        sort_order: 0,
        is_active: true,
        isMain: true
      });
    }
    
    // Add array images
    if (variant.images && variant.images.length > 0) {
      variant.images.forEach((img, idx) => {
        allImages.push({
          image: img.image,
          alt_text: img.alt_text || '',
          sort_order: idx + (variant.image ? 1 : 0),
          is_active: img.is_active !== false,
          isMain: false
        });
      });
    }
    
    return allImages;
  };
  
  // Move image up or down
  const handleMoveImage = (variantIndex: number, imageIndex: number, direction: 'up' | 'down') => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const allImages = getAllImages(variant);
    
    if (direction === 'up' && imageIndex === 0) return; // Can't move first image up
    if (direction === 'down' && imageIndex === allImages.length - 1) return; // Can't move last image down
    
    const newIndex = direction === 'up' ? imageIndex - 1 : imageIndex + 1;
    const [movedImage] = allImages.splice(imageIndex, 1);
    allImages.splice(newIndex, 0, movedImage);
    
    // First image becomes main, rest go to array
    if (allImages.length > 0) {
      variant.image = allImages[0].image;
      variant.images = allImages.slice(1).map((img, idx) => ({
        image: img.image,
        alt_text: img.alt_text,
        sort_order: idx,
      is_active: true
      }));
    } else {
      variant.image = '';
      variant.images = [];
    }
    
    setVariants(updated);
  };
  
  const handleRemoveVariantImage = (variantIndex: number, imageIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const allImages = getAllImages(variant);
    
    // Remove the image at the specified index
    allImages.splice(imageIndex, 1);
    
    // First image becomes main, rest go to array (if main was deleted, next becomes main)
    if (allImages.length > 0) {
      variant.image = allImages[0].image;
      variant.images = allImages.slice(1).map((img, idx) => ({
        image: img.image,
        alt_text: img.alt_text,
        sort_order: idx,
        is_active: true
      }));
    } else {
      variant.image = '';
      variant.images = [];
    }
    
    setVariants(updated);
  };

  const handleAddImageByUrl = (variantIndex: number, imageUrl: string, altText: string = '') => {
    if (!imageUrl || !imageUrl.trim()) {
      showToast('Please enter a valid image URL', 'error');
      return;
    }

    const variant = variants[variantIndex];
    if (!variant) return;

    const allImages = getAllImages(variant);
    
    // Check if we've reached the limit (10 images total)
    if (allImages.length >= 10) {
      showToast('Maximum 10 images allowed. Please remove an image first.', 'error');
      return;
    }

    // Create new image object
    const newImage = {
      image: imageUrl.trim(),
      alt_text: altText.trim() || '',
      sort_order: allImages.length,
      is_active: true
    };

    // If no main image exists, this becomes the main image
    if (!variant.image) {
      const updatedVariants = [...variants];
      updatedVariants[variantIndex] = {
        ...variant,
        image: imageUrl.trim()
      };
      setVariants(updatedVariants);
    } else {
      // Add to images array
      const updatedVariants = [...variants];
      const currentImages = variant.images || [];
      updatedVariants[variantIndex] = {
        ...variant,
        images: [...currentImages, newImage]
      };
      setVariants(updatedVariants);
    }

    showSuccess('Image added successfully');
    // Show reminder to save changes
    if (!isNew) {
      setTimeout(() => {
        showToast('Remember to click Save to persist your changes', 'info');
      }, 1500);
    }
  };
  
  const handleVariantImageChange = (variantIndex: number, imageIndex: number, field: string, value: any) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const allImages = getAllImages(variant);
    
    // Update the image
    allImages[imageIndex] = {
      ...allImages[imageIndex],
      [field]: value
    };
    
    // Rebuild: first image becomes main, rest go to array
    if (allImages.length > 0) {
      variant.image = allImages[0].image;
      variant.images = allImages.slice(1).map((img, idx) => ({
        image: img.image,
        alt_text: img.alt_text,
        sort_order: idx,
        is_active: true
      }));
    } else {
      variant.image = '';
      variant.images = [];
    }
    
    setVariants(updated);
  };
  
  // Upload video to Cloudinary
  const handleVideoUpload = async (variantIndex: number, file: File | null) => {
    if (!file) return;
    
    // Validate file type
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/ogg'];
    if (!allowedVideoTypes.includes(file.type)) {
      showToast('Invalid file type. Please upload a video file (MP4, MOV, AVI, WebM, or OGG)', 'error');
      return;
    }
    
    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      showToast('File size too large. Maximum size is 500MB.', 'error');
      return;
    }
    
    setUploadingVideo(prev => ({ ...prev, [variantIndex]: true }));
    setVideoUploadProgress(prev => ({ ...prev, [variantIndex]: 0 }));
    setShowVideoUploadModal(prev => ({ ...prev, [variantIndex]: true }));
    
    try {
      const formData = new FormData();
      formData.append('video', file);
      
      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      // Get API base URL - remove /api suffix if present, then add /api/admin/media/upload/
      const baseUrl = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';
      const apiUrl = baseUrl.replace(/\/api$/, '') + '/api/admin/media/upload/';
      const token = localStorage.getItem('access_token') || localStorage.getItem('authToken');
      
      return new Promise<void>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && e.total > 0) {
            // Only update progress if we have valid data
            const percentComplete = Math.min(Math.round((e.loaded / e.total) * 100), 99);
            setVideoUploadProgress(prev => ({ ...prev, [variantIndex]: percentComplete }));
          }
        });
        
        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 201) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.cloudinary_url) {
                // Update progress to 100% only after successful upload
                setVideoUploadProgress(prev => ({ ...prev, [variantIndex]: 100 }));
                
                // Small delay to show 100% before marking as complete
                setTimeout(() => {
                // Update variant with video URL
                const updated = [...variants];
                updated[variantIndex].video_url = response.cloudinary_url;
                setVariants(updated);
                
                // Show success message
                showToast('Video uploaded successfully!', 'success');
                
                // Show reminder to save changes
                if (!isNew) {
                  setTimeout(() => {
                    showToast('Remember to click Save to persist your changes', 'info');
                  }, 1500);
                }
                
                  // Mark upload as complete
                setUploadingVideo(prev => ({ ...prev, [variantIndex]: false }));
                
                resolve();
                }, 300);
              } else {
                throw new Error('No URL in response');
              }
            } catch (error) {
              console.error('Error parsing response:', error);
              showToast('Failed to parse upload response', 'error');
              setUploadingVideo(prev => ({ ...prev, [variantIndex]: false }));
              reject(error);
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              showToast(errorResponse.error || `Upload failed with status ${xhr.status}`, 'error');
            } catch {
              showToast(`Upload failed with status ${xhr.status}`, 'error');
            }
            setUploadingVideo(prev => ({ ...prev, [variantIndex]: false }));
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });
        
        // Handle errors
        xhr.addEventListener('error', () => {
          showToast('Network error during upload', 'error');
          reject(new Error('Network error'));
        });
        
        xhr.addEventListener('abort', () => {
          showToast('Upload cancelled', 'info');
          reject(new Error('Upload cancelled'));
        });
        
        xhr.addEventListener('timeout', () => {
          showToast('Upload timeout. Please try again.', 'error');
          reject(new Error('Upload timeout'));
        });
        
        // Open and send request with optimized settings
        xhr.open('POST', apiUrl);
        if (token) {
          // Check if token format is Bearer or Token
          const authHeader = token.startsWith('Bearer ') || token.startsWith('Token ') 
            ? token 
            : `Token ${token}`;
          xhr.setRequestHeader('Authorization', authHeader);
        }
        // Increase timeout for large videos (15 minutes)
        xhr.timeout = 900000; // 15 minutes
        // Send request
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error('Error uploading video:', error);
      showToast(error.message || 'Failed to upload video', 'error');
    } finally {
      setUploadingVideo(prev => ({ ...prev, [variantIndex]: false }));
      // Don't clear progress automatically - let user close modal manually
    }
  };
  
  // Variant Specification management
  const handleAddVariantSpecification = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const existingSpecs = variant.specifications || [];
    
    // Get max sort_order from template items, or use existing specs length
    const templateSpecs = categorySpecTemplates.specifications || [];
    const maxTemplateOrder = templateSpecs.length > 0 
      ? Math.max(...templateSpecs.map(t => t.sort_order))
      : -1;
    
    // New items should go after template items
    const newSortOrder = maxTemplateOrder + 1;
    
    updated[variantIndex] = {
      ...variant,
      specifications: [...existingSpecs, {
      name: '',
      value: '',
        sort_order: newSortOrder,
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
    
    // If name changed, try to match with template and update sort_order
    if (field === 'name' && value && categorySpecTemplates.specifications) {
      const template = categorySpecTemplates.specifications.find(
        t => t.field_name.toLowerCase() === value.toLowerCase()
      );
      if (template) {
        specs[specIndex].sort_order = template.sort_order;
      }
    }
    
    // Sort specs: template items first (by template order), then non-template items (by sort_order)
    const templateSpecs = categorySpecTemplates.specifications || [];
    const templateFieldNames = new Set(templateSpecs.map(t => t.field_name.toLowerCase()));
    
    specs.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aInTemplate = templateFieldNames.has(aName);
      const bInTemplate = templateFieldNames.has(bName);
      
      // Template items come first
      if (aInTemplate && !bInTemplate) return -1;
      if (!aInTemplate && bInTemplate) return 1;
      
      // Both in template: sort by template order
      if (aInTemplate && bInTemplate) {
        const aTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === aName);
        const bTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === bName);
        if (aTemplate && bTemplate) {
          return aTemplate.sort_order - bTemplate.sort_order;
        }
      }
      
      // Both not in template: sort by sort_order
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
    
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
    const existingSpecs = variant.measurement_specs || [];
    
    // Get max sort_order from template items, or use existing specs
    const templateSpecs = categorySpecTemplates.measurement_specs || [];
    const maxTemplateOrder = templateSpecs.length > 0 
      ? Math.max(...templateSpecs.map(t => t.sort_order))
      : -1;
    
    // New items should go after template items
    const newSortOrder = maxTemplateOrder + 1;
    
    updated[variantIndex] = {
      ...variant,
      measurement_specs: [...existingSpecs, {
        name: '',
        value: '',
        sort_order: newSortOrder,
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
    
    // If name changed, try to match with template and update sort_order
    if (field === 'name' && value && categorySpecTemplates.measurement_specs) {
      const template = categorySpecTemplates.measurement_specs.find(
        t => t.field_name.toLowerCase() === value.toLowerCase()
      );
      if (template) {
        specs[specIndex].sort_order = template.sort_order;
      }
    }
    
    // Sort specs: template items first (by template order), then non-template items (by sort_order)
    const templateSpecs = categorySpecTemplates.measurement_specs || [];
    const templateFieldNames = new Set(templateSpecs.map(t => t.field_name.toLowerCase()));
    
    specs.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      const aInTemplate = templateFieldNames.has(aName);
      const bInTemplate = templateFieldNames.has(bName);
      
      // Template items come first
      if (aInTemplate && !bInTemplate) return -1;
      if (!aInTemplate && bInTemplate) return 1;
      
      // Both in template: sort by template order
      if (aInTemplate && bInTemplate) {
        const aTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === aName);
        const bTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === bName);
        if (aTemplate && bTemplate) {
          return aTemplate.sort_order - bTemplate.sort_order;
        }
      }
      
      // Both not in template: sort by sort_order
      return (a.sort_order || 0) - (b.sort_order || 0);
    });
    
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
    const existingSpecs = variant.style_specs || [];
    
    // Get max sort_order from template items, or use existing specs
    const templateSpecs = categorySpecTemplates.style_specs || [];
    const maxTemplateOrder = templateSpecs.length > 0 
      ? Math.max(...templateSpecs.map(t => t.sort_order))
      : -1;
    
    // New items should go after template items
    const newSortOrder = maxTemplateOrder + 1;
    
    updated[variantIndex] = {
      ...variant,
      style_specs: [...existingSpecs, {
        name: '',
        value: '',
        sort_order: newSortOrder,
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
    
    // If name changed, try to match with template and update sort_order
    if (field === 'name' && value && categorySpecTemplates.style_specs) {
      const template = categorySpecTemplates.style_specs.find(
        t => t.field_name.toLowerCase() === value.toLowerCase()
      );
      if (template) {
        specs[specIndex].sort_order = template.sort_order;
      }
    }
    
    // Sort specs: template items first (by template order), then non-template items (by sort_order)
    const sortedSpecs = sortSpecsByTemplate(specs, 'style_specs');
    
    updated[variantIndex] = {
      ...variant,
      style_specs: sortedSpecs
    };
    setVariants(updated);
  };
  
  // Variant Features management
  const handleAddVariantFeature = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const existingSpecs = variant.features || [];
    
    // Get max sort_order from template items, or use existing specs
    const templateSpecs = categorySpecTemplates.features || [];
    const maxTemplateOrder = templateSpecs.length > 0 
      ? Math.max(...templateSpecs.map(t => t.sort_order))
      : -1;
    
    // New items should go after template items
    const newSortOrder = maxTemplateOrder + 1;
    
    updated[variantIndex] = {
      ...variant,
      features: [...existingSpecs, {
        name: '',
        value: '',
        sort_order: newSortOrder,
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
    const features = [...(variant.features || [])];
    features[specIndex] = { ...features[specIndex], [field]: value };
    
    // If name changed, try to match with template and update sort_order
    if (field === 'name' && value && categorySpecTemplates.features) {
      const template = categorySpecTemplates.features.find(
        t => t.field_name.toLowerCase() === value.toLowerCase()
      );
      if (template) {
        features[specIndex].sort_order = template.sort_order;
      }
    }
    
    // Sort specs: template items first (by template order), then non-template items (by sort_order)
    const sortedFeatures = sortSpecsByTemplate(features, 'features');
    
    updated[variantIndex] = {
      ...variant,
      features: sortedFeatures
    };
    setVariants(updated);
  };
  
  // Variant User Guide management
  const handleAddVariantUserGuide = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const existingSpecs = variant.user_guide || [];
    
    // Get max sort_order from template items, or use existing specs
    const templateSpecs = categorySpecTemplates.user_guide || [];
    const maxTemplateOrder = templateSpecs.length > 0 
      ? Math.max(...templateSpecs.map(t => t.sort_order))
      : -1;
    
    // New items should go after template items
    const newSortOrder = maxTemplateOrder + 1;
    
    updated[variantIndex] = {
      ...variant,
      user_guide: [...existingSpecs, {
        name: '',
        value: '',
        sort_order: newSortOrder,
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
    const userGuide = [...(variant.user_guide || [])];
    userGuide[specIndex] = { ...userGuide[specIndex], [field]: value };
    
    // If name changed, try to match with template and update sort_order
    if (field === 'name' && value && categorySpecTemplates.user_guide) {
      const template = categorySpecTemplates.user_guide.find(
        t => t.field_name.toLowerCase() === value.toLowerCase()
      );
      if (template) {
        userGuide[specIndex].sort_order = template.sort_order;
      }
    }
    
    // Sort specs: template items first (by template order), then non-template items (by sort_order)
    const sortedUserGuide = sortSpecsByTemplate(userGuide, 'user_guide');
    
    updated[variantIndex] = {
      ...variant,
      user_guide: sortedUserGuide
    };
    setVariants(updated);
  };
  
  // Variant Item Details management
  const handleAddVariantItemDetail = (variantIndex: number) => {
    const updated = [...variants];
    const variant = updated[variantIndex];
    const existingSpecs = variant.item_details || [];
    
    // Get max sort_order from template items, or use existing specs
    const templateSpecs = categorySpecTemplates.item_details || [];
    const maxTemplateOrder = templateSpecs.length > 0 
      ? Math.max(...templateSpecs.map(t => t.sort_order))
      : -1;
    
    // New items should go after template items
    const newSortOrder = maxTemplateOrder + 1;
    
    updated[variantIndex] = {
      ...variant,
      item_details: [...existingSpecs, {
        name: '',
        value: '',
        sort_order: newSortOrder,
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
    const details = [...(variant.item_details || [])];
    details[specIndex] = { ...details[specIndex], [field]: value };
    updated[variantIndex] = {
      ...variant,
      item_details: details
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
  
  // Helper function to deep compare two objects
  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
      if (obj1.length !== obj2.length) return false;
      return obj1.every((val, idx) => deepEqual(val, obj2[idx]));
    }
    
    if (typeof obj1 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;
      return keys1.every(key => deepEqual(obj1[key], obj2[key]));
    }
    
    return obj1 === obj2;
  };

  // Check if there are any unsaved changes in the form
  const checkHasUnsavedChanges = (): boolean => {
    if (isNew) {
      // For new products, check if any data has been entered
      return formData.title.trim() !== '' || variants.length > 0;
    }
    
    if (!originalProduct) return false;
    
    // Check if any formData field has changed
    const formFieldsChanged = 
      formData.title !== originalProduct.title ||
      formData.slug !== originalProduct.slug ||
      formData.sku !== originalProduct.sku ||
      formData.short_description !== originalProduct.short_description ||
      formData.long_description !== originalProduct.long_description ||
      parseInt(formData.category_id) !== originalProduct.category?.id ||
      formData.brand !== originalProduct.brand ||
      formData.dimensions !== originalProduct.dimensions ||
      formData.weight !== originalProduct.weight ||
      formData.warranty !== originalProduct.warranty ||
      formData.assembly_required !== originalProduct.assembly_required ||
      formData.estimated_delivery_days !== originalProduct.estimated_delivery_days ||
      formData.is_featured !== originalProduct.is_featured ||
      formData.is_active !== originalProduct.is_active;
    
    if (formFieldsChanged) return true;
    
    // Check if variants have changed
    if (variants.length !== originalVariants.length) return true;
    
    for (let i = 0; i < variants.length; i++) {
      const original = originalVariants.find(ov => ov.id === variants[i].id);
      if (hasVariantChanged(variants[i], original)) {
        return true;
      }
    }
    
    return false;
  };
  
  // Update hasUnsavedChanges whenever relevant state changes
  useEffect(() => {
    const hasChanges = checkHasUnsavedChanges();
    setHasUnsavedChanges(hasChanges);
  }, [formData, variants, originalProduct, originalVariants, isNew]);
  
  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !saving) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saving]);

  // Helper function to filter out empty specification entries
  const filterSpecArray = (specs: any[] | undefined | null | {}): any[] => {
    // Handle case where it might be an object instead of array
    if (!specs) return [];
    if (typeof specs === 'object' && !Array.isArray(specs)) {
      // If it's an object, try to convert to array or return empty
      if (Object.keys(specs).length === 0) return [];
      // If it has array-like structure, try to extract
      return [];
    }
    if (!Array.isArray(specs)) return [];
    
    return specs
      .filter((spec: any) => {
        // Filter out null, undefined, or non-objects
        if (!spec || typeof spec !== 'object' || Array.isArray(spec)) return false;
        
        // Check if it's an empty object
        if (Object.keys(spec).length === 0) return false;
        
        // Extract name and value (handle different property name cases)
        const name = (spec.name || spec.Name || '').toString().trim();
        const value = (spec.value || spec.Value || '').toString().trim();
        
        // Only include if both name and value are non-empty
        return name !== '' && value !== '';
      })
      .map((spec: any) => ({
        id: spec.id,
        name: (spec.name || spec.Name || '').toString().trim(),
        value: (spec.value || spec.Value || '').toString().trim(),
        sort_order: spec.sort_order || spec.sortOrder || 0,
        is_active: spec.is_active !== false && spec.isActive !== false
      }));
  };

  // Helper function to build variant payload
  const buildVariantPayload = (v: ProductVariant) => {
          const colorId = v.color_id || v.color?.id;
          if (!colorId) {
            throw new Error(`Variant ${v.id || 'new'} is missing a color selection`);
          }
          return {
            id: v.id,
            color_id: colorId,
            sku: v.sku || '',
            size: v.size || '',
            pattern: v.pattern || '',
            quality: v.quality || '',
            title: v.title || '',
          price: v.price ? parseFloat(v.price.toString()) : null,
          old_price: v.old_price ? parseFloat(v.old_price.toString()) : null,
            stock_quantity: parseInt(v.stock_quantity.toString()) || 0,
            is_in_stock: v.is_in_stock !== false,
            image: v.image || '',
            video_url: v.video_url || '',
            is_active: v.is_active !== false,
      subcategory_ids: v.subcategory_ids || [],
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
      // Filter out empty entries from arrays
      measurement_specs: filterSpecArray(v.measurement_specs),
      style_specs: filterSpecArray(v.style_specs),
      features: filterSpecArray(v.features),
      user_guide: filterSpecArray(v.user_guide),
      item_details: filterSpecArray(v.item_details)
    };
  };

  // Check if variant has changed
  const hasVariantChanged = (current: ProductVariant, original: ProductVariant | undefined): boolean => {
    if (!original) return true; // New variant
    if (!original.id && current.id) return true; // Variant was just created
    
    // Quick checks for common changes (more efficient than full deep equal)
    // Check images array length first
    const currentImagesCount = (current.images || []).length;
    const originalImagesCount = (original.images || []).length;
    if (currentImagesCount !== originalImagesCount) {
      console.log('Variant changed - images count different:', { current: currentImagesCount, original: originalImagesCount });
      return true;
    }
    
    // Check main image
    if (current.image !== original.image) {
      console.log('Variant changed - main image different');
      return true;
    }
    
    // Check video URL
    if ((current.video_url || '') !== (original.video_url || '')) {
      console.log('Variant changed - video URL different');
      return true;
    }
    
    // Check if any image URLs changed
    const currentImageUrls = (current.images || []).map(img => img.image).sort();
    const originalImageUrls = (original.images || []).map(img => img.image).sort();
    if (!deepEqual(currentImageUrls, originalImageUrls)) {
      console.log('Variant changed - image URLs different');
      return true;
    }
    
    // Full deep comparison for all other fields
    const currentPayload = buildVariantPayload(current);
    const originalPayload = buildVariantPayload(original);
    
    // Compare all fields
    const changed = !deepEqual(currentPayload, originalPayload);
    if (changed) {
      console.log('Variant changed - full payload different');
    }
    return changed;
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
      
      // Build base payload with only changed product fields (for edit mode)
      const payload: any = {};
      
      if (isNew) {
        // For new products, send all fields
        payload.title = formData.title;
        payload.slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        payload.sku = formData.sku || null;
        payload.short_description = formData.short_description;
        payload.long_description = formData.long_description;
        payload.category_id = categoryId;
        payload.material_id = formData.material_id ? parseInt(formData.material_id) : null;
        payload.brand = isSixpineProduct ? 'Sixpine' : formData.brand;
        payload.dimensions = formData.dimensions;
        payload.weight = formData.weight;
        payload.warranty = formData.warranty;
        payload.assembly_required = formData.assembly_required;
        payload.estimated_delivery_days = formData.estimated_delivery_days;
        payload.screen_offer = formData.screen_offer;
        payload.style_description = formData.style_description;
        payload.user_guide = formData.user_guide;
        payload.care_instructions = formData.care_instructions;
        payload.what_in_box = formData.what_in_box;
        payload.meta_title = formData.meta_title;
        payload.meta_description = formData.meta_description;
        payload.is_featured = formData.is_featured;
        payload.is_active = formData.is_active;
        // Send all variants for new products
        payload.variants = variants.map(v => buildVariantPayload(v));
        payload.features = features.map(f => ({
          feature: f.feature,
          sort_order: f.sort_order,
          is_active: f.is_active !== false
        }));
        payload.about_items = aboutItems.map(a => ({
          item: a.item || a.feature,
          sort_order: a.sort_order,
          is_active: a.is_active !== false
        }));
        payload.recommendations = recommendations.map(r => ({
          id: r.id,
          recommended_product_id: r.recommended_product_id,
          recommendation_type: r.recommendation_type,
          sort_order: r.sort_order || 0,
          is_active: r.is_active !== false
        }));
      } else {
        // For updates, only send changed fields
        if (originalProduct) {
          // Compare product fields
          if (formData.title !== originalProduct.title) payload.title = formData.title;
          if (formData.slug !== originalProduct.slug) payload.slug = formData.slug;
          if (formData.sku !== originalProduct.sku) payload.sku = formData.sku;
          if (formData.short_description !== originalProduct.short_description) payload.short_description = formData.short_description;
          if (formData.long_description !== originalProduct.long_description) payload.long_description = formData.long_description;
          if (categoryId !== originalProduct.category?.id) payload.category_id = categoryId;
          const materialId = formData.material_id ? parseInt(formData.material_id) : null;
          if (materialId !== originalProduct.material?.id) payload.material_id = materialId;
          const brand = isSixpineProduct ? 'Sixpine' : formData.brand;
          if (brand !== originalProduct.brand) payload.brand = brand;
          if (formData.dimensions !== originalProduct.dimensions) payload.dimensions = formData.dimensions;
          if (formData.weight !== originalProduct.weight) payload.weight = formData.weight;
          if (formData.warranty !== originalProduct.warranty) payload.warranty = formData.warranty;
          if (formData.assembly_required !== originalProduct.assembly_required) payload.assembly_required = formData.assembly_required;
          if (formData.estimated_delivery_days !== originalProduct.estimated_delivery_days) payload.estimated_delivery_days = formData.estimated_delivery_days;
          if (!deepEqual(formData.screen_offer, originalProduct.screen_offer)) payload.screen_offer = formData.screen_offer;
          if (formData.style_description !== originalProduct.style_description) payload.style_description = formData.style_description;
          if (formData.user_guide !== originalProduct.user_guide) payload.user_guide = formData.user_guide;
          if (formData.care_instructions !== originalProduct.care_instructions) payload.care_instructions = formData.care_instructions;
          if (formData.what_in_box !== originalProduct.what_in_box) payload.what_in_box = formData.what_in_box;
          if (formData.meta_title !== originalProduct.meta_title) payload.meta_title = formData.meta_title;
          if (formData.meta_description !== originalProduct.meta_description) payload.meta_description = formData.meta_description;
          if (formData.is_featured !== originalProduct.is_featured) payload.is_featured = formData.is_featured;
          if (formData.is_active !== originalProduct.is_active) payload.is_active = formData.is_active;
        }
        
        // IMPORTANT: Always send ALL variants to prevent deletion of unchanged variants
        // For unchanged variants, send minimal data (just ID and essential fields) to reduce payload size
        // For changed variants, send full payload
        // This significantly reduces payload size and processing time for products with many variants (90+)
        payload.variants = variants.map(v => {
          const original = originalVariants.find(ov => ov.id === v.id);
          
          // If variant hasn't changed, send minimal data to reduce payload size
          if (original && !hasVariantChanged(v, original)) {
            // Send only ID and essential fields - backend will skip update if nothing changed
            return {
              id: v.id,
              color_id: v.color_id || v.color?.id,
              sku: v.sku || '',
              // Minimal required fields to satisfy serializer validation
              size: v.size || '',
              pattern: v.pattern || '',
              quality: v.quality || '',
              price: v.price ? parseFloat(v.price.toString()) : null,
              stock_quantity: parseInt(v.stock_quantity.toString()) || 0,
              is_in_stock: v.is_in_stock !== false,
              is_active: v.is_active !== false,
              subcategory_ids: v.subcategory_ids || []
              // Don't send images, specifications, measurement_specs, style_specs, etc. for unchanged variants
              // Backend will skip processing these if not provided
            };
          }
          
          // If variant has changed, send full payload
          return buildVariantPayload(v);
        });
        
        // Only send changed features, about_items, recommendations if they changed
        if (!deepEqual(features, originalProduct?.features || [])) {
          payload.features = features.map(f => ({
            feature: f.feature,
            sort_order: f.sort_order,
            is_active: f.is_active !== false
          }));
        }
        
        if (!deepEqual(aboutItems, originalProduct?.about_items || [])) {
          payload.about_items = aboutItems.map(a => ({
            item: a.item || a.feature,
            sort_order: a.sort_order,
            is_active: a.is_active !== false
          }));
        }
        
        if (!deepEqual(recommendations, originalProduct?.recommendations || [])) {
          payload.recommendations = recommendations.map(r => ({
            id: r.id,
            recommended_product_id: r.recommended_product_id,
            recommendation_type: r.recommendation_type,
            sort_order: r.sort_order || 0,
            is_active: r.is_active !== false
          }));
        }
      }
      
      console.log('Saving product with payload (optimized):', payload);
      if (payload.variants) {
        const changedCount = payload.variants.filter((v: any) => {
          const original = originalVariants.find(ov => ov.id === v.id);
          if (!original) return true;
          const current = variants.find(cv => cv.id === v.id);
          return current && hasVariantChanged(current, original);
        }).length;
        console.log(`Sending ${payload.variants.length} variant(s) (${changedCount} changed, ${payload.variants.length - changedCount} unchanged)`);
      }
      
      let response;
      if (isNew) {
        response = await api.createProduct(payload);
        showSuccess('Product created successfully!');
        // Navigate back to appropriate page
        if (isSixpineProduct) {
          navigate(`${basePath}/sixpine-products`);
        } else {
        navigate(`${basePath}/products/${response.data.id}`);
        }
      } else {
        // Use PATCH for partial updates
        response = await api.updateProduct(parseInt(id!), payload);
        console.log('Product update response:', response.data);
        setProduct(response.data);
        
        // CRITICAL: Update variants state with the response data to get new IDs and subcategories
        const updatedVariants = (response.data.variants || []).map((v: any) => {
          const colorId = v.color_id || (v.color?.id ? parseInt(v.color.id) : null) || 0;
          const subcategoryIds = v.subcategories?.map((sub: any) => sub.id) || v.subcategory_ids || [];
          // Normalize images array - ensure it's always an array
          const normalizedImages = (v.images || []).map((img: any) => ({
            id: img.id,
            image: img.image || '',
            alt_text: img.alt_text || '',
            sort_order: img.sort_order || 0,
            is_active: img.is_active !== false
          }));
          return {
            ...v,
            color_id: colorId,
            subcategory_ids: subcategoryIds,
            images: normalizedImages,
            measurement_specs: v.measurement_specs || {},
            style_specs: v.style_specs || {},
            features: v.features || {},
            user_guide: v.user_guide || {},
            item_details: v.item_details || {}
          };
        });
        setVariants(updatedVariants);
        // Update original variants after successful save
        setOriginalVariants(JSON.parse(JSON.stringify(updatedVariants)));
        setOriginalProduct(JSON.parse(JSON.stringify(response.data)));
        
        showSuccess('Product updated successfully!');
      }
      
    } catch (err: any) {
      console.error('Error saving product:', err);
      let errorMessage = 'Failed to save product';
      
      // Check for timeout errors
      const isTimeout = err.code === 'ECONNABORTED' || 
                       err.message?.toLowerCase().includes('timeout') ||
                       (err.response?.status === 408) ||
                       (err.response?.status === 504);
      
      if (isTimeout) {
        errorMessage = 'Request timed out. The product data is large and may take longer to process. Please try again or reduce the number of images/variants.';
      } else if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage = err.message;
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
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      zIndex: 1000
    }}>
      {/* Full-screen Header */}
      <div style={{
        height: '64px',
        backgroundColor: '#000000',
        borderBottom: '1px solid #333333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        zIndex: 1001
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate(isSixpineProduct ? `${basePath}/sixpine-products` : `${basePath}/products`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#ffffff' 
          }}>
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h2>
        </div>
        {isNew && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="admin-btn secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #666666',
                backgroundColor: '#333333',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }} 
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.xlsx,.xls';
                fileInput.onchange = async (e: any) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  setImportingExcel(true);
                  setImportProgress('Reading Excel file...');
                  setImportResult(null);
                  
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    // Simulate progress updates
                    setTimeout(() => setImportProgress('Validating Excel format...'), 300);
                    setTimeout(() => setImportProgress('Processing Parent Product data...'), 600);
                    setTimeout(() => setImportProgress('Processing Child Variation data...'), 900);
                    
                    const response = await adminAPI.importProductsExcel(formData);
                    
                    setImportProgress('Creating products and variants...');
                    
                    if (response.data.success) {
                      setImportProgress('Products created successfully!');
                      setImportResult({
                        success: true,
                        message: `Successfully created ${response.data.products_created} products and ${response.data.variants_created} variants`,
                        products_created: response.data.products_created,
                        variants_created: response.data.variants_created,
                        errors: response.data.errors || []
                      });
                      
                      // Show success toast
                      showToast(
                        `Products created successfully: ${response.data.products_created} products, ${response.data.variants_created} variants`,
                        'success'
                      );
                      
                      if (response.data.errors && response.data.errors.length > 0) {
                        console.warn('Import errors:', response.data.errors);
                        showToast(
                          `${response.data.errors.length} errors occurred. Check console for details.`,
                          'info'
                        );
                      }
                      
                      // Navigate to products list after 3 seconds
                      setTimeout(() => {
                        setImportingExcel(false);
                        navigate(isSixpineProduct ? `${basePath}/sixpine-products` : `${basePath}/products`);
                      }, 3000);
                    } else {
                      setImportProgress('Import failed');
                      setImportResult({
                        success: false,
                        message: response.data.message || 'Import failed',
                        errors: []
                      });
                      showToast(response.data.message || 'Import failed', 'error');
                      setTimeout(() => {
                        setImportingExcel(false);
                      }, 2000);
                    }
                  } catch (error: any) {
                    setImportProgress('Error occurred');
                    setImportResult({
                      success: false,
                      message: error.response?.data?.error || 'Failed to import products from Excel',
                      errors: []
                    });
                    showToast(
                      error.response?.data?.error || 'Failed to import products from Excel',
                      'error'
                    );
                    setTimeout(() => {
                      setImportingExcel(false);
                    }, 2000);
                  }
                };
                fileInput.click();
              }}
            >
              <span className="material-symbols-outlined">upload_file</span>
              Import Products from Excel
            </button>
            <button
              type="button"
              onClick={() => {
                const form = document.querySelector('form[data-product-form]') as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                border: hasUnsavedChanges ? '2px solid #fbbf24' : '1px solid #f97316',
                backgroundColor: '#f97316',
                color: '#ffffff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                opacity: saving ? 0.6 : 1,
                width: '40px',
                height: '40px',
                boxShadow: hasUnsavedChanges ? '0 0 8px rgba(251, 191, 36, 0.5)' : 'none',
                position: 'relative'
              }}
              title={hasUnsavedChanges ? 'You have unsaved changes - Click to save' : 'Save product'}
            >
              {saving ? (
                <span className="spinner-small"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                  {hasUnsavedChanges && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fbbf24',
                      border: '2px solid #000'
                    }}></span>
                  )}
                </>
              )}
            </button>
          </div>
        )}
        {!isNew && product && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="admin-btn secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #666666',
                backgroundColor: '#333333',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }} 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('authToken');
                  const baseURL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';
                  const downloadUrl = `${baseURL}/admin/products/${product.id}/download_excel/`;
                  
                  const response = await fetch(downloadUrl, {
                    headers: {
                      'Authorization': `Token ${token}`
                    }
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Failed to download Excel');
                  }
                  
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `product_${product.slug}_${product.id}.xlsx`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                  
                  showToast('Product Excel downloaded successfully', 'success');
                } catch (error: any) {
                  console.error('Download error:', error);
                  showToast(error.message || 'Failed to download Excel', 'error');
                }
              }}
            >
              <span className="material-symbols-outlined">download</span>
              Download Excel
            </button>
            <button 
              className="admin-btn secondary" 
              onClick={() => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.xlsx,.xls';
                fileInput.onchange = async (e: any) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  
                  setUpdatingExcel(true);
                  setUpdateProgress('Reading Excel file...');
                  setUpdateResult(null);
                  
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    // Simulate progress updates
                    setTimeout(() => setUpdateProgress('Validating Excel format...'), 300);
                    setTimeout(() => setUpdateProgress('Processing Parent Product data...'), 600);
                    setTimeout(() => setUpdateProgress('Processing Child Variation data...'), 900);
                    
                    const response = await adminAPI.updateProductFromExcel(product!.id, formData);
                    
                    setUpdateProgress('Updating product and variants...');
                    
                    if (response.data.success) {
                      setUpdateProgress('Product updated successfully!');
                      setUpdateResult({
                        success: true,
                        message: 'Product successfully edited',
                        variants_created: response.data.variants_created,
                        variants_updated: response.data.variants_updated,
                        errors: response.data.errors || []
                      });
                      
                      showToast(
                        'Product successfully edited',
                        'success'
                      );
                      if (response.data.errors && response.data.errors.length > 0) {
                        console.warn('Update errors:', response.data.errors);
                        showToast(
                          `${response.data.errors.length} errors occurred. Check console for details.`,
                          'info'
                        );
                      }
                      
                      // Reload product data after 2 seconds
                      setTimeout(() => {
                        setUpdatingExcel(false);
                        window.location.reload();
                      }, 2000);
                    } else {
                      setUpdateProgress('Update failed');
                      setUpdateResult({
                        success: false,
                        message: response.data.message || 'Update failed',
                        errors: []
                      });
                      showToast(response.data.message || 'Update failed', 'error');
                      setTimeout(() => {
                        setUpdatingExcel(false);
                      }, 2000);
                    }
                  } catch (error: any) {
                    setUpdateProgress('Error occurred');
                    setUpdateResult({
                      success: false,
                      message: error.response?.data?.error || 'Failed to update product from Excel',
                      errors: []
                    });
                    showToast(
                      error.response?.data?.error || 'Failed to update product from Excel',
                      'error'
                    );
                    setTimeout(() => {
                      setUpdatingExcel(false);
                    }, 2000);
                  }
                };
                fileInput.click();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #666666',
                backgroundColor: '#333333',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined">upload_file</span>
              Update from Excel
            </button>
            <button 
              className="admin-btn secondary" 
              onClick={() => window.open(`/products-details/${product.slug}`, '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #666666',
                backgroundColor: '#333333',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span>
              View Product
            </button>
            <button
              type="button"
              onClick={handleToggleActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: formData.is_active ? '1px solid #f59e0b' : '1px solid #10b981',
                backgroundColor: 'transparent',
                color: formData.is_active ? '#f59e0b' : '#10b981',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {formData.is_active ? 'Hide Product' : 'Show Product'}
            </button>
            <button
              type="button"
              onClick={handleToggleFeatured}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: formData.is_featured ? '1px solid #666666' : '1px solid #3b82f6',
                backgroundColor: formData.is_featured ? '#333333' : '#3b82f6',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {formData.is_featured ? 'Unmark Featured' : 'Mark Featured'}
            </button>
            <button 
              className="admin-btn danger" 
              onClick={handleDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #dc2626',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                width: '40px',
                height: '40px'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const form = document.querySelector('form[data-product-form]') as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '8px',
                border: hasUnsavedChanges ? '2px solid #fbbf24' : '1px solid #f97316',
                backgroundColor: '#f97316',
                color: '#ffffff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                opacity: saving ? 0.6 : 1,
                width: '40px',
                height: '40px',
                boxShadow: hasUnsavedChanges ? '0 0 8px rgba(251, 191, 36, 0.5)' : 'none',
                position: 'relative'
              }}
              title={hasUnsavedChanges ? 'You have unsaved changes - Click to save' : 'Save product'}
            >
              {saving ? (
                <span className="spinner-small"></span>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                  {hasUnsavedChanges && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#fbbf24',
                      border: '2px solid #000'
                    }}></span>
                  )}
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}>
      {error && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '24px',
          right: '24px',
          zIndex: 100,
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#991b1b',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '24px',
          right: '24px',
          zIndex: 100,
          padding: '12px 16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
          {success}
        </div>
      )}
      
        {/* Excel Update Progress Modal */}
        {updatingExcel && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}>
              {!updateResult ? (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div className="admin-loader" style={{ width: '40px', height: '40px' }}></div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
                      Updating Product...
                    </h3>
                  </div>
                  <p style={{
                    margin: '0 0 24px 0',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    {updateProgress}
                  </p>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: updateProgress.includes('successfully') ? '100%' : 
                             updateProgress.includes('Updating') ? '85%' :
                             updateProgress.includes('Processing') ? '60%' :
                             updateProgress.includes('Validating') ? '40%' : '20%',
                      height: '100%',
                      backgroundColor: updateProgress.includes('successfully') ? '#10b981' : '#3b82f6',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease, background-color 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {!updateProgress.includes('successfully') && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          animation: 'shimmer 1.5s infinite'
                        }}></div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    {updateResult.success ? (
                      <span className="material-symbols-outlined" style={{
                        fontSize: '48px',
                        color: '#10b981'
                      }}>check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{
                        fontSize: '48px',
                        color: '#ef4444'
                      }}>error</span>
                    )}
                    <h3 style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: '600',
                      color: updateResult.success ? '#10b981' : '#ef4444'
                    }}>
                      {updateResult.success ? 'Update Successful!' : 'Update Failed'}
                    </h3>
                  </div>
                  <p style={{
                    margin: '0 0 16px 0',
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {updateResult.message}
                  </p>
                  {updateResult.errors && updateResult.errors.length > 0 && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '16px',
                      maxHeight: '150px',
                      overflowY: 'auto'
                    }}>
                      <p style={{
                        margin: '0 0 8px 0',
                        color: '#991b1b',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Errors ({updateResult.errors.length}):
                      </p>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '20px',
                        color: '#991b1b',
                        fontSize: '12px'
                      }}>
                        {updateResult.errors.slice(0, 5).map((error, idx) => (
                          <li key={idx} style={{ marginBottom: '4px' }}>{error}</li>
                        ))}
                        {updateResult.errors.length > 5 && (
                          <li style={{ fontStyle: 'italic' }}>... and {updateResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <p style={{
                    margin: '16px 0 0 0',
                    color: '#999',
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    {updateResult.success ? 'Reloading product data...' : 'Please check the errors and try again.'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Excel Import Progress Modal */}
      {importingExcel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            {!importResult ? (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div className="admin-loader" style={{ width: '40px', height: '40px' }}></div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
                    Creating Products...
                  </h3>
                </div>
                <p style={{
                  margin: '0 0 24px 0',
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {importProgress}
                </p>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: importProgress.includes('successfully') ? '100%' : 
                           importProgress.includes('Creating') ? '85%' :
                           importProgress.includes('Processing') ? '60%' :
                           importProgress.includes('Validating') ? '40%' : '20%',
                    height: '100%',
                    backgroundColor: importProgress.includes('successfully') ? '#10b981' : '#3b82f6',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease, background-color 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {!importProgress.includes('successfully') && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 1.5s infinite'
                      }}></div>
                    )}
                  </div>
                </div>
                <style>{`
                  @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                `}</style>
              </>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  {importResult.success ? (
                    <span className="material-symbols-outlined" style={{
                      fontSize: '48px',
                      color: '#10b981'
                    }}>check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined" style={{
                      fontSize: '48px',
                      color: '#ef4444'
                    }}>error</span>
                  )}
                  <h3 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: '600',
                    color: importResult.success ? '#10b981' : '#ef4444'
                  }}>
                    {importResult.success ? 'Import Successful!' : 'Import Failed'}
                  </h3>
                </div>
                <p style={{
                  margin: '0 0 16px 0',
                  color: '#666',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {importResult.message}
                </p>
                {importResult.success && importResult.products_created !== undefined && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#166534', fontSize: '14px', fontWeight: '500' }}>Products Created:</span>
                      <span style={{ color: '#166534', fontSize: '14px', fontWeight: '600' }}>{importResult.products_created}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#166534', fontSize: '14px', fontWeight: '500' }}>Variants Created:</span>
                      <span style={{ color: '#166534', fontSize: '14px', fontWeight: '600' }}>{importResult.variants_created}</span>
                    </div>
                  </div>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    maxHeight: '150px',
                    overflowY: 'auto'
                  }}>
                    <p style={{
                      margin: '0 0 8px 0',
                      color: '#991b1b',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Errors ({importResult.errors.length}):
                    </p>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '20px',
                      color: '#991b1b',
                      fontSize: '12px'
                    }}>
                      {importResult.errors.slice(0, 5).map((error, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li style={{ fontStyle: 'italic' }}>... and {importResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
                <p style={{
                  margin: '16px 0 0 0',
                  color: '#999',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  {importResult.success ? 'Redirecting to products list...' : 'Please check the errors and try again.'}
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Video Upload Progress Modal */}
      {Object.keys(showVideoUploadModal).map((key) => {
        const variantIndex = parseInt(key);
        if (!showVideoUploadModal[variantIndex]) return null;
        
        const progress = videoUploadProgress[variantIndex] || 0;
        const isUploading = uploadingVideo[variantIndex] || false;
        
        return (
          <div
            key={variantIndex}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={(e) => {
              // Don't close on overlay click - only close button
              e.stopPropagation();
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowVideoUploadModal(prev => {
                    const newModal = { ...prev };
                    delete newModal[variantIndex];
                    return newModal;
                  });
                  // Clear progress when closing
                  setVideoUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[variantIndex];
                    return newProgress;
                  });
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
                title="Close"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {isUploading ? (
                  <div className="admin-loader" style={{ width: '40px', height: '40px' }}></div>
                ) : progress === 100 ? (
                  <span className="material-symbols-outlined" style={{
                    fontSize: '48px',
                    color: '#10b981'
                  }}>check_circle</span>
                ) : (
                  <span className="material-symbols-outlined" style={{
                    fontSize: '48px',
                    color: '#3b82f6'
                  }}>cloud_upload</span>
                )}
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  {isUploading ? 'Uploading Video...' : progress === 100 ? 'Upload Complete!' : 'Video Upload'}
                </h3>
              </div>

              <div style={{
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  <span>Upload Progress</span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#3b82f6'
                  }}>{progress}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: progress === 100 ? '#10b981' : '#3b82f6',
                    borderRadius: '6px',
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {isUploading && progress < 100 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 1.5s infinite'
                      }}></div>
                    )}
                  </div>
                </div>
              </div>

              {progress === 100 && !isUploading && (
                <p style={{
                  margin: '16px 0 0 0',
                  color: '#10b981',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Video uploaded successfully!
                </p>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Image Upload Progress Modal */}
      {Object.keys(showImageUploadModal).map((key) => {
        const variantIndex = parseInt(key);
        if (!showImageUploadModal[variantIndex]) return null;
        
        const progressData = imageUploadProgress[variantIndex] || { current: 0, total: 0, percentage: 0 };
        const progress = progressData.percentage || 0;
        const isUploading = uploadingImages[variantIndex] || false;
        const failedImages = imageUploadErrors[variantIndex] || [];
        
        return (
          <div
            key={variantIndex}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={(e) => {
              // Don't close on overlay click - only close button
              e.stopPropagation();
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowImageUploadModal(prev => {
                    const newModal = { ...prev };
                    delete newModal[variantIndex];
                    return newModal;
                  });
                  // Clear progress and errors when closing
                  setImageUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[variantIndex];
                    return newProgress;
                  });
                  setImageUploadErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[variantIndex];
                    return newErrors;
                  });
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.color = '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
                title="Close"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>close</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {isUploading ? (
                  <div className="admin-loader" style={{ width: '40px', height: '40px' }}></div>
                ) : progress === 100 ? (
                  <span className="material-symbols-outlined" style={{
                    fontSize: '48px',
                    color: '#10b981'
                  }}>check_circle</span>
                ) : (
                  <span className="material-symbols-outlined" style={{
                    fontSize: '48px',
                    color: '#3b82f6'
                  }}>cloud_upload</span>
                )}
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333'
                }}>
                  {isUploading ? 'Uploading Images...' : progress === 100 ? 'Upload Complete!' : 'Image Upload'}
                </h3>
              </div>

              <div style={{
                marginBottom: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '500'
                }}>
                  <span>Upload Progress</span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#3b82f6'
                  }}>{progress}%</span>
                </div>
                {progressData.total > 0 && (
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '8px'
                  }}>
                    Uploaded {progressData.current} of {progressData.total} images
                  </div>
                )}
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: progress === 100 ? '#10b981' : '#3b82f6',
                    borderRadius: '6px',
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {isUploading && progress < 100 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 1.5s infinite'
                      }}></div>
                    )}
                  </div>
                </div>
              </div>

              {progress === 100 && !isUploading && failedImages.length === 0 && (
                <p style={{
                  margin: '16px 0 0 0',
                  color: '#10b981',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  All images uploaded successfully!
                </p>
              )}
              
              {/* Failed Images Display */}
              {failedImages.length > 0 && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <span className="material-symbols-outlined" style={{
                      fontSize: '20px',
                      color: '#ef4444'
                    }}>error</span>
                    <h4 style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#991b1b'
                    }}>
                      Failed Images ({failedImages.length})
                    </h4>
                  </div>
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    fontSize: '12px'
                  }}>
                    {failedImages.map((failed, idx) => (
                      <div key={idx} style={{
                        padding: '8px',
                        marginBottom: '6px',
                        backgroundColor: '#fff',
                        borderRadius: '4px',
                        border: '1px solid #fecaca'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#991b1b',
                          marginBottom: '4px',
                          wordBreak: 'break-word'
                        }}>
                          {failed.fileName}
                        </div>
                        <div style={{
                          color: '#dc2626',
                          fontSize: '11px'
                        }}>
                          {failed.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        backgroundColor: '#ffffff'
      }}>
      <form onSubmit={handleSubmit} data-product-form style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {error && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            zIndex: 100,
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#991b1b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            right: '16px',
            zIndex: 100,
            padding: '12px 16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
            {success}
          </div>
        )}
        
        {/* New Sidebar-Based Layout */}
        <div style={{ 
          display: 'flex', 
          flex: 1,
          gap: '0',
          backgroundColor: '#ffffff',
          overflow: 'hidden'
        }}>
          {/* Left Sidebar Navigation */}
          <div style={{
            width: '280px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            overflowY: 'auto',
            padding: '16px 0'
          }}>
            {/* Basic Information */}
            <div 
              onClick={() => setActiveSection('basic')}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                backgroundColor: activeSection === 'basic' ? '#eff6ff' : 'transparent',
                borderLeft: activeSection === 'basic' ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeSection === 'basic' ? '#1e40af' : '#374151',
                fontWeight: activeSection === 'basic' ? '600' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                info
              </span>
              <span>Basic Information</span>
            </div>

            {/* Variants Section */}
            <div style={{ marginTop: '8px' }}>
              <div 
                onClick={() => {
                  if (variants.length > 0) {
                    setActiveSection('variants');
                    setActiveVariantIndex(0);
                    navigateToVariantSection(0, 'variant-details');
                  }
                }}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  backgroundColor: activeSection.startsWith('variant') ? '#eff6ff' : 'transparent',
                  borderLeft: activeSection.startsWith('variant') ? '3px solid #3b82f6' : '3px solid transparent',
                  color: activeSection.startsWith('variant') ? '#1e40af' : '#374151',
                  fontWeight: activeSection.startsWith('variant') ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    style
                  </span>
                  <span>Variants ({variants.length})</span>
                </div>
                {variants.length > 0 && (
                  <span className="material-symbols-outlined" style={{ 
                    fontSize: '18px',
                    transform: expandedVariants.size > 0 ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}>
                    chevron_right
                  </span>
                )}
              </div>

              {/* Variant List */}
              {variants.map((variant, variantIndex) => {
                const isExpanded = expandedVariants.has(variantIndex);
                const isActive = activeVariantIndex === variantIndex && activeSection.startsWith('variant');
                const selectedColor = colors.find(c => c.id === (variant.color_id || variant.color?.id));
                
                return (
                  <div key={variantIndex} style={{ 
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent'
                  }}>
                    {/* Variant Header */}
                    <div
                      onClick={() => {
                        toggleVariantExpansion(variantIndex);
                        if (!isExpanded) {
                          navigateToVariantSection(variantIndex, 'variant-details');
                        }
                      }}
                      style={{
                        padding: '10px 20px 10px 48px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: isActive ? '#1e40af' : '#6b7280',
                        fontWeight: isActive ? '600' : '500',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                        <span className="material-symbols-outlined" style={{ 
                          fontSize: '16px',
                          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}>
                          chevron_right
                        </span>
                        <span>Variant {variantIndex + 1}</span>
                        {selectedColor && (
                          <div 
                            style={{ 
                              width: '16px', 
                              height: '16px', 
                              borderRadius: '4px',
                              backgroundColor: selectedColor.hex_code || '#ccc',
                              border: '1px solid #e5e7eb'
                            }}
                            title={selectedColor.name}
                          />
                        )}
                      </div>
                    </div>

                    {/* Variant Sub-sections */}
                    {isExpanded && (
                      <div style={{ paddingLeft: '48px' }}>
                        {[
                          { key: 'variant-details', label: 'Details', icon: 'info' },
                          { key: 'variant-images', label: 'Images', icon: 'image' },
                          { key: 'variant-specs', label: 'Specification Template', icon: 'description' }
                        ].map(({ key, label, icon }) => {
                          const isSubActive = activeSection === key && activeVariantIndex === variantIndex;
                          return (
                            <div
                              key={key}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToVariantSection(variantIndex, key as any);
                              }}
                              style={{
                                padding: '8px 20px 8px 32px',
                                cursor: 'pointer',
                                backgroundColor: isSubActive ? '#dbeafe' : 'transparent',
                                color: isSubActive ? '#1e40af' : '#6b7280',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s',
                                fontWeight: isSubActive ? '600' : '400'
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                {icon}
                              </span>
                              <span>{label}</span>
        </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Add Variant Button */}
              <div
                onClick={handleAddVariant}
                style={{
                  padding: '10px 20px 10px 48px',
                  cursor: 'pointer',
                  color: '#3b82f6',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '4px',
                  fontWeight: '500'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                <span>Add Variant</span>
              </div>
            </div>

            {/* Details Section */}
            <div 
              onClick={() => setActiveSection('details')}
              style={{
                padding: '12px 20px',
                cursor: 'pointer',
                backgroundColor: activeSection === 'details' ? '#eff6ff' : 'transparent',
                borderLeft: activeSection === 'details' ? '3px solid #3b82f6' : '3px solid transparent',
                color: activeSection === 'details' ? '#1e40af' : '#374151',
                fontWeight: activeSection === 'details' ? '600' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                description
              </span>
              <span>Details</span>
            </div>
          </div>

          {/* Right Content Panel */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            padding: '24px'
          }}>
        
            {/* Dynamic Content Based on Active Section */}
            {activeSection === 'basic' && (
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
                  value={isSixpineProduct ? 'Sixpine' : formData.brand}
                    onChange={handleChange}
                  className="tw-w-full"
                  readOnly={isSixpineProduct}
                  disabled={isSixpineProduct}
                  style={isSixpineProduct ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                  />
                  {isSixpineProduct && (
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      Brand is locked to "Sixpine" for Sixpine products
                    </p>
                  )}
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
        
            {/* Variant Sections */}
            {activeSection.startsWith('variant') && activeVariantIndex !== null && variants[activeVariantIndex] && (
              (() => {
                const variant = variants[activeVariantIndex];
                const variantIndex = activeVariantIndex;
                const selectedColor = colors.find(c => c.id === (variant.color_id || variant.color?.id));
                
                // Variant Details Section
                if (activeSection === 'variant-details') {
                  return (
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                            Variant {variantIndex + 1} - Details
                          </h2>
                          {selectedColor && (
                            <p style={{ color: '#6b7280', fontSize: '14px' }}>
                              {selectedColor.name} {variant.size && `• ${variant.size}`} {variant.pattern && `• ${variant.pattern}`}
                            </p>
                          )}
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
                      
                      <div className="admin-card" style={{ padding: '24px' }}>
                        {/* Basic Information */}
                        <div style={{ marginBottom: '32px' }}>
                          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>info</span>
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
                                placeholder="e.g., Premium, Standard"
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
                            
                            <div className="admin-form-group">
                              <label>Variant SKU</label>
                              <input
                                type="text"
                                value={variant.sku || ''}
                                onChange={(e) => handleVariantChange(variantIndex, 'sku', e.target.value)}
                                placeholder="e.g., PROD-RED-M-L"
                                className="admin-input"
                              />
                            </div>
                            
                            <div className="admin-form-group tw-flex tw-items-end">
                              <label className="tw-flex tw-items-center tw-gap-2 tw-cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={variant.is_active}
                                  onChange={(e) => handleVariantChange(variantIndex, 'is_active', e.target.checked)}
                                />
                                <span>Is Active</span>
                              </label>
                            </div>
                            
                            {/* Subcategories */}
                            <div className="admin-form-group tw-col-span-full">
                              <label>Subcategories</label>
                              <div className="tw-border tw-border-gray-300 tw-rounded tw-p-3 tw-bg-white tw-flex tw-flex-wrap tw-gap-3">
                                {subcategories.length > 0 ? (
                                  subcategories.map(sub => {
                                    const isChecked = Array.isArray(variant.subcategory_ids) && variant.subcategory_ids.includes(sub.id);
                                    return (
                                      <div key={sub.id} className="tw-flex tw-items-center">
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
                                            handleVariantChange(variantIndex, 'subcategory_ids', newIds);
                                          }}
                                          className="tw-mr-2"
                                        />
                                        <label htmlFor={`variant_${variantIndex}_subcategory_${sub.id}`} className="tw-cursor-pointer">
                                          {sub.name}
                                        </label>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <div className="tw-text-gray-500 tw-text-sm">
                                    {formData.category_id ? 'No subcategories available' : 'Please select a category first'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Pricing & Stock */}
                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
                          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payments</span>
                            Pricing & Stock
                          </h5>
                          <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-4">
                            <div className="admin-form-group">
                              <label>Price <span className="tw-text-red-500">*</span></label>
                              <div className="tw-relative">
                                <span className="tw-absolute tw-left-3 tw-top-1/2 -tw-translate-y-1/2 tw-text-gray-500">₹</span>
                                <input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => handleVariantChange(variantIndex, 'price', e.target.value)}
                                  step="0.01"
                                  required
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
                              <label>Stock Quantity <span className="tw-text-red-500">*</span></label>
                              <input
                                type="number"
                                value={variant.stock_quantity}
                                onChange={(e) => handleVariantChange(variantIndex, 'stock_quantity', parseInt(e.target.value) || 0)}
                                min="0"
                                required
                                className="admin-input"
                              />
                            </div>
                            
                            <div className="admin-form-group tw-flex tw-items-end">
                              <label className="tw-flex tw-items-center tw-gap-2 tw-cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={variant.is_in_stock}
                                  onChange={(e) => handleVariantChange(variantIndex, 'is_in_stock', e.target.checked)}
                                />
                                <span>Is In Stock</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Unified Variant Images Section
                if (activeSection === 'variant-images') {
                  const totalImages = (variant.image ? 1 : 0) + (variant.images?.length || 0);
                  const maxImages = 10;
                  const remainingSlots = maxImages - totalImages;
                  
                  return (
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                            Variant {variantIndex + 1} - Images
                          </h2>
                          <p style={{ color: '#6b7280', fontSize: '14px' }}>
                            Upload up to {maxImages} images. First image becomes main image. ({totalImages}/{maxImages} images)
                          </p>
                        </div>
                      </div>
                      
                      <div className="admin-card" style={{ padding: '24px' }}>
                        {/* Upload Sections in Row */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '24px', 
                          marginBottom: '32px',
                          flexWrap: 'wrap'
                        }}>
                        {/* Bulk Upload Section */}
                          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>cloud_upload</span>
                            Bulk Upload Images
                          </h5>
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (remainingSlots > 0 && !uploadingImages[variantIndex]) {
                                handleBulkImageUpload(variantIndex, e.dataTransfer.files);
                              }
                            }}
                            style={{
                              border: '2px dashed #cbd5e1',
                              borderRadius: '8px',
                              padding: '20px',
                              textAlign: 'center',
                              backgroundColor: uploadingImages[variantIndex] ? '#f3f4f6' : '#fafafa',
                              cursor: uploadingImages[variantIndex] || remainingSlots === 0 ? 'not-allowed' : 'pointer',
                              opacity: uploadingImages[variantIndex] || remainingSlots === 0 ? 0.6 : 1,
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              minHeight: '180px'
                            }}
                            onMouseEnter={(e) => {
                              if (!uploadingImages[variantIndex] && remainingSlots > 0) {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.backgroundColor = '#fafafa';
                            }}
                          >
                            {uploadingImages[variantIndex] ? (
                              <div>
                                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#3b82f6' }}>hourglass_empty</span>
                                <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>Uploading images...</p>
                              </div>
                            ) : remainingSlots === 0 ? (
                              <div>
                                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#9ca3af' }}>image</span>
                                <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>Maximum {maxImages} images reached</p>
                              </div>
                            ) : (
                              <>
                                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#3b82f6' }}>cloud_upload</span>
                                <p style={{ marginTop: '8px', color: '#374151', fontWeight: '500', fontSize: '14px' }}>
                                  Drag and drop images here, or click to select
                                </p>
                                <p style={{ marginTop: '4px', color: '#6b7280', fontSize: '12px' }}>
                                  You can upload up to {remainingSlots} more image{remainingSlots !== 1 ? 's' : ''} (Max {maxImages} total)
                                </p>
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  style={{ display: 'none' }}
                                  id={`bulk-upload-${variantIndex}`}
                                  onChange={(e) => {
                                    if (e.target.files && remainingSlots > 0) {
                                      handleBulkImageUpload(variantIndex, e.target.files);
                                    }
                                    e.target.value = '';
                                  }}
                                  disabled={uploadingImages[variantIndex] || remainingSlots === 0}
                                />
                                <label
                                  htmlFor={`bulk-upload-${variantIndex}`}
                                  style={{
                                    display: 'inline-block',
                                    marginTop: '12px',
                                    padding: '6px 14px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                  }}
                                >
                                  Select Images
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Video URL Section */}
                          <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>videocam</span>
                            Video URL
                          </h5>
                          
                          {/* Video Upload Section */}
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!uploadingVideo[variantIndex]) {
                                const file = e.dataTransfer.files[0];
                                if (file) {
                                  handleVideoUpload(variantIndex, file);
                                }
                              }
                            }}
                            style={{
                              border: '2px dashed #cbd5e1',
                              borderRadius: '8px',
                              padding: '20px',
                              textAlign: 'center',
                              backgroundColor: uploadingVideo[variantIndex] ? '#f3f4f6' : '#fafafa',
                              cursor: uploadingVideo[variantIndex] ? 'not-allowed' : 'pointer',
                              opacity: uploadingVideo[variantIndex] ? 0.6 : 1,
                              transition: 'all 0.2s',
                              marginBottom: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              minHeight: '180px'
                            }}
                            onMouseEnter={(e) => {
                              if (!uploadingVideo[variantIndex]) {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.backgroundColor = '#eff6ff';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.backgroundColor = uploadingVideo[variantIndex] ? '#f3f4f6' : '#fafafa';
                            }}
                          >
                            {uploadingVideo[variantIndex] ? (
                              <div>
                                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#3b82f6' }}>hourglass_empty</span>
                                <p style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>Uploading video...</p>
                                <div style={{ width: '100%', marginTop: '12px', padding: '0 12px' }}>
                                  <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    marginBottom: '6px',
                                    fontSize: '13px',
                                    color: '#374151',
                                    fontWeight: '500'
                                  }}>
                                    <span>Progress</span>
                                    <span>{videoUploadProgress[variantIndex] || 0}%</span>
                                  </div>
                                  <div style={{
                                    width: '100%',
                                    height: '8px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      width: `${videoUploadProgress[variantIndex] || 0}%`,
                                      height: '100%',
                                      backgroundColor: '#3b82f6',
                                      transition: 'width 0.3s ease',
                                      borderRadius: '4px'
                                    }} />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#3b82f6' }}>cloud_upload</span>
                                <p style={{ marginTop: '8px', color: '#374151', fontWeight: '500', fontSize: '14px' }}>
                                  Drag and drop video here, or click to select
                                </p>
                                <p style={{ marginTop: '4px', color: '#6b7280', fontSize: '12px' }}>
                                  Supported formats: MP4, MOV, AVI, WebM, OGG (Max 500MB)
                                </p>
                                <input
                                  type="file"
                                  accept="video/*"
                                  style={{ display: 'none' }}
                                  id={`video-upload-${variantIndex}`}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleVideoUpload(variantIndex, file);
                                    }
                                    e.target.value = '';
                                  }}
                                  disabled={uploadingVideo[variantIndex]}
                                />
                                <label
                                  htmlFor={`video-upload-${variantIndex}`}
                                  style={{
                                    display: 'inline-block',
                                    marginTop: '12px',
                                    padding: '6px 14px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500'
                                  }}
                                >
                                  Select Video
                                </label>
                              </>
                            )}
                          </div>
                          </div>
                          </div>
                          
                        {/* Video URL Input and Preview - Full Width Below Upload Sections */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          alignItems: 'flex-start',
                          marginTop: '24px',
                          width: '100%'
                        }}>
                          <div style={{ flex: '1', minWidth: '200px' }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '13px', 
                              fontWeight: '500', 
                              color: '#374151', 
                              marginBottom: '6px' 
                            }}>
                              Video URL (YouTube, Vimeo, or Cloudinary URL)
                            </label>
                            <input
                              type="url"
                              value={variant.video_url || ''}
                              onChange={(e) => handleVariantChange(variantIndex, 'video_url', e.target.value)}
                              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or upload above"
                              className="admin-input"
                              style={{ 
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: '13px',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                              }}
                            />
                            {variant.video_url && (
                              <p style={{ 
                                fontSize: '11px', 
                                color: '#6b7280', 
                                marginTop: '6px', 
                                wordBreak: 'break-all',
                                lineHeight: '1.4'
                              }}>
                                {variant.video_url}
                              </p>
                            )}
                          </div>
                          {variant.video_url && variant.video_url.includes('cloudinary.com') && (
                            <div style={{ 
                              flexShrink: 0,
                              width: '180px'
                            }}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '13px', 
                                fontWeight: '500', 
                                color: '#374151', 
                                marginBottom: '6px' 
                              }}>
                                Preview
                              </label>
                                    <video
                                      src={variant.video_url}
                                      controls
                                      style={{
                                        width: '100%',
                                  borderRadius: '6px',
                                  backgroundColor: '#000',
                                  maxHeight: '120px',
                                  objectFit: 'contain'
                                      }}
                                    >
                                      Your browser does not support the video tag.
                                    </video>
                                  </div>
                                )}
                        </div>
                        
                        {/* Unified Images Section */}
                        <div>
                          <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginTop: '24px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>photo_library</span>
                            Images ({getAllImages(variant).length})
                            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400', marginLeft: '8px' }}>
                              (First image is main)
                            </span>
                          </h5>
                          
                          {/* Manual Image URL Addition */}
                          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <h6 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>link</span>
                              Add Image by URL
                            </h6>
                            <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-2">
                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Image URL</label>
                                <input
                                  type="url"
                                  id={`manual-image-url-${variantIndex}`}
                                  placeholder="https://example.com/image.jpg"
                                  className="admin-input"
                                  style={{ fontSize: '13px', padding: '6px 10px' }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      const input = e.target as HTMLInputElement;
                                      const url = input.value.trim();
                                      if (url) {
                                        handleAddImageByUrl(variantIndex, url);
                                        input.value = '';
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                                <label style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>Alt Text (Optional)</label>
                                <input
                                  type="text"
                                  id={`manual-image-alt-${variantIndex}`}
                                  placeholder="Image description"
                                  className="admin-input"
                                  style={{ fontSize: '13px', padding: '6px 10px' }}
                                />
                              </div>
                              <div className="tw-flex tw-items-end">
                                <button
                                  type="button"
                                  className="admin-modern-btn primary"
                                  onClick={() => {
                                    const urlInput = document.getElementById(`manual-image-url-${variantIndex}`) as HTMLInputElement;
                                    const altInput = document.getElementById(`manual-image-alt-${variantIndex}`) as HTMLInputElement;
                                    const url = urlInput?.value.trim();
                                    if (url) {
                                      handleAddImageByUrl(variantIndex, url, altInput?.value.trim() || '');
                                      urlInput.value = '';
                                      if (altInput) altInput.value = '';
                                    }
                                  }}
                                  style={{ width: '100%', padding: '6px 12px', fontSize: '13px' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '4px' }}>add</span>
                                  Add Image
                                </button>
                              </div>
                            </div>
                          </div>
                          
                        <div className="tw-space-y-3">
                            {getAllImages(variant).map((img, imgIndex) => (
                              <div
                                key={imgIndex}
                                style={{
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  padding: '12px',
                                  backgroundColor: imgIndex === 0 ? '#eff6ff' : '#fafafa',
                                  transition: 'all 0.2s',
                                  borderColor: imgIndex === 0 ? '#3b82f6' : '#e5e7eb'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                  e.currentTarget.style.backgroundColor = '#f0f9ff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = imgIndex === 0 ? '#3b82f6' : '#e5e7eb';
                                  e.currentTarget.style.backgroundColor = imgIndex === 0 ? '#eff6ff' : '#fafafa';
                                }}
                              >
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                  {/* Image Preview */}
                                  <div style={{ flexShrink: 0, width: '100px' }}>
                                  {img.image ? (
                                      <div style={{ 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '6px', 
                                        overflow: 'hidden', 
                                        backgroundColor: '#fff',
                                        position: 'relative',
                                        height: '80px'
                                      }}>
                                        {imgIndex === 0 && (
                                          <span style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            fontSize: '9px',
                                            fontWeight: '600',
                                            zIndex: 10
                                          }}>MAIN</span>
                                        )}
                                      <img 
                                        src={img.image} 
                                        alt={img.alt_text || 'Variant image'} 
                                        style={{ 
                                          width: '100%', 
                                          height: '100%', 
                                          objectFit: 'contain',
                                          display: 'block'
                                        }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E';
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div style={{ 
                                      border: '2px dashed #d1d5db', 
                                      borderRadius: '6px', 
                                      padding: '8px', 
                                      textAlign: 'center', 
                                      backgroundColor: '#fff', 
                                      height: '80px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <span className="material-symbols-outlined" style={{ color: '#9ca3af', fontSize: '20px' }}>image</span>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Up/Down Buttons */}
                                <div style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  gap: '4px',
                                  flexShrink: 0,
                                  paddingTop: '4px'
                                }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(variantIndex, imgIndex, 'up')}
                                    disabled={imgIndex === 0}
                                    style={{
                                      padding: '4px',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '4px',
                                      backgroundColor: imgIndex === 0 ? '#f3f4f6' : '#fff',
                                      cursor: imgIndex === 0 ? 'not-allowed' : 'pointer',
                                      color: imgIndex === 0 ? '#9ca3af' : '#374151',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (imgIndex !== 0) {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = '#d1d5db';
                                      e.currentTarget.style.backgroundColor = imgIndex === 0 ? '#f3f4f6' : '#fff';
                                    }}
                                    title="Move Up"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_upward</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveImage(variantIndex, imgIndex, 'down')}
                                    disabled={imgIndex === getAllImages(variant).length - 1}
                                    style={{
                                      padding: '4px',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '4px',
                                      backgroundColor: imgIndex === getAllImages(variant).length - 1 ? '#f3f4f6' : '#fff',
                                      cursor: imgIndex === getAllImages(variant).length - 1 ? 'not-allowed' : 'pointer',
                                      color: imgIndex === getAllImages(variant).length - 1 ? '#9ca3af' : '#374151',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (imgIndex !== getAllImages(variant).length - 1) {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = '#d1d5db';
                                      e.currentTarget.style.backgroundColor = imgIndex === getAllImages(variant).length - 1 ? '#f3f4f6' : '#fff';
                                    }}
                                    title="Move Down"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_downward</span>
                                  </button>
                                </div>
                                
                                {/* Input Fields - Side by Side */}
                                <div style={{ flex: '1', display: 'flex', gap: '12px' }}>
                                  <div style={{ flex: '1' }}>
                                    <label style={{ 
                                      display: 'block', 
                                      fontSize: '12px', 
                                      fontWeight: '500', 
                                      color: '#374151', 
                                      marginBottom: '4px' 
                                    }}>
                                      Image URL
                                    </label>
                                    <input
                                      type="url"
                                      value={img.image}
                                      onChange={(e) => handleVariantImageChange(variantIndex, imgIndex, 'image', e.target.value)}
                                      placeholder="https://example.com/image.jpg"
                                      className="admin-input"
                                      style={{ 
                                        width: '100%',
                                        padding: '6px 10px',
                                        fontSize: '13px'
                                      }}
                                    />
                                  </div>
                                  <div style={{ flex: '1' }}>
                                    <label style={{ 
                                      display: 'block', 
                                      fontSize: '12px', 
                                      fontWeight: '500', 
                                      color: '#374151', 
                                      marginBottom: '4px' 
                                    }}>
                                      Alt Text
                                    </label>
                                      <input
                                        type="text"
                                        value={img.alt_text}
                                        onChange={(e) => handleVariantImageChange(variantIndex, imgIndex, 'alt_text', e.target.value)}
                                        placeholder="Image description"
                                        className="admin-input"
                                      style={{ 
                                        width: '100%',
                                        padding: '6px 10px',
                                        fontSize: '13px'
                                      }}
                                      />
                                    </div>
                                    </div>
                                
                                {/* Delete Button */}
                                <div style={{ flexShrink: 0, paddingTop: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariantImage(variantIndex, imgIndex)}
                                    title="Remove Image"
                                    style={{
                                      padding: '6px',
                                      border: '1px solid #ef4444',
                                      borderRadius: '4px',
                                      backgroundColor: '#fff',
                                      cursor: 'pointer',
                                      color: '#ef4444',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fef2f2';
                                      e.currentTarget.style.borderColor = '#dc2626';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#fff';
                                      e.currentTarget.style.borderColor = '#ef4444';
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                            {getAllImages(variant).length === 0 && (
                            <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                              <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">photo_library</span>
                                <p className="tw-mt-2">No images added</p>
                                <p className="tw-text-xs tw-text-gray-400 tw-mt-1">Upload images above to add them here</p>
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                // Variant Specifications Section
                if (activeSection === 'variant-specs') {
                  return (
                    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                      <div style={{ marginBottom: '24px' }}>
                        <div>
                          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                            Variant {variantIndex + 1} - Specification Template
                          </h2>
                          <p style={{ color: '#6b7280', fontSize: '14px' }}>
                            Manage specifications for this variant
                          </p>
                        </div>
                      </div>
                      
                      <div className="admin-card" style={{ padding: '24px' }}>
                        {/* Specifications */}
                        <div style={{ marginBottom: '32px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>list</span>
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
                            {sortSpecsByTemplate(variant.specifications || [], 'specifications')
                              .map((spec, sortedIndex) => {
                              // Find original index after sorting
                              const originalIndex = variant.specifications?.findIndex(s => s === spec) ?? sortedIndex;
                              return (
                              <div key={spec.id || `spec-${originalIndex}-${spec.name}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                                <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={spec.name}
                                      onChange={(e) => handleVariantSpecificationChange(variantIndex, originalIndex, 'name', e.target.value)}
                                      placeholder="e.g., Brand, Depth, Style"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                                    <input
                                      type="text"
                                      value={spec.value}
                                      onChange={(e) => handleVariantSpecificationChange(variantIndex, originalIndex, 'value', e.target.value)}
                                      placeholder="e.g., Atomberg, 12 inch, Modern"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="tw-flex tw-items-end">
                                  <button
                                    type="button"
                                    className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                                    onClick={() => handleRemoveVariantSpecification(variantIndex, originalIndex)}
                                  >
                                    <span className="material-symbols-outlined tw-text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            );
                            })}
                            {(!variant.specifications || variant.specifications.length === 0) && (
                              <div className="tw-text-center tw-py-6 tw-text-gray-500 tw-border-2 tw-border-dashed tw-border-gray-300 tw-rounded-lg">
                                <span className="material-symbols-outlined tw-text-4xl tw-text-gray-400">list</span>
                                <p className="tw-mt-2">No specifications added for this variant</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Measurement Specifications */}
                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>straighten</span>
                            Measurement Specifications ({variant.measurement_specs?.length || 0})
                          </h5>
                          <button 
                            type="button" 
                            className="admin-modern-btn secondary"
                            onClick={() => {
                              const updated = [...variants];
                              updated[variantIndex].measurement_specs = [...(updated[variantIndex].measurement_specs || []), {
                                name: '',
                                value: '',
                                sort_order: updated[variantIndex].measurement_specs?.length || 0
                              }];
                              setVariants(updated);
                            }}
                          >
                            <span className="material-symbols-outlined">add</span>
                            Add Measurement Spec
                          </button>
                          </div>
                          <div className="tw-space-y-3">
                            {variant.measurement_specs?.map((spec, specIndex) => (
                              <div key={specIndex} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                                <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={spec.name}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        if (updated[variantIndex].measurement_specs) {
                                        updated[variantIndex].measurement_specs[specIndex] = { ...spec, name: e.target.value };
                                        }
                                        setVariants(updated);
                                      }}
                                      placeholder="e.g., Length, Width, Height"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                                    <input
                                      type="text"
                                      value={spec.value}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        if (updated[variantIndex].measurement_specs) {
                                        updated[variantIndex].measurement_specs[specIndex] = { ...spec, value: e.target.value };
                                        }
                                        setVariants(updated);
                                      }}
                                      placeholder="e.g., 64 x 29 x 36 inch"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="tw-flex tw-items-end">
                                  <button
                                    type="button"
                                    className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors"
                                    onClick={() => {
                                      const updated = [...variants];
                                      if (updated[variantIndex].measurement_specs) {
                                      updated[variantIndex].measurement_specs = updated[variantIndex].measurement_specs.filter((_, i) => i !== specIndex);
                                      }
                                      setVariants(updated);
                                    }}
                                  >
                                    <span className="material-symbols-outlined tw-text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Style Specifications */}
                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>palette</span>
                            Style Specifications ({variant.style_specs?.length || 0})
                          </h5>
                          <button 
                            type="button" 
                            className="admin-modern-btn secondary"
                            onClick={() => handleAddVariantStyleSpec(variantIndex)}
                          >
                            <span className="material-symbols-outlined">add</span>
                            Add Style Spec
                          </button>
                          </div>
                          <div className="tw-space-y-3">
                            {sortSpecsByTemplate(variant.style_specs || [], 'style_specs')
                              .map((spec, sortedIndex) => {
                              // Find original index after sorting
                              const originalIndex = variant.style_specs?.findIndex(s => s === spec) ?? sortedIndex;
                              return (
                              <div key={spec.id || `style-${originalIndex}-${spec.name}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                                <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={spec.name}
                                      onChange={(e) => handleVariantStyleSpecChange(variantIndex, originalIndex, 'name', e.target.value)}
                                      placeholder="e.g., Colour, Style, Shape"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                                    <input
                                      type="text"
                                      value={spec.value}
                                      onChange={(e) => handleVariantStyleSpecChange(variantIndex, originalIndex, 'value', e.target.value)}
                                      placeholder="e.g., Grey & Beige, Modern, Rectangular"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="tw-flex tw-items-end">
                                  <button
                                    type="button"
                                    className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors"
                                    onClick={() => handleRemoveVariantStyleSpec(variantIndex, originalIndex)}
                                  >
                                    <span className="material-symbols-outlined tw-text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        </div>
                        
                        {/* Features */}
                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
                            Features ({variant.features?.length || 0})
                          </h5>
                          <button 
                            type="button" 
                            className="admin-modern-btn secondary"
                            onClick={() => {
                              const updated = [...variants];
                              updated[variantIndex].features = [...(updated[variantIndex].features || []), {
                                name: '',
                                value: '',
                                sort_order: updated[variantIndex].features?.length || 0
                              }];
                              setVariants(updated);
                            }}
                          >
                            <span className="material-symbols-outlined">add</span>
                            Add Feature
                          </button>
                          </div>
                          <div className="tw-space-y-3">
                            {variant.features?.map((spec, specIndex) => (
                              <div key={specIndex} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                                <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={spec.name}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        if (updated[variantIndex].features) {
                                        updated[variantIndex].features[specIndex] = { ...spec, name: e.target.value };
                                        }
                                        setVariants(updated);
                                      }}
                                      placeholder="e.g., Weight Capacity, Seating Capacity"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                                    <input
                                      type="text"
                                      value={spec.value}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        if (updated[variantIndex].features) {
                                        updated[variantIndex].features[specIndex] = { ...spec, value: e.target.value };
                                        }
                                        setVariants(updated);
                                      }}
                                      placeholder="e.g., 450 Kilograms, 3.0"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="tw-flex tw-items-end">
                                  <button
                                    type="button"
                                    className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors"
                                    onClick={() => {
                                      const updated = [...variants];
                                      if (updated[variantIndex].features) {
                                      updated[variantIndex].features = updated[variantIndex].features.filter((_, i) => i !== specIndex);
                                      }
                                      setVariants(updated);
                                    }}
                                  >
                                    <span className="material-symbols-outlined tw-text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* User Guide */}
                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>menu_book</span>
                            User Guide ({variant.user_guide?.length || 0})
                          </h5>
                          <button 
                            type="button" 
                            className="admin-modern-btn secondary"
                            onClick={() => {
                              const updated = [...variants];
                              updated[variantIndex].user_guide = [...(updated[variantIndex].user_guide || []), {
                                name: '',
                                value: '',
                                sort_order: updated[variantIndex].user_guide?.length || 0
                              }];
                              setVariants(updated);
                            }}
                          >
                            <span className="material-symbols-outlined">add</span>
                            Add User Guide
                          </button>
                          </div>
                          <div className="tw-space-y-3">
                            {variant.user_guide?.map((spec, specIndex) => (
                              <div key={specIndex} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                                <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={spec.name}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        if (updated[variantIndex].user_guide) {
                                        updated[variantIndex].user_guide[specIndex] = { ...spec, name: e.target.value };
                                        }
                                        setVariants(updated);
                                      }}
                                      placeholder="e.g., Assembly, Care Instructions"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                                    <input
                                      type="text"
                                      value={spec.value}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        if (updated[variantIndex].user_guide) {
                                        updated[variantIndex].user_guide[specIndex] = { ...spec, value: e.target.value };
                                        }
                                        setVariants(updated);
                                      }}
                                      placeholder="e.g., Required, Wipe with dry cloth"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="tw-flex tw-items-end">
                                  <button
                                    type="button"
                                    className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors"
                                    onClick={() => {
                                      const updated = [...variants];
                                      if (updated[variantIndex].user_guide) {
                                      updated[variantIndex].user_guide = updated[variantIndex].user_guide.filter((_, i) => i !== specIndex);
                                      }
                                      setVariants(updated);
                                    }}
                                  >
                                    <span className="material-symbols-outlined tw-text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Item Details */}
                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h5 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>inventory_2</span>
                            Item Details ({variant.item_details?.length || 0})
                          </h5>
                          <button 
                            type="button" 
                            className="admin-modern-btn secondary"
                            onClick={() => {
                              const updated = [...variants];
                              updated[variantIndex].item_details = [...(updated[variantIndex].item_details || []), {
                                name: '',
                                value: '',
                                sort_order: updated[variantIndex].item_details?.length || 0
                              }];
                              setVariants(updated);
                            }}
                          >
                            <span className="material-symbols-outlined">add</span>
                            Add Item Detail
                          </button>
                          </div>
                          <div className="tw-space-y-3">
                            {variant.item_details?.map((spec, specIndex) => (
                              <div key={specIndex} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                                <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={spec.name}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        if (updated[variantIndex].item_details) {
                                        updated[variantIndex].item_details[specIndex] = { ...spec, name: e.target.value };
                                        }
                                        setVariants(updated);
                                      }}
                                      placeholder="e.g., Warranty, Package Contents"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                                    <input
                                      type="text"
                                      value={spec.value}
                                      onChange={(e) => {
                                        const updated = [...variants];
                                        if (updated[variantIndex].item_details) {
                                        updated[variantIndex].item_details[specIndex] = { ...spec, value: e.target.value };
                                        }
                                        setVariants(updated);
                                      }}
                                      placeholder="e.g., 1 Year, Package Contents"
                                      className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                                    />
                                  </div>
                                </div>
                                <div className="tw-flex tw-items-end">
                                  <button
                                    type="button"
                                    className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors"
                                    onClick={() => {
                                      const updated = [...variants];
                                      if (updated[variantIndex].item_details) {
                                      updated[variantIndex].item_details = updated[variantIndex].item_details.filter((_, i) => i !== specIndex);
                                      }
                                      setVariants(updated);
                                    }}
                                  >
                                    <span className="material-symbols-outlined tw-text-lg">delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                return null;
              })()
            )}
            
            {/* Variants List View - Show when no specific variant is selected */}
            {activeSection === 'variants' && activeVariantIndex === null && variants.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827' }}>Product Variants</h2>
                  <button 
                    type="button" 
                    className="admin-modern-btn primary"
                    onClick={handleAddVariant}
                  >
                    <span className="material-symbols-outlined">add</span>
                    Add Variant
                  </button>
                </div>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Select a variant from the sidebar to edit its details, images, or specifications.
                </p>
              </div>
            )}
            
            {/* Show variant list if no variants exist */}
            {activeSection === 'variants' && variants.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#9ca3af', marginBottom: '16px' }}>
                  style
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  No Variants Yet
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                  Add your first variant to get started
                </p>
                <button 
                  type="button" 
                  className="admin-modern-btn primary"
                  onClick={handleAddVariant}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Variant
                </button>
              </div>
            )}
            
            {/* Old Variants Tab - Keep for backward compatibility during transition */}
            {false && activeSection === 'variants-old' && (
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
                        onClick={() => {
                          // Navigate to variant images section for bulk upload
                          navigateToVariantSection(variantIndex, 'variant-images');
                        }}
                    >
                            <span className="material-symbols-outlined">add</span>
                        Manage Images
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
                    {[...(variant.specifications || [])]
                      .sort((a, b) => {
                        // Sort: template items first, then non-template items
                        const templateSpecs = categorySpecTemplates.specifications || [];
                        const templateFieldNames = new Set(templateSpecs.map(t => t.field_name.toLowerCase()));
                        const aName = (a.name || '').toLowerCase();
                        const bName = (b.name || '').toLowerCase();
                        const aInTemplate = templateFieldNames.has(aName);
                        const bInTemplate = templateFieldNames.has(bName);
                        
                        // Template items come first
                        if (aInTemplate && !bInTemplate) return -1;
                        if (!aInTemplate && bInTemplate) return 1;
                        
                        // Both in template: sort by template order
                        if (aInTemplate && bInTemplate) {
                          const aTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === aName);
                          const bTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === bName);
                          if (aTemplate && bTemplate) {
                            return aTemplate.sort_order - bTemplate.sort_order;
                          }
                        }
                        
                        // Both not in template: sort by sort_order
                        return (a.sort_order || 0) - (b.sort_order || 0);
                      })
                      .map((spec, sortedIndex) => {
                      // Find original index after sorting
                      const originalIndex = variant.specifications?.findIndex(s => s === spec) ?? sortedIndex;
                      return (
                      <div key={spec.id || `spec-${originalIndex}-${spec.name}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                      <div>
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                        <input
                          type="text"
                          value={spec.name}
                              onChange={(e) => handleVariantSpecificationChange(variantIndex, originalIndex, 'name', e.target.value)}
                              placeholder="e.g., Brand, Depth, Style"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      <div>
                        <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                        <input
                          type="text"
                          value={spec.value}
                              onChange={(e) => handleVariantSpecificationChange(variantIndex, originalIndex, 'value', e.target.value)}
                              placeholder="e.g., Atomberg, 12 inch, Modern"
                          className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                        />
                      </div>
                      </div>
                      <div className="tw-flex tw-items-end">
                        <button
                          type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantSpecification(variantIndex, originalIndex)}
                        >
                          <span className="material-symbols-outlined tw-text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                    );
                    })}
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
                    {[...(variant.measurement_specs || [])]
                      .sort((a, b) => {
                        // Sort: template items first, then non-template items
                        const templateSpecs = categorySpecTemplates.measurement_specs || [];
                        const templateFieldNames = new Set(templateSpecs.map(t => t.field_name.toLowerCase()));
                        const aName = (a.name || '').toLowerCase();
                        const bName = (b.name || '').toLowerCase();
                        const aInTemplate = templateFieldNames.has(aName);
                        const bInTemplate = templateFieldNames.has(bName);
                        
                        // Template items come first
                        if (aInTemplate && !bInTemplate) return -1;
                        if (!aInTemplate && bInTemplate) return 1;
                        
                        // Both in template: sort by template order
                        if (aInTemplate && bInTemplate) {
                          const aTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === aName);
                          const bTemplate = templateSpecs.find(t => t.field_name.toLowerCase() === bName);
                          if (aTemplate && bTemplate) {
                            return aTemplate.sort_order - bTemplate.sort_order;
                          }
                        }
                        
                        // Both not in template: sort by sort_order
                        return (a.sort_order || 0) - (b.sort_order || 0);
                      })
                      .map((spec, sortedIndex) => {
                      // Find original index after sorting
                      const originalIndex = variant.measurement_specs?.findIndex(s => s === spec) ?? sortedIndex;
                      return (
                      <div key={spec.id || `spec-${originalIndex}-${spec.name}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantMeasurementSpecChange(variantIndex, originalIndex, 'name', e.target.value)}
                              placeholder="e.g., Dimensions, Weight"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantMeasurementSpecChange(variantIndex, originalIndex, 'value', e.target.value)}
                              placeholder="e.g., 64 x 29 x 36 inch, 45 kg"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantMeasurementSpec(variantIndex, originalIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                    })}
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
                    {sortSpecsByTemplate(variant.style_specs || [], 'style_specs')
                      .map((spec, sortedIndex) => {
                      // Find original index after sorting
                      const originalIndex = variant.style_specs?.findIndex(s => s === spec) ?? sortedIndex;
                      return (
                      <div key={spec.id || `style-${originalIndex}-${spec.name}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantStyleSpecChange(variantIndex, originalIndex, 'name', e.target.value)}
                              placeholder="e.g., Colour, Style, Shape"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantStyleSpecChange(variantIndex, originalIndex, 'value', e.target.value)}
                              placeholder="e.g., Grey & Beige, Modern, Rectangular"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantStyleSpec(variantIndex, originalIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                    })}
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
                    {sortSpecsByTemplate(variant.features || [], 'features')
                      .map((spec, sortedIndex) => {
                      // Find original index after sorting
                      const originalIndex = variant.features?.findIndex(s => s === spec) ?? sortedIndex;
                      return (
                      <div key={spec.id || `feature-${originalIndex}-${spec.name}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantFeatureChange(variantIndex, originalIndex, 'name', e.target.value)}
                              placeholder="e.g., Weight Capacity Maximum, Seating Capacity"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantFeatureChange(variantIndex, originalIndex, 'value', e.target.value)}
                              placeholder="e.g., 450 Kilograms, 3.0"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantFeature(variantIndex, originalIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                    })}
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
                    {sortSpecsByTemplate(variant.user_guide || [], 'user_guide')
                      .map((spec, sortedIndex) => {
                      // Find original index after sorting
                      const originalIndex = variant.user_guide?.findIndex(s => s === spec) ?? sortedIndex;
                      return (
                      <div key={spec.id || `userguide-${originalIndex}-${spec.name}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantUserGuideChange(variantIndex, originalIndex, 'name', e.target.value)}
                              placeholder="e.g., Assembly, Care Instructions"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantUserGuideChange(variantIndex, originalIndex, 'value', e.target.value)}
                              placeholder="e.g., Required, Wipe with dry cloth"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantUserGuide(variantIndex, originalIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                    })}
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
                    {sortSpecsByTemplate(variant.item_details || [], 'item_details')
                      .map((spec, sortedIndex) => {
                      // Find original index after sorting
                      const originalIndex = variant.item_details?.findIndex(s => s === spec) ?? sortedIndex;
                      return (
                      <div key={spec.id || `itemdetail-${originalIndex}-${spec.name}`} className="tw-p-4 tw-bg-gray-50 tw-border tw-border-gray-200 tw-rounded-lg tw-flex tw-gap-3">
                        <div className="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-3">
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Name</label>
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleVariantItemDetailChange(variantIndex, originalIndex, 'name', e.target.value)}
                              placeholder="e.g., Assembly, Warranty, Weight"
                              className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                            />
                          </div>
                          <div>
                            <label className="tw-block tw-text-xs tw-font-medium tw-text-gray-600 tw-mb-1">Value</label>
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleVariantItemDetailChange(variantIndex, originalIndex, 'value', e.target.value)}
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
                            onChange={(e) => handleVariantItemDetailChange(variantIndex, originalIndex, 'sort_order', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent tw-text-sm"
                          />
                        </div>
                        <div className="tw-flex tw-items-end">
                          <button
                            type="button"
                            className="tw-px-3 tw-py-2 tw-bg-red-50 tw-text-red-600 tw-rounded-md hover:tw-bg-red-100 tw-transition-colors tw-flex tw-items-center tw-justify-center"
                            onClick={() => handleRemoveVariantItemDetail(variantIndex, originalIndex)}
                          >
                            <span className="material-symbols-outlined tw-text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    );
                    })}
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
        
            {/* Details Section */}
            {activeSection === 'details' && (
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
          </div>
          {/* End Right Content Panel */}
        </div>
        {/* End Sidebar Layout */}
      </form>
      </div>
      
      {/* Styles for sidebar navigation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .admin-product-detail .sidebar-nav-item {
          transition: all 0.2s ease;
        }
        
        .admin-product-detail .sidebar-nav-item:hover {
          background-color: #f3f4f6;
        }
        
        .admin-product-detail .sidebar-nav-item.active {
          background-color: #eff6ff;
          border-left-color: #3b82f6;
          color: #1e40af;
          font-weight: 600;
        }
      `}</style>
    </div>
    </div>
  );
};

export default AdminProductDetail;

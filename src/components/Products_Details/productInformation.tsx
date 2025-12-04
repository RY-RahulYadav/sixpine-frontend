import { Ruler, Paintbrush, Package, Book, Feather, Check } from "lucide-react";
import styles from "./productInformation.module.css";

interface ProductInformationProps {
  product: any;
  selectedVariant?: any;
}

const ProductInformation = ({ product, selectedVariant }: ProductInformationProps) => {
  // Function to format text with proper line breaks and paragraphs
  const formatDescription = (text: string | undefined) => {
    if (!text) return null;
    
    // Split by double line breaks to create paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    if (paragraphs.length === 0) return null;
    
    return paragraphs.map((paragraph, index) => (
      <p key={index} className={styles.descriptionParagraph}>
        {paragraph.trim().split('\n').map((line, lineIndex, lines) => (
          <span key={lineIndex}>
            {line.trim()}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    ));
  };

  return (
    <div id="product-info" className={styles.infocontainer}>
      <h2 className={styles.heading}>Product information</h2>

      <div className={styles.grid}>
        {/* Left Column */}
        
        {/* Brand & Measurement */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <strong>Brand:</strong> {product?.brand || "Sixpine"}
          </div>
          <div className={styles.cardHeader}>
            <Ruler size={16} /> <strong>Measurement</strong>
          </div>
          {/* Use variant measurement_specs if available, otherwise fallback to product dimensions/weight */}
          {selectedVariant?.measurement_specs && selectedVariant.measurement_specs.length > 0 ? (
            selectedVariant.measurement_specs.map((spec: any) => (
              <p key={spec.id || spec.name}><strong>{spec.name}:</strong> {spec.value}</p>
            ))
          ) : (
            <>
              {product?.dimensions && <p>Dimensions: {product.dimensions}</p>}
              {product?.weight && <p>Weight: {product.weight}</p>}
            </>
          )}
        </div>

        {/* Middle Column - First Row */}
        {/* Style */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Paintbrush size={16} /> <strong>Style</strong>
          </div>
          <div className={styles.descriptionText}>
            {/* Use variant style_specs if available, otherwise fallback to product style_description */}
            {selectedVariant?.style_specs && selectedVariant.style_specs.length > 0 ? (
              selectedVariant.style_specs.map((spec: any) => (
                <p key={spec.id || spec.name}><strong>{spec.name}:</strong> {spec.value}</p>
              ))
            ) : (
              formatDescription(product?.style_description || product?.long_description || product?.short_description) || (
                <p>Contemporary design with smooth edges and minimalist finish, perfect for modern interiors.</p>
              )
            )}
          </div>
         
        </div>

        {/* Right Column */}
        {/* Item Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Package size={16} /> <strong>Item Details</strong>
          </div>
          <ul>
            {/* Use variant item_details if available, otherwise fallback to product specifications */}
            {selectedVariant?.item_details && selectedVariant.item_details.length > 0 ? (
              selectedVariant.item_details.map((detail: any) => (
                <li key={detail.id || detail.name}><strong>{detail.name}:</strong> {detail.value}</li>
              ))
            ) : (
              <>
            {product?.specifications?.map((spec: any, index: number) => (
              <li key={index}>{spec.name}: {spec.value}</li>
            ))}
            {product?.warranty && <li>Warranty: {product.warranty}</li>}
            {product?.assembly_required !== undefined && (
              <li>Assembly: {product.assembly_required ? "Required" : "Not Required"}</li>
                )}
              </>
            )}
          </ul>
        </div>

        {/* Left Column - Second Row */}
        {/* Features */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Check size={16} /> <strong>Features</strong>
          </div>
          {/* Use variant features if available, otherwise fallback to product features */}
          {selectedVariant?.features && selectedVariant.features.length > 0 ? (
            <ul>
              {selectedVariant.features.map((feature: any) => (
                <li key={feature.id || feature.name}><strong>{feature.name}:</strong> {feature.value}</li>
              ))}
            </ul>
          ) : (
            <ul>
              {product?.features?.map((feature: any, index: number) => (
                <li key={index}>{feature.feature}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Middle Column - Second Row */}
        {/* User Guide */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Book size={16} /> <strong>User Guide</strong>
          </div>
          {/* Use variant user_guide if available, otherwise fallback to product user_guide */}
          {selectedVariant?.user_guide && selectedVariant.user_guide.length > 0 ? (
            selectedVariant.user_guide.map((guide: any) => (
              <p key={guide.id || guide.name}><strong>{guide.name}:</strong> {guide.value}</p>
            ))
          ) : product?.user_guide ? (
            <p>{product.user_guide}</p>
          ) : (
            <p>
              {product?.assembly_required ? 
                "Easy to assemble with included toolkit. Recommended to clean with a dry cloth and avoid direct sunlight to maintain finish." :
                "Ready to use out of the box. Recommended to clean with a dry cloth and avoid direct sunlight to maintain finish."
              }
            </p>
          )}
        </div>

        {/* Right Column - Second Row */}
        {/* Material & Care */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Feather size={16} /> <strong>Material & Care</strong>
          </div>
          <p>Material: {product?.material?.name || "High-quality materials"}</p>
          {product?.care_instructions && (
            <p>Care: {product.care_instructions}</p>
          )}
          {!product?.care_instructions && (
            <p>Care: Wipe with a dry soft cloth. Avoid water and harsh chemicals.</p>
          )}
        </div>
      </div>

      {/* Product Description */}
      <div className={styles.description}>
        <h3>Product Description</h3>
        <div className={styles.descriptionText}>
          {formatDescription(product?.long_description || product?.short_description) || (
            <p>Experience premium quality with our products, designed for modern living and professional use. Built with attention to detail and quality materials for long-lasting performance.</p>
          )}
        </div>
        
        

        <p>
          <strong>What is in box:</strong> 
          <br/>
          {product?.what_in_box || `${product?.title || "Product"}, Assembly parts, User manual`}
        </p>
      </div>
    </div>
  );
};

export default ProductInformation;

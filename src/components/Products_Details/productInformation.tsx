import { Ruler, Paintbrush, Package, Book, Feather, Check } from "lucide-react";
import styles from "./productInformation.module.css";

interface ProductInformationProps {
  product: any;
}

const ProductInformation = ({ product }: ProductInformationProps) => {
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
          {product?.dimensions && (
            <div className={styles.cardHeader}>
              <Ruler size={16} /> <strong>Measurement</strong>
            </div>
          )}
          {product?.dimensions && <p>Dimensions: {product.dimensions}</p>}
          {product?.weight && <p>Weight: {product.weight}</p>}
        </div>

        {/* Middle Column - First Row */}
        {/* Style */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Paintbrush size={16} /> <strong>Style</strong>
          </div>
          <p>
            {product?.long_description || product?.short_description || 
             "Contemporary design with smooth edges and minimalist finish, perfect for modern interiors."}
          </p>
        </div>

        {/* Right Column */}
        {/* Item Details */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Package size={16} /> <strong>Item Details</strong>
          </div>
          <ul>
            {product?.specifications?.map((spec: any, index: number) => (
              <li key={index}>{spec.name}: {spec.value}</li>
            ))}
            {product?.warranty && <li>Warranty: {product.warranty}</li>}
            {product?.assembly_required !== undefined && (
              <li>Assembly: {product.assembly_required ? "Required" : "Not Required"}</li>
            )}
          </ul>
        </div>

        {/* Left Column - Second Row */}
        {/* Features */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Check size={16} /> <strong>Features</strong>
          </div>
          <ul>
            {product?.features?.map((feature: any, index: number) => (
              <li key={index}>{feature.feature}</li>
            ))}
          </ul>
        </div>

        {/* Middle Column - Second Row */}
        {/* User Guide */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Book size={16} /> <strong>User Guide</strong>
          </div>
          {product?.user_guide ? (
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
        <p>
          {product?.long_description || product?.short_description || 
           "Experience premium quality with our products, designed for modern living and professional use. Built with attention to detail and quality materials for long-lasting performance."}
        </p>
        
        {product?.features && product.features.length > 0 && (
          <ul>
            {product.features.map((feature: any, index: number) => (
              <li key={index}>{feature.feature}</li>
            ))}
          </ul>
        )}

        <p>
          <strong>What is in box:</strong> 
          <br/>{product?.title || "Product"}, Assembly parts, User manual
        </p>
      </div>
    </div>
  );
};

export default ProductInformation;

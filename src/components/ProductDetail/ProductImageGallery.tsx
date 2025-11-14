import React from 'react';

interface ProductImageGalleryProps {
  images: string[];
  selectedImage: string;
  onImageSelect: (image: string) => void;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, selectedImage, onImageSelect }) => {
  return (
    <>
      <div
        className="main-image"
        id="product_select_img_container"
      >
        <div className="share_product">
          <i className="fa-solid fa-share"></i>
        </div>
        <img src={selectedImage} id="product_select_img" className="img-fluid border" alt="Product" />
      </div>

      <div className="d-flex gap-2 small-thumbs mt-3">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            className={`img-thumbnail ${selectedImage === image ? 'active' : ''}`}
            alt={`Thumb ${index + 1}`}
            onClick={() => onImageSelect(image)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </div>
    </>
  );
};

export default ProductImageGallery;

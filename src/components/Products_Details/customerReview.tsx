import { useState, useEffect } from "react";
import styles from "./customerReview.module.css";
import { productAPI } from "../../services/api";

interface CustomerReviewProps {
  product: any;
}

const CustomerReview = ({ product }: CustomerReviewProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    title: "",
    comment: "",
    reviewer_name: ""
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.slug) return;
      
      try {
        const response = await productAPI.getProductReviews(product.slug);
        // Handle paginated response - reviews are in response.data.results
        const reviewsData = response.data.results || response.data || [];
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [product?.slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isPDF && !isVideo) {
        alert(`${file.name} is not a valid file type. Please upload images, PDFs, or videos.`);
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      validFiles.push(file);

      // Create preview for images
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          setAttachmentPreviews([...previews]);
        };
        reader.readAsDataURL(file);
      } else {
        previews.push('');
      }
    });

    setAttachments([...attachments, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    const newPreviews = attachmentPreviews.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    setAttachmentPreviews(newPreviews);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.slug || newReview.rating === 0) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('rating', newReview.rating.toString());
      formData.append('title', newReview.title);
      formData.append('comment', newReview.comment);
      formData.append('reviewer_name', newReview.reviewer_name);

      // Append attachments
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      await productAPI.addReview(product.slug, formData);
      // Refresh reviews
      const response = await productAPI.getProductReviews(product.slug);
      setReviews(response.data.results || response.data || []);
      setNewReview({ rating: 0, title: "", comment: "", reviewer_name: "" });
      setAttachments([]);
      setAttachmentPreviews([]);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = Array.isArray(reviews) ? reviews.filter(review => review.rating === rating).length : 0;
    const percentage = Array.isArray(reviews) && reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return { rating, count, percentage };
  });
  return (
    <div className={styles.Reviewcontainer}>
      <div className={styles.reviewSection}>
        {/* Left Side - Review Summary */}
        <div className={styles.left}>
          <h4>Customer Reviews</h4>

          <div className={styles.bars}>
            {ratingDistribution.map(({ rating, percentage }) => (
              <div key={rating} className={styles.bar}>
                <span>{rating} ★</span>
                <div className={styles.progress}>
                  <div 
                    className={`${styles.fill} ${styles[`fill${rating}`]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span>{percentage}%</span>
              </div>
            ))}
          </div>

          {/* Add Review Form */}
          <div className={styles.addReview}>
            <h4>Add Your Review</h4>
            <form onSubmit={handleSubmitReview}>
              <div className={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star}
                    onClick={() => setNewReview({...newReview, rating: star})}
                    style={{ cursor: 'pointer', color: star <= newReview.rating ? '#ffc107' : '#ccc' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Your Name" 
                value={newReview.reviewer_name}
                onChange={(e) => setNewReview({...newReview, reviewer_name: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Review Title" 
                value={newReview.title}
                onChange={(e) => setNewReview({...newReview, title: e.target.value})}
              />
              <textarea 
                placeholder="Write your review here..." 
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                required
              ></textarea>
              
              {/* File Upload */}
              <div className={styles.fileUploadSection}>
                <label htmlFor="review-attachments" className={styles.fileUploadLabel}>
                  Attach Files (Images, PDFs, Videos) - Max 10MB each
                </label>
                <input
                  id="review-attachments"
                  type="file"
                  multiple
                  accept="image/*,application/pdf,video/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                
                {/* Attachment Previews */}
                {attachments.length > 0 && (
                  <div className={styles.attachmentPreviews}>
                    {attachments.map((file, index) => (
                      <div key={index} className={styles.attachmentPreview}>
                        {attachmentPreviews[index] ? (
                          <img src={attachmentPreviews[index]} alt={file.name} className={styles.attachmentThumbnail} />
                        ) : (
                          <div className={styles.attachmentIcon}>
                            {file.type === 'application/pdf' ? '📄' : '🎥'}
                          </div>
                        )}
                        <span className={styles.attachmentName}>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className={styles.removeAttachment}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Customer Reviews */}
        <div className={styles.right}>
          <h4> <span className={styles.star}>★</span>
              <strong>Customer Reviews</strong></h4>

          {loading ? (
            <div className="text-center">Loading reviews...</div>
          ) : !Array.isArray(reviews) || reviews.length === 0 ? (
            <div className="text-center">No reviews yet. Be the first to review!</div>
          ) : (
            reviews.map((review, index) => (
              <div key={index} className={styles.reviewCard}>
                <p>
                  <strong>{review.user_name || review.user_username || 'Anonymous'} </strong>
                  <span className={styles.star}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </span>
                </p>
                {review.title && <p><strong>{review.title}</strong></p>}
                <p>
                  "{review.comment}"
                </p>
                
                
                <small>{new Date(review.created_at).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerReview;

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import SubNav from '../components/SubNav';
import CategoryTabs from '../components/CategoryTabs';
import Footer from '../components/Footer';
import '../styles/shoppingList.css';
import Productdetails_Slider1 from "../components/Products_Details/productdetails_slider1";

import {

  recommendedProducts,
} from "../data/productSliderData";
interface ShoppingListItem {
  id: number;
  title: string;
  image: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  addedDate: string;
}

const ShoppingListPage: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Demo shopping list data
  const shoppingListItems: ShoppingListItem[] = [
    {
      id: 1,
      title: 'Sofa',
      image: '/images/Home/sofa.jpg',
      description: 'Elegant 3-seater sofa with soft cushions and premium upholstery for comfort.',
      price: 1299.99,
      originalPrice: 1390.99,
      rating: 3,
      reviews: 90,
      addedDate: '19 August 2025'
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={`sl-star ${i < rating ? 'sl-filled' : 'sl-empty'}`}>★</span>
      );
    }
    return stars;
  };

  return (
    <>
      <Navbar />
      <div className="page-content">
        <SubNav />
        <CategoryTabs />
      </div>

      <div className="sl-container">
        {/* Breadcrumb */}
        <div className="sl-breadcrumb">
          <span>Your Account &gt;</span>
          <span className="sl-breadcrumb-current">Shopping List</span>
        </div>

        {/* Page Title */}
        <h1 className="sl-page-title">Your Shopping List</h1>
        <div className="sl-title-divider"></div>

        <div className="sl-content">
          {/* Sidebar */}
          <aside className="sl-sidebar">
            <div className="sl-sidebar-header">
              <h2 className="sl-sidebar-title">Shopping List</h2>
              <span className="sl-privacy-badge">Private</span>
            </div>
            <p className="sl-list-name">Default List</p>
          </aside>

          {/* Main Content */}
          <section className="sl-main-content">
            {/* Header Section */}
            <div className="sl-content-header">
              <div className="sl-header-left">
                <h2 className="sl-content-title">
                  Shopping List <span className="sl-privacy-text">Private</span>
                </h2>
                <div className="sl-invite-section">
                  <div className="sl-user-avatar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="sl-user-icon">
                      <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <button className="sl-invite-button">
                    <svg className="sl-plus-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Invite
                  </button>
                </div>
              </div>

              <div className="sl-header-actions">
                <button className="sl-action-btn sl-add-item-btn">Add item</button>
                <button className="sl-action-btn sl-icon-btn" title="Print">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                </button>
                <div className="sl-menu-wrapper">
                  <button className="sl-action-btn sl-icon-btn" onClick={() => setShowMenu(!showMenu)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </button>
                  {showMenu && (
                    <div className="sl-dropdown-menu">
                      <button className="sl-menu-item">Manage list</button>
                      <button className="sl-menu-item">Print List</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
<hr />
            

            {/* Filter Section */}
            <div className="sl-filter-section">
              <div className="sl-view-toggle">
                <button className={`sl-view-btn ${viewMode === 'grid' ? 'sl-active' : ''}`} onClick={() => setViewMode('grid')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </button>
                <button className={`sl-view-btn ${viewMode === 'list' ? 'sl-active' : ''}`} onClick={() => setViewMode('list')}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>
              </div>

              <div className="sl-filter-controls">
                <div className="sl-search-box">
                  <svg className="sl-search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input type="text" placeholder="Search this list" className="sl-search-input" />
                </div>
                <button className="sl-filter-sort-btn">
                  Filter & Sort
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Product Items */}
            <div className="sl-products-container">
              {shoppingListItems.map((item) => (
                <div key={item.id} className="sl-product-item">
                  <div className="sl-product-image-container">
                    <img src={item.image} alt={item.title} className="sl-product-image" />
                    <button className="sl-favorite-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </button>
                  </div>

                  <div className="sl-product-details">
                    <h3 className="sl-product-title">{item.title}</h3>
                    <p className="sl-product-description">{item.description}</p>

                    <div className="sl-rating-container">
                      <div className="sl-stars">
                        {renderStars(item.rating)}
                      </div>
                      <span className="sl-reviews-count">({item.reviews} reviews)</span>
                    </div>

                    <div className="sl-price-container">
                      <span className="sl-current-price">₹{item.price}</span>
                      <span className="sl-original-price">₹{item.originalPrice}</span>
                    </div>

                    <p className="sl-added-date">Item added {item.addedDate}</p>

                    <div className="sl-product-actions">
                      <button className="sl-add-to-cart-btn">Add to Cart</button>
                      <button className="sl-secondary-btn">Add a note</button>
                      <button className="sl-secondary-btn sl-dropdown-btn">
                        Move
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                      <button className="sl-icon-action-btn" title="Share">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                      </button>
                      <button className="sl-icon-action-btn" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="sl-pagination">
              <span>Page 1 of 12</span>
            </div>
          </section>
        </div>
          <Productdetails_Slider1 
          title="Inspired by your browsing history"
          products={recommendedProducts}
        />
        <Productdetails_Slider1 
          title="Inspired by your browsing history"
          products={recommendedProducts}
        />

      </div>
          
         

             
  
         

           
      <div className="sl-footer-wrapper">
        <Footer />
      </div>
    </>
  );
};

export default ShoppingListPage;

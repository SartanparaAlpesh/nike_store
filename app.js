// ==========================================================================
// Application State & LocalStorage
// ==========================================================================

const STATE = {
  selectedColor: 'red',
  selectedSize: '9',
  cart: [],
  wishlist: [],
  currentCategory: 'all'
};

// ==========================================================================
// DOM Elements Cache
// ==========================================================================

const DOM = {
  body: document.body,
  heroShoe: document.getElementById('hero-shoe'),
  colorButtons: document.querySelectorAll('.color-opt'),
  heroSizeContainer: document.getElementById('hero-size-options'),
  heroSizeButtons: document.querySelectorAll('#hero-size-options .size-opt'),
  heroAddToCart: document.getElementById('hero-add-to-cart'),
  
  cartBtn: document.getElementById('cart-btn'),
  cartDrawer: document.getElementById('cart-drawer'),
  closeCartBtn: document.getElementById('close-cart'),
  cartOverlay: document.getElementById('cart-overlay'),
  cartItemsList: document.getElementById('cart-items-list'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  cartCount: document.getElementById('cart-count'),
  
  wishlistBtn: document.getElementById('wishlist-btn'),
  wishlistDrawer: document.getElementById('wishlist-drawer'),
  closeWishlistBtn: document.getElementById('close-wishlist'),
  wishlistOverlay: document.getElementById('wishlist-overlay'),
  wishlistItemsList: document.getElementById('wishlist-items-list'),
  wishlistCount: document.getElementById('wishlist-count'),
  heroWishlist: document.getElementById('hero-wishlist'),
  
  toast: document.getElementById('toast'),
  
  // New elements for category navigation and scrolling
  productsGrid: document.getElementById('products-grid'),
  navbarLinks: document.querySelectorAll('#navbar-links a'),
  heroSection: document.getElementById('hero'),
  catalogSection: document.getElementById('catalog')
};

// ==========================================================================
// Product Catalog Data & Dynamic Renderer
// ==========================================================================

const PRODUCTS = [
  {
    id: "nike-air-max-crimson",
    name: "Nike Air Max Crimson",
    category: "men",
    price: 14999.00,
    img: "assets/nike_red.png",
    type: "Running / Lifestyle",
    stock: 4
  },
  {
    id: "nike-air-max-azure",
    name: "Nike Air Max Azure",
    category: "men",
    price: 15499.00,
    img: "assets/nike_blue.png",
    type: "Athletics / Training",
    stock: 6
  },
  {
    id: "nike-air-max-stealth",
    name: "Nike Air Max Stealth Black",
    category: "men",
    price: 16499.00,
    img: "assets/nike_stealth.png",
    type: "Premium Streetwear",
    stock: 5
  },
  {
    id: "nike-air-max-pink-glow",
    name: "Nike Air Max Pink Glow",
    category: "women",
    price: 14999.00,
    img: "assets/nike_women_pink.png",
    type: "Running / Athletics",
    stock: 5
  },
  {
    id: "nike-air-max-lavender",
    name: "Nike Air Max Lavender",
    category: "women",
    price: 15999.00,
    img: "assets/nike_women_lavender.png",
    type: "Lifestyle / Gym",
    stock: 2
  },
  {
    id: "nike-air-max-sunset",
    name: "Nike Air Max Sunset Glow",
    category: "women",
    price: 15499.00,
    img: "assets/nike_sunset.png",
    type: "Special Edition Glow",
    stock: 3
  },
  {
    id: "nike-air-max-volt",
    name: "Nike Air Max Volt",
    category: "kids",
    price: 14999.00,
    img: "assets/nike_volt.png",
    type: "Special Edition / Gym",
    stock: 3
  },
  {
    id: "nike-air-max-neon-kid",
    name: "Nike Air Max Youth Neon",
    category: "kids",
    price: 9999.00,
    img: "assets/nike_kids_neon.png",
    type: "Youth Running",
    stock: 8
  },
  {
    id: "nike-air-max-cyber",
    name: "Nike Air Max Cyber Orange",
    category: "kids",
    price: 9499.00,
    img: "assets/nike_cyber.png",
    type: "Active Youth",
    stock: 7
  }
];


// Helper to get available stock of a product (total stock minus quantity in cart)
function getProductAvailableStock(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return 0;
  
  // Sum up quantities of this product in the cart
  const cartQty = STATE.cart
    .filter(item => item.productId === productId)
    .reduce((sum, item) => sum + item.quantity, 0);
    
  return Math.max(0, product.stock - cartQty);
}

// Helper to map color to hero product ID
function getHeroProductId(color) {
  if (color === 'red') return 'nike-air-max-crimson';
  if (color === 'blue') return 'nike-air-max-azure';
  if (color === 'volt') return 'nike-air-max-volt';
  return '';
}

// Update stock display in Hero config stage
function updateHeroStockUI() {
  const prodId = getHeroProductId(STATE.selectedColor);
  const product = PRODUCTS.find(p => p.id === prodId);
  const stockEl = document.getElementById('hero-stock-status');
  const heroCartBtn = DOM.heroAddToCart;

  
  
  if (product) {
    const availableStock = getProductAvailableStock(product.id);
    const isOutOfStock = availableStock <= 0;
    
    if (stockEl) {
      if (isOutOfStock) {
        stockEl.innerHTML = `<span class="stock-status out-of-stock">Sold Out</span>`;
      } else if (availableStock <= 5) {
        stockEl.innerHTML = `<span class="stock-status low-stock">${availableStock} left - Order soon!</span>`;
      } else {
        stockEl.innerHTML = `<span class="stock-status">${availableStock} left</span>`;
      }
    }
    
    if (heroCartBtn) {
      if (isOutOfStock) {
        heroCartBtn.setAttribute('disabled', 'true');
        const textSpan = heroCartBtn.querySelector('span');
        if (textSpan) textSpan.textContent = 'Sold Out';
      } else {
        heroCartBtn.removeAttribute('disabled');
        const textSpan = heroCartBtn.querySelector('span');
        if (textSpan) textSpan.textContent = 'Add to Cart';
      }
    }
  }
}

function renderProducts(categoryFilter = 'all') {
  if (!DOM.productsGrid) return;
  DOM.productsGrid.innerHTML = '';
  
  const filtered = categoryFilter === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === categoryFilter);
    
  if (filtered.length === 0) {
    DOM.productsGrid.innerHTML = '<div class="no-products">No products found in this category.</div>';
    return;
  }
  
  filtered.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card glass-card';
    const inlineStyle = product.imgStyle ? `style="${product.imgStyle}"` : '';
    
    const isWishlisted = STATE.wishlist.some(item => item.id === product.id);
    const availableStock = getProductAvailableStock(product.id);
    
    const isOutOfStock = availableStock <= 0;
    const stockClass = availableStock <= 5 ? 'low-stock' : '';
    const stockText = isOutOfStock ? 'Sold Out' : `${availableStock} left`;
    
    card.innerHTML = `
      <button class="product-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}" 
              data-id="${product.id}" 
              data-name="${product.name}" 
              data-price="${product.price}" 
              data-img="${product.img}"
              data-type="${product.type}"
              aria-label="Add to wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
      <div class="product-img-wrapper">
        <img src="${product.img}" alt="${product.name}" ${inlineStyle}>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <span class="product-category">${product.type}</span>
        <div>
          <span class="stock-status ${isOutOfStock ? 'out-of-stock' : stockClass}">${stockText}</span>
        </div>
        <div class="product-footer">
          <span class="price">₹${product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <button class="btn-shop add-to-cart-grid" 
                  data-id="${product.id}" 
                  data-name="${product.name}" 
                  data-price="${product.price}" 
                  data-img="${product.img}" 
                  data-size="9"
                  ${isOutOfStock ? 'disabled' : ''}>
            ${isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    `;
    DOM.productsGrid.appendChild(card);
  });
}

// ==========================================================================
// Cart Operations
// ==========================================================================

// Save cart to local storage
function saveCart() {
  localStorage.setItem('nike_store_cart', JSON.stringify(STATE.cart));
}

// Load cart from local storage
function loadCart() {
  const storedCart = localStorage.getItem('nike_store_cart');
  if (storedCart) {
    try {
      STATE.cart = JSON.parse(storedCart);
    } catch (e) {
      STATE.cart = [];
    }
  } else {
    STATE.cart = [];
  }
  updateCartUI();
}

// Add item to cart
function addItemToCart(id, name, price, img, size) {
  const availableStock = getProductAvailableStock(id);
  if (availableStock <= 0) {
    showToast(`Sorry, ${name} is out of stock!`);
    return;
  }
  
  // Construct unique ID including the size factor
  const itemUniqueId = `${id}-sz-${size}`;
  
  const existingItemIndex = STATE.cart.findIndex(item => item.uniqueId === itemUniqueId);
  
  if (existingItemIndex > -1) {
    STATE.cart[existingItemIndex].quantity += 1;
  } else {
    STATE.cart.push({
      uniqueId: itemUniqueId,
      productId: id,
      name: name,
      price: parseFloat(price),
      img: img,
      size: size,
      quantity: 1
    });
  }
  
  saveCart();
  updateCartUI();
  showToast(`Added ${name} (Size ${size}) to Bag!`);
  openCartDrawer();
}

// Update item quantity
function updateItemQuantity(uniqueId, change) {
  const itemIndex = STATE.cart.findIndex(item => item.uniqueId === uniqueId);
  if (itemIndex === -1) return;
  
  const item = STATE.cart[itemIndex];
  if (change > 0) {
    const availableStock = getProductAvailableStock(item.productId);
    if (availableStock <= 0) {
      showToast(`Only ${item.quantity} left in stock!`);
      return;
    }
  }
  
  STATE.cart[itemIndex].quantity += change;
  
  if (STATE.cart[itemIndex].quantity <= 0) {
    STATE.cart.splice(itemIndex, 1);
  }
  
  saveCart();
  updateCartUI();
}

// Remove item from cart completely
function removeItemFromCart(uniqueId) {
  STATE.cart = STATE.cart.filter(item => item.uniqueId !== uniqueId);
  saveCart();
  updateCartUI();
}

// Open / Close Cart Sidebar Drawer
function openCartDrawer() {
  DOM.cartDrawer.classList.add('active');
  closeWishlistDrawer();
}

function closeCartDrawer() {
  DOM.cartDrawer.classList.remove('active');
}

// ==========================================================================
// Wishlist Operations
// ==========================================================================

// Save wishlist to local storage
function saveWishlist() {
  localStorage.setItem('nike_store_wishlist', JSON.stringify(STATE.wishlist));
}

// Load wishlist from local storage
function loadWishlist() {
  const storedWishlist = localStorage.getItem('nike_store_wishlist');
  if (storedWishlist) {
    try {
      STATE.wishlist = JSON.parse(storedWishlist);
    } catch (e) {
      STATE.wishlist = [];
    }
  } else {
    STATE.wishlist = [];
  }
  updateWishlistUI();
}

// Toggle wishlist item
function toggleWishlistProduct(id, name, price, img, type) {
  const index = STATE.wishlist.findIndex(item => item.id === id);
  let isAdded = false;
  
  if (index > -1) {
    STATE.wishlist.splice(index, 1);
  } else {
    STATE.wishlist.push({
      id: id,
      name: name,
      price: parseFloat(price),
      img: img,
      type: type || "Nike Air Max"
    });
    isAdded = true;
  }
  
  saveWishlist();
  updateWishlistUI();
  updateHeroWishlistButtonState();
  
  // Update state of all grid buttons for this product
  if (DOM.productsGrid) {
    const gridBtns = DOM.productsGrid.querySelectorAll(`.product-wishlist-btn[data-id="${id}"]`);
    gridBtns.forEach(btn => {
      if (isAdded) {
        btn.classList.add('wishlisted');
      } else {
        btn.classList.remove('wishlisted');
      }
    });
  }
  
  if (isAdded) {
    showToast(`Added ${name} to Wishlist!`);
  } else {
    showToast(`Removed ${name} from Wishlist.`);
  }
}

// Open / Close Wishlist Sidebar Drawer
function openWishlistDrawer() {
  DOM.wishlistDrawer.classList.add('active');
  closeCartDrawer();
}

function closeWishlistDrawer() {
  DOM.wishlistDrawer.classList.remove('active');
}

// Update Hero Wishlist Button Active State
function updateHeroWishlistButtonState() {
  if (!DOM.heroWishlist) return;
  const currentHeroId = `nike-air-max-${STATE.selectedColor}`;
  const isWishlisted = STATE.wishlist.some(item => item.id === currentHeroId);
  
  if (isWishlisted) {
    DOM.heroWishlist.classList.add('wishlisted');
  } else {
    DOM.heroWishlist.classList.remove('wishlisted');
  }
}

// Render wishlist items inside sidebar drawer
function updateWishlistUI() {
  if (!DOM.wishlistItemsList) return;
  
  DOM.wishlistItemsList.innerHTML = '';
  
  if (STATE.wishlist.length === 0) {
    DOM.wishlistItemsList.innerHTML = '<div class="empty-cart-message">Your Wishlist is empty.</div>';
  } else {
    STATE.wishlist.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'wishlist-item';
      itemEl.innerHTML = `
        <div class="wishlist-item-img">
          <img src="${item.img}" alt="${item.name}">
        </div>
        <div class="wishlist-item-details">
          <span class="wishlist-item-title">${item.name}</span>
          <span class="wishlist-item-meta">${item.type || 'Nike Air Max'}</span>
          <div class="wishlist-item-row">
            <span class="wishlist-item-price">₹${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            <div class="wishlist-action-btns">
              <button class="wishlist-to-cart-btn" 
                      data-id="${item.id}" 
                      data-name="${item.name}" 
                      data-price="${item.price}" 
                      data-img="${item.img}">
                Add to Bag
              </button>
              <button class="delete-wishlist-item" data-id="${item.id}" aria-label="Remove item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Wire up buttons
      itemEl.querySelector('.wishlist-to-cart-btn').addEventListener('click', () => {
        addItemToCart(item.id, item.name, item.price, item.img, '9');
      });
      itemEl.querySelector('.delete-wishlist-item').addEventListener('click', () => {
        toggleWishlistProduct(item.id, item.name, item.price, item.img, item.type);
      });
      
      DOM.wishlistItemsList.appendChild(itemEl);
    });
  }
  
  if (DOM.wishlistCount) {
    DOM.wishlistCount.textContent = STATE.wishlist.length;
  }
}

// ==========================================================================
// UI Rendering Functions
// ==========================================================================

// Render cart items inside sidebar drawer
function updateCartUI() {
  DOM.cartItemsList.innerHTML = '';
  
  let subtotal = 0;
  let totalQuantity = 0;
  
  if (STATE.cart.length === 0) {
    DOM.cartItemsList.innerHTML = '<div class="empty-cart-message">Your shopping bag is empty.</div>';
  } else {
    STATE.cart.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;
      totalQuantity += item.quantity;
      
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-img">
          <img src="${item.img}" alt="${item.name}">
        </div>
        <div class="cart-item-details">
          <span class="cart-item-title">${item.name}</span>
          <span class="cart-item-meta">Size: US ${item.size}</span>
          <div class="cart-item-row">
            <div class="qty-control">
              <button class="qty-btn dec-btn" data-id="${item.uniqueId}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn inc-btn" data-id="${item.uniqueId}">+</button>
            </div>
            <span class="cart-item-price">₹${itemSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <button class="delete-item remove-btn" data-id="${item.uniqueId}" aria-label="Remove item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      `;
      
      // Quantity controls listeners
      itemEl.querySelector('.dec-btn').addEventListener('click', () => updateItemQuantity(item.uniqueId, -1));
      itemEl.querySelector('.inc-btn').addEventListener('click', () => updateItemQuantity(item.uniqueId, 1));
      itemEl.querySelector('.remove-btn').addEventListener('click', () => removeItemFromCart(item.uniqueId));
      
      DOM.cartItemsList.appendChild(itemEl);
    });
  }
  
  // Update totals
  DOM.cartSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  DOM.cartCount.textContent = totalQuantity;
  
  // Re-sync UI with stock state
  renderProducts(STATE.currentCategory || 'all');
  updateHeroStockUI();
}

// Display toast notifications
let toastTimeout;
function showToast(message) {
  DOM.toast.textContent = message;
  DOM.toast.classList.remove('hidden');
  
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    DOM.toast.classList.add('hidden');
  }, 2500);
}

// Helper to capitalize strings
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ==========================================================================
// Initialization & Event Binding
// ==========================================================================

function init() {
  // Load bag data
  loadCart();
  
  // Load wishlist data
  loadWishlist();
  
  // 1. Color Switcher Customizer
  DOM.colorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const color = btn.getAttribute('data-color');
      const img = btn.getAttribute('data-img');
      
      // Update state
      STATE.selectedColor = color;
      
      // Toggle active states
      DOM.colorButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Dynamic color theme class injection
      DOM.body.className = ''; // Reset
      DOM.body.classList.add(`theme-${color}`);
      
      // Sneaker image fade shift
      DOM.heroShoe.style.opacity = '0';
      DOM.heroShoe.style.transform = 'rotate(-15deg) translateY(30px) scale(0.9)';
      
      setTimeout(() => {
        DOM.heroShoe.src = img;
        DOM.heroShoe.style.opacity = '1';
        DOM.heroShoe.style.transform = '';
        updateHeroWishlistButtonState();
        updateHeroStockUI();
        
        // Update hero price tag dynamically
        const prodId = getHeroProductId(color);
        const product = PRODUCTS.find(p => p.id === prodId);
        if (product) {
          const priceEl = document.getElementById('hero-price');
          if (priceEl) {
            priceEl.textContent = `₹${product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
          }
        }
      }, 250);
    });
  });
  
  // 2. Size Switcher Customizer
  DOM.heroSizeContainer.addEventListener('click', (e) => {
    const sizeBtn = e.target.closest('.size-opt');
    if (!sizeBtn) return;
    
    // Toggle active size
    document.querySelectorAll('#hero-size-options .size-opt').forEach(btn => btn.classList.remove('active'));
    sizeBtn.classList.add('active');
    
    // Update state
    STATE.selectedSize = sizeBtn.textContent.trim();
  });
  
  // 3. Hero CTA Click Add to Cart
  DOM.heroAddToCart.addEventListener('click', () => {
    const id = getHeroProductId(STATE.selectedColor);
    const product = PRODUCTS.find(p => p.id === id);
    if (product) {
      addItemToCart(product.id, product.name, product.price, product.img, STATE.selectedSize);
    }
  });
  
  // 3b. Hero CTA Click Wishlist
  if (DOM.heroWishlist) {
    DOM.heroWishlist.addEventListener('click', () => {
      const id = getHeroProductId(STATE.selectedColor);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) {
        toggleWishlistProduct(product.id, product.name, product.price, product.img, "Customized Edition");
      }
    });
  }
  
  // 4. Grid Actions (Event Delegation)
  if (DOM.productsGrid) {
    DOM.productsGrid.addEventListener('click', (e) => {
      // Handle Add to Cart
      const cartBtn = e.target.closest('.add-to-cart-grid');
      if (cartBtn) {
        const id = cartBtn.getAttribute('data-id');
        const name = cartBtn.getAttribute('data-name');
        const price = cartBtn.getAttribute('data-price');
        const img = cartBtn.getAttribute('data-img');
        const size = cartBtn.getAttribute('data-size') || '9';
        
        addItemToCart(id, name, price, img, size);
        return;
      }
      
      // Handle Wishlist Toggle
      const wishBtn = e.target.closest('.product-wishlist-btn');
      if (wishBtn) {
        const id = wishBtn.getAttribute('data-id');
        const name = wishBtn.getAttribute('data-name');
        const price = wishBtn.getAttribute('data-price');
        const img = wishBtn.getAttribute('data-img');
        const type = wishBtn.getAttribute('data-type');
        
        toggleWishlistProduct(id, name, price, img, type);
        return;
      }
    });
  }
  
  // 4a. Navbar Links Click Event Handlers (Filter & Scroll)
  DOM.navbarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const category = link.getAttribute('data-category');
      if (!category) return;
      
      if (category === 'customize') {
        DOM.navbarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        if (DOM.heroSection) {
          DOM.heroSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        DOM.navbarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        STATE.currentCategory = category;
        renderProducts(category);
        
        if (DOM.catalogSection) {
          DOM.catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Render initial products list
  renderProducts('all');
  
  // 5. Drawer Controls
  if (DOM.cartBtn) DOM.cartBtn.addEventListener('click', openCartDrawer);
  if (DOM.closeCartBtn) DOM.closeCartBtn.addEventListener('click', closeCartDrawer);
  if (DOM.cartOverlay) DOM.cartOverlay.addEventListener('click', closeCartDrawer);
  
  if (DOM.wishlistBtn) DOM.wishlistBtn.addEventListener('click', openWishlistDrawer);
  if (DOM.closeWishlistBtn) DOM.closeWishlistBtn.addEventListener('click', closeWishlistDrawer);
  if (DOM.wishlistOverlay) DOM.wishlistOverlay.addEventListener('click', closeWishlistDrawer);
  
  // 6. Checkout button click
  document.getElementById('checkout-btn').addEventListener('click', () => {
    if (STATE.cart.length === 0) {
      showToast("Your Bag is empty! Add items before checking out.");
      return;
    }
    showToast("Checkout simulation complete! Thank you for shopping with Nike.");
    STATE.cart = [];
    saveCart()
    updateCartUI();
    closeCartDrawer();
  });
  
  // Initial active states update
  updateHeroWishlistButtonState();
  updateHeroStockUI();
}

// Boot application
document.addEventListener('DOMContentLoaded', init);

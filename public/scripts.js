document.addEventListener('DOMContentLoaded', () => {
  // Initialize cart
  let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  const cartCount = document.querySelector('.cart-count');
  const shopLink = document.getElementById('shopLink');
  const cartLink = document.querySelector('.cart-link');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const closeBtn = document.querySelector('.close-btn');

  // Add to cart function
  const addToCart = (product) => {
    // Check if the product is already in the cart
    const isInCart = cartItems.some(item => item.name === product.name);
    if (isInCart) {
      alert(`${product.name} is already in your cart!`);
      return;
    }

    // Add product to cart
    cartItems.push(product);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
    alert(`${product.name} added to cart!`);
  };

  // Update cart count
  const updateCartCount = () => {
    if (cartCount) {
      cartCount.textContent = cartItems.length;
    }
  };

  // Check if a product is out of stock
  const isOutOfStock = (button) => {
    // Assuming the button has a `data-stock` attribute that reflects the current stock
    const stock = parseInt(button.getAttribute('data-stock'));
    return stock <= 0;
  };

  // Attach event handlers
  const attachCartHandlers = () => {
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', () => {
        const productCard = button.closest('.product-card');
        const product = {
          name: productCard.querySelector('h3').textContent,
          price: productCard.querySelector('.price').textContent,
          image: productCard.querySelector('img').src
        };

        // Check if the product is out of stock
        if (isOutOfStock(button)) {
          alert(`${product.name} is out of stock!`);
          return;
        }

        // Add to cart
        addToCart(product);
      });
    });
  };

  // Initialize page
  // Only attach cart handlers if cart buttons exist on the page
  if (document.querySelectorAll('.add-to-cart').length > 0) {
    attachCartHandlers();
  }
  updateCartCount();

  // Navigation
  if (shopLink) {
    shopLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = 'categories.html';
    });
  }

  // Hamburger Menu
  if (hamburger && navLinks && closeBtn) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  }
});
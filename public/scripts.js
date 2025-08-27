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
    const existingProduct = cartItems.find(item => item.name === product.name);
    if (existingProduct) {
      existingProduct.quantity += 1;
      alert(`${product.name} quantity updated in cart!`);
    } else {
      // Add product to cart
      cartItems.push(product);
      alert(`${product.name} added to cart!`);
    }

    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    updateCartCount();
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
        const priceText = productCard.querySelector('.price').textContent;
        const product = {
          name: productCard.querySelector('h3').textContent,
          price: parseInt(priceText.replace(/[^\d]/g, '')),
          image: productCard.querySelector('img').src,
          quantity: 1
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

  // Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;

      fetch('/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      })
      .then(response => {
        if (response.ok) {
          alert('Thank you for your message! We will get back to you soon.');
          contactForm.reset();
        } else {
          alert('Sorry, there was an error sending your message. Please try again later.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Sorry, there was an error sending your message. Please try again later.');
      });
    });
  }
});
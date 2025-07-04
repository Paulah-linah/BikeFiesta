document.addEventListener('DOMContentLoaded', function() {
  const billingForm = document.getElementById('billing-form');

  // Check for rental items first, then fall back to the regular cart
  const rentalItems = JSON.parse(sessionStorage.getItem('rentalItems'));
  const regularItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  let orderItems = [];
  let totalPrice = 0;

  if (rentalItems && rentalItems.length > 0) {
    // This is a rental checkout
    orderItems = rentalItems.map(item => ({
      name: item.name,
      price: item.pricePerDay * item.days,
      quantity: item.days, // For rentals, quantity represents the number of days
      category: 'rental'
    }));
    totalPrice = orderItems.reduce((total, item) => total + item.price, 0);
  } else {
    // This is a regular product checkout
    orderItems = regularItems.map(item => ({
      name: item.name,
      price: parseInt(item.price),
      quantity: item.quantity || 1,
      category: item.category || 'accessory'
    }));
    totalPrice = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Handle form submission
  billingForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const customerName = document.getElementById('name').value.trim();
    const customerEmail = document.getElementById('email').value.trim();
    const customerPhone = document.getElementById('phone').value.trim();

    if (customerName === '' || customerEmail === '' || customerPhone === '' || orderItems.length === 0) {
      alert('Please fill in all the details and ensure your cart is not empty.');
      return;
    }

    fetch('http://localhost:3002/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderItems, customerName, customerEmail, customerPhone, totalPrice }),
    })
      .then(response => {
        if (response.ok) {
          alert('Order submitted successfully');
          clearAllCarts(); // Clear all carts after successful submission
          setTimeout(() => { window.location.href = 'success.html'; }, 1000);
        } else {
          alert('Error submitting order. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error submitting order:', error);
        alert('An error occurred while submitting the order.');
      });
  });

  // Clears all cart-related data from storage
  function clearAllCarts() {
    localStorage.removeItem('cartItems');
    sessionStorage.removeItem('rentalItems');
    sessionStorage.removeItem('totalPrice');
  }
});

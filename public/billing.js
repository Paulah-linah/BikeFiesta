document.addEventListener('DOMContentLoaded', function() {
  const billingForm = document.getElementById('billing-form');
  billingForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const customerName = document.getElementById('name').value.trim();
    const customerEmail = document.getElementById('email').value.trim();
    const customerPhone = document.getElementById('phone').value.trim();

    const orderItems = retrieveCartItems();

    if (customerName === '' || customerEmail === '' || customerPhone === '' || orderItems.length === 0) {
      alert('Please fill in all the details and add items to the cart before placing the order.');
    } else {
      const totalPrice = parseInt(sessionStorage.getItem('totalPrice'), 10);

      fetch('http://localhost:3000/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderItems, customerName, customerEmail, customerPhone, totalPrice }),
      })
        .then((response) => {
          if (response.ok) {
            alert('Order submitted successfully');
            clearCart();
            setTimeout(function() {
              window.location.href = 'success.html';
            }, 1000);
          } else {
            alert('Error submitting order');
          }
        })
        .catch((error) => {
          console.error('Error submitting order:', error);
          alert('Error submitting order');
        });
    }
  });
});

// Retrieve cart items with category and price
function retrieveCartItems() {
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  return cartItems.map(item => ({
    category: item.category,
    name: item.name,
    price: parseInt(item.price),  // Make sure price is a number
    image: item.image,
    quantity: item.quantity || 1  // Include quantity, default to 1 if not set
  }));
}

// Clear cart function
function clearCart() {
  localStorage.removeItem('cartItems');
  sessionStorage.removeItem('totalPrice'); // Clear total price after order is placed
}

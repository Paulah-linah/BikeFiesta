const cartItemsContainer = document.getElementById('cart-items');
const totalPriceElement = document.getElementById('total-price');
const deliveryOptions = document.querySelectorAll('input[name="delivery-option"]');
const checkoutBtn = document.getElementById('checkout-btn');

// Retrieve cart items from localStorage
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Function to render cart items
function renderCartItems() {
  cartItemsContainer.innerHTML = ''; // Clear the container
  let totalPrice = 0;

  // Loop through each item in the cart
  cartItems.forEach((item, index) => {
    const cartItemElement = document.createElement('div');
    cartItemElement.classList.add('cart-item');

    // Create and append the product image
    const imageElement = document.createElement('img');
    imageElement.src = item.image;
    imageElement.alt = item.name;
    cartItemElement.appendChild(imageElement);

    // Create and append the product details
    const detailsElement = document.createElement('div');
    detailsElement.classList.add('cart-item-details');

    const nameElement = document.createElement('h3');
    nameElement.textContent = item.name;
    detailsElement.appendChild(nameElement);

    const priceElement = document.createElement('p');
    priceElement.textContent = `Price: Kshs. ${parseInt(item.price).toLocaleString()}`;
    detailsElement.appendChild(priceElement);

    const quantityElement = document.createElement('p');
    quantityElement.textContent = `Quantity: ${item.quantity}`;
    detailsElement.appendChild(quantityElement);

    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-item');
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => removeFromCart(index));
    detailsElement.appendChild(removeButton);

    cartItemElement.appendChild(detailsElement);
    cartItemsContainer.appendChild(cartItemElement);

    // Update the total price
    totalPrice += parseInt(item.price) * item.quantity;
  });

  // Display the total price
  totalPriceElement.textContent = `Kshs. ${totalPrice.toLocaleString()}`;
}

// Function to remove an item from the cart
function removeFromCart(index) {
  cartItems.splice(index, 1); // Remove the item from the array
  localStorage.setItem('cartItems', JSON.stringify(cartItems)); // Update localStorage
  renderCartItems(); // Re-render the cart
}

// Function to retrieve cart items (not used in this script)
function retrieveCartItems() {
  const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
  return cartItems.map(item => ({
    category: item.category,
    name: item.name,
    price: parseInt(item.price),
    image: item.image,
    quantity: item.quantity,
  }));
}

// Render cart items when the page loads
renderCartItems();

// Handle checkout button click
checkoutBtn.addEventListener('click', () => {
  const selectedDeliveryOption = document.querySelector('input[name="delivery-option"]:checked');
  if (selectedDeliveryOption) {
    const deliveryOption = selectedDeliveryOption.value;
    let totalPrice = parseInt(totalPriceElement.textContent.replace(/[^0-9]/g, ''), 10);

    // Add delivery fee if applicable
    if (deliveryOption === 'delivery') {
      totalPrice += 500;
    }

    // Save the total price in sessionStorage for the billing page
    sessionStorage.setItem('totalPrice', totalPrice);

    // Redirect to the billing page
    window.location.href = 'billing.html';
  } else {
    alert('Please select a delivery option.');
  }
});
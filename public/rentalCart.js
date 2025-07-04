document.addEventListener('DOMContentLoaded', function() {
  const cartItemsContainer = document.getElementById('cart-items');
  const totalPriceElement = document.getElementById('total-price');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Load rental items from local storage
  let rentalItems = JSON.parse(localStorage.getItem('cartItems')) || [];

  // Ensure each item has a category set to 'rental' if missing
  rentalItems = rentalItems.map(item => {
    if (!item.category) item.category = 'rental';
    return item;
  });

  // Render rental cart items
  function renderRentalItems() {
    cartItemsContainer.innerHTML = '';
    let totalRentalCost = 0;

    rentalItems.forEach((item, index) => {
      const rentalItemElement = document.createElement('div');
      rentalItemElement.classList.add('cart-item');

      const imageElement = document.createElement('img');
      imageElement.src = item.image;
      imageElement.alt = item.name;

      const detailsElement = document.createElement('div');
      detailsElement.classList.add('cart-item-details');

      const nameElement = document.createElement('h3');
      nameElement.textContent = item.name;

      const rateElement = document.createElement('p');
      rateElement.textContent = `Daily Rate: Kshs. ${item.pricePerDay}`;

      const daysElement = document.createElement('p');
      daysElement.textContent = `Days: ${item.days}`;

      const totalCost = item.pricePerDay * item.days; // Calculate total cost
      const totalElement = document.createElement('p');
      totalElement.textContent = `Total: Kshs. ${totalCost.toLocaleString()}`;

      const removeButton = document.createElement('button');
      removeButton.classList.add('remove-item');
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => removeFromRentalCart(index));

      detailsElement.appendChild(nameElement);
      detailsElement.appendChild(rateElement);
      detailsElement.appendChild(daysElement);
      detailsElement.appendChild(totalElement);
      detailsElement.appendChild(removeButton);

      rentalItemElement.appendChild(imageElement);
      rentalItemElement.appendChild(detailsElement);

      cartItemsContainer.appendChild(rentalItemElement);

      totalRentalCost += totalCost; // Aggregate total rental cost
    });

    totalPriceElement.textContent = `Kshs. ${totalRentalCost.toLocaleString()}`; // Display total rental cost
  }

  // Function to add a rental item to the cart with user-specified days and selected bike details
  function addRentalItemToCart(name, pricePerDay, image) {
    const days = parseInt(document.getElementById('daysInput').value, 10);

    if (isNaN(days) || days <= 0) {
      alert("Please enter a valid number of days.");
      return;
    }

    // Define the rental item using passed details
    let rentalItem = {
      name: name,
      pricePerDay: pricePerDay,
      days: days,
      category: 'rental', // Ensures the category is set
      image: image
    };

    rentalItems.push(rentalItem);
    localStorage.setItem('cartItems', JSON.stringify(rentalItems));
    renderRentalItems();
    alert("Item added to the cart!");
  }

  // Remove item from rental cart
  function removeFromRentalCart(index) {
    rentalItems.splice(index, 1);
    localStorage.setItem('cartItems', JSON.stringify(rentalItems));
    renderRentalItems();
  }

  // Render rental items initially
  renderRentalItems();

  // Checkout button functionality
  checkoutBtn.addEventListener('click', () => {
    if (rentalItems.length > 0) {
      const totalRentalCost = rentalItems.reduce((total, item) => total + (item.pricePerDay * item.days), 0);
      // Save both the total price and the items to sessionStorage for the billing page
      sessionStorage.setItem('totalPrice', totalRentalCost);
      sessionStorage.setItem('rentalItems', JSON.stringify(rentalItems));

      // Clear the main cart to prevent conflicts on the billing page
      localStorage.removeItem('cartItems');

      window.location.href = 'billing.html';
    } else {
      alert('Your rental cart is empty.');
    }
  });

  // Example of adding a rental item (use this example to add items based on selected bike)
  // addRentalItemToCart('Electric Bike', 3000, 'path/to/image.jpg');
});

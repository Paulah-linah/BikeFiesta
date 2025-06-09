// dashboard.js
window.addEventListener('DOMContentLoaded', () => {
    // Fetch data from server or local storage
    const totalSales = 10000; // Replace with actual data
    const totalProducts = 50; // Replace with actual data
    const totalOrders = 20; // Replace with actual data

    // Update dashboard cards
    document.getElementById('total-sales').textContent = `$${totalSales.toFixed(2)}`;
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-orders').textContent = totalOrders;

    // Fetch product data from server or local storage
    const products = [
        { id: 1, name: 'Ibis DV9', price: 350000, image: 'Ibis.jpeg' },
        { id: 2, name: 'Santa Cruz', price: 242000, image: 'Santa Cruz.jpeg' },
        { id: 3, name: 'Trek', price: 124000, image: 'Trek.jpeg' },
        // Add more products as needed
    ];

    // Render product cards
    const productCards = document.getElementById('product-cards');
    products.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Kshs.${product.price}</p>
        `;
        productCards.appendChild(card);
    });
});



document.addEventListener('DOMContentLoaded', () => {
  const inventoryTable = document.getElementById('inventory-table').getElementsByTagName('tbody')[0];
  const addProductForm = document.getElementById('addProductForm');

  // Fetch and display products
  function loadProducts() {
    fetch('/products')
      .then(response => response.json())
      .then(products => {
        inventoryTable.innerHTML = '';
        products.forEach(product => {
          const row = inventoryTable.insertRow();
          row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>
              <button class="action-button delete-button" data-id="${product.id}">Delete</button>
            </td>
          `;
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-button').forEach(button => {
          button.addEventListener('click', () => {
            deleteProduct(button.getAttribute('data-id'));
          });
        });
      })
      .catch(error => console.error('Error loading products:', error));
  }

  // Add or update a product
  addProductForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(addProductForm);
    const productId = formData.get('productId');
    const product = {
      name: formData.get('name'),
      category: formData.get('category'),
      price: parseFloat(formData.get('price')),
      stock: parseInt(formData.get('stock')),
    };

    console.log('Submitting product:', { productId, product });

    const url = productId ? `/products/${productId}` : '/products';
    const method = productId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(result => {
      console.log('Server response:', result);
      loadProducts();
      addProductForm.reset();
      document.getElementById('productId').value = '';
      
      // Reset form title
      const formTitle = document.querySelector('#addProductForm').previousElementSibling;
      if (formTitle && formTitle.tagName === 'H2') {
        formTitle.textContent = 'Add New Product';
      }
    })
    .catch(error => {
      console.error(`Error ${productId ? 'updating' : 'adding'} product:`, error);
      alert(`Error ${productId ? 'updating' : 'adding'} product: ` + error.message);
    });
  });

  // Edit product
  function editProduct(id) {
    console.log('Editing product with ID:', id);
    fetch(`/products/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(product => {
        console.log('Received product data:', product);
        if (!product) {
          throw new Error('No product data received');
        }
        
        const idField = document.getElementById('productId');
        const nameField = document.getElementById('name');
        const categoryField = document.getElementById('category');
        const priceField = document.getElementById('price');
        const stockField = document.getElementById('stock');
        
        if (!idField || !nameField || !categoryField || !priceField || !stockField) {
          throw new Error('One or more form fields not found');
        }

        idField.value = product.id;
        nameField.value = product.name;
        categoryField.value = product.category;
        priceField.value = product.price;
        stockField.value = product.stock;

        // Update form title to indicate editing mode
        const formTitle = document.querySelector('#addProductForm').previousElementSibling;
        if (formTitle && formTitle.tagName === 'H2') {
          formTitle.textContent = 'Edit Product';
        }
      })
      .catch(error => {
        console.error('Error in editProduct:', error);
        alert('Error editing product: ' + error.message);
      });
  }

  // Delete product
  function deleteProduct(id) {
    fetch(`/products/${id}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(() => {
      loadProducts();
    })
    .catch(error => console.error('Error deleting product:', error));
  }

  // Initial load of products
  loadProducts();
});

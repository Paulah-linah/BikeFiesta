document.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
});

function fetchOrders() {
    fetch('http://localhost:3000/orders')
        .then(response => response.json())
        .then(orders => {
            const orderTableBody = document.querySelector('#order-table tbody');
            orderTableBody.innerHTML = ''; // Clear existing content

            orders.forEach(order => {
                const orderRow = document.createElement('tr');
                orderRow.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.name}</td>
                    <td>
                        <ul>
                            ${order.items.map(item => `<li>${item.category} - ${item.item_name} - ${item.price}</li>`).join('')}
                        </ul>
                    </td>
                    <td>${order.total_price}</td>
                    <td>
                        <select class="status-select" data-order-id="${order.id}">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td><button class="update-status-button" data-order-id="${order.id}">Update</button></td>
                `;
                orderTableBody.appendChild(orderRow);
            });

            document.querySelectorAll('.update-status-button').forEach(button => {
                button.addEventListener('click', function() {
                    const orderId = this.dataset.orderId;
                    const status = document.querySelector(`select[data-order-id="${orderId}"]`).value;
                    updateOrderStatus(orderId, status);
                });
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

function updateOrderStatus(orderId, status) {
    fetch(`http://localhost:3000/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    })
    .then(response => response.text())
    .then(message => {
        console.log(message);
        alert('Order status updated successfully');
    })
    .catch(error => console.error('Error updating order status:', error));
}

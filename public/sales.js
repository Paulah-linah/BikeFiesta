document.addEventListener('DOMContentLoaded', function() {
    // Set default date range to cover all data
    const endDate = new Date('2025-12-31');  // Future date to cover all data
    const startDate = new Date('2024-01-01'); // Past date to cover all data
    
    document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
    
    fetchSalesData();
});

function fetchSalesData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    console.log('Fetching sales data for date range:', { startDate, endDate });

    fetch(`http://localhost:3000/sales?startDate=${startDate}&endDate=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(sales => {
            console.log('Received sales data:', sales);
            if (sales.length === 0) {
                console.log('No sales data found for the selected date range');
            }
            updateChart(sales);
        })
        .catch(error => {
            console.error('Error fetching sales data:', error);
            alert('Error fetching sales data: ' + error.message);
        });
}

let salesChart = null; // Global variable to store chart instance

function updateChart(sales) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (salesChart) {
        salesChart.destroy();
    }

    const labels = sales.map(sale => new Date(sale.created_at).toLocaleDateString());
    const data = sales.map(sale => sale.total_price);

    salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    type: 'line',
                    label: 'Total Sales (Line)',
                    data: data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    type: 'bar',
                    label: 'Total Sales (Bar)',
                    data: data,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Sales (PHP)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: `Sales Report (${document.getElementById('startDate').value} to ${document.getElementById('endDate').value})`
                }
            }
        }
    });
}

function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    // Refresh chart with new date range
    fetchSalesData();

    fetch(`http://localhost:3000/sales/report?startDate=${startDate}&endDate=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to generate report');
            }
            return response.json();
        })
        .then(report => {
            console.log('Sales Report:', report);
            alert('Sales report generated successfully');
        })
        .catch(error => {
            console.error('Error generating sales report:', error);
            alert('Error generating report: ' + error.message);
        });
}

function exportReportToPDF() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Please select both start and end dates');
        return;
    }

    fetch(`http://localhost:3000/generate-sales-report?startDate=${startDate}&endDate=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `sales_report_${startDate}_to_${endDate}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF: ' + error.message);
        });
}

// Add event listeners for date inputs
document.getElementById('startDate').addEventListener('change', fetchSalesData);
document.getElementById('endDate').addEventListener('change', fetchSalesData);

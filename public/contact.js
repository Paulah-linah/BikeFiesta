document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  try {
    const response = await fetch('http://localhost:3000/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name, email, message }),
});


    if (response.ok) {
      alert('Contact form submitted successfully');
      document.getElementById('contactForm').reset();
    } else {
      alert('Error submitting contact form');
    }
  } catch (err) {
    console.error('Error submitting contact form:', err);
    alert('Error submitting contact form');
  }
});
document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', new Date().getTime() + 3600000); // 1 hour expiry
        window.location.href = 'dashboard.html';
      } else {
        console.error('Login failed:', data);
        alert(data.message || '登录失败，请重试。');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('登录过程中发生错误，请重试。');
    }
  });
});
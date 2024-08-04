document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      alert('密码不匹配！');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration successful:', data);
        alert('注册成功！请登录。');
        // 使用 window.location.href 进行重定向
        window.location.href = 'index.html';
      } else {
        console.error('Registration failed:', data);
        alert(data.message || '注册失败，请重试。');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('注册过程中发生错误，请重试。');
    }
  });
});
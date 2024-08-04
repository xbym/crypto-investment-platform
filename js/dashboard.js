document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');

  if (!token || !tokenExpiry || new Date().getTime() > parseInt(tokenExpiry)) {
    console.log('Token is missing or expired');
    redirectToLogin();
    return;
  }

  verifyTokenAndLoadData();
});

async function verifyTokenAndLoadData() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:5000/verify-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    console.log('Token verification successful:', data);

    document.getElementById('customerName').textContent = data.username;

    await loadUserData();
    loadInvestmentChart();
    loadCryptoList();
  } catch (error) {
    console.error('Error:', error);
    redirectToLogin();
  }
}

async function loadUserData() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:5000/user-data', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load user data');
    }

    const data = await response.json();
    console.log('User data:', data);

    document.getElementById('accountBalance').textContent = `$${data.balance.toFixed(2)}`;
    document.getElementById('totalInvestment').textContent = `$${data.totalInvestment.toFixed(2)}`;
  } catch (error) {
    console.error('Error loading user data:', error);
    alert('加载用户数据失败，请重试。');
  }
}

function loadInvestmentChart() {
  const ctx = document.getElementById('investmentChart').getContext('2d');

  // 模拟数据 - 在实际应用中，这些数据应该从后端获取
  const data = {
    labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
    datasets: [{
      label: '投资回报率',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function loadCryptoList() {
  const cryptoList = document.getElementById('cryptoList');

  // 模拟数据 - 在实际应用中，这些数据应该从后端获取
  const cryptos = [
    { name: 'Bitcoin', price: 50000 },
    { name: 'Ethereum', price: 3000 },
    { name: 'Litecoin', price: 150 }
  ];

  cryptos.forEach(crypto => {
    const li = document.createElement('li');
    li.textContent = `${crypto.name}: $${crypto.price}`;
    cryptoList.appendChild(li);
  });
}

function redirectToLogin() {
  console.log('Redirecting to login page');
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiry');
  window.location.href = 'index.html';
}

function logout() {
  redirectToLogin();
}
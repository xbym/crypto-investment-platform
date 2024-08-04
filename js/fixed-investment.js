// fixed-investment.js
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('fixedInvestmentForm');
  const investmentAmount = document.getElementById('investmentAmount');
  const yearlyReturn = document.getElementById('yearlyReturn');
  const monthlyReturn = document.getElementById('monthlyReturn');

  // 实时计算收益
  investmentAmount.addEventListener('input', calculateReturns);

  // 处理表单提交
  form.addEventListener('submit', handleInvestment);

  function calculateReturns() {
    const amount = parseFloat(investmentAmount.value) || 0;
    const annualRate = 0.15; // 15% 年化率

    const yearly = amount * annualRate;
    const monthly = yearly / 12;

    yearlyReturn.textContent = yearly.toFixed(2);
    monthlyReturn.textContent = monthly.toFixed(2);
  }

  async function handleInvestment(event) {
    event.preventDefault();

    const amount = parseFloat(investmentAmount.value);

    if (amount < 1000) {
      alert('最低投资额为 $1,000');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/fixed-investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await response.json();

      if (response.ok) {
        alert('投资成功！');
        // 可以在这里添加其他成功后的操作，比如更新用户余额显示等
      } else {
        alert(data.message || '投资失败，请重试。');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('投资过程中发生错误，请重试。');
    }
  }
});

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}
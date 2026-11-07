/**
 * SalesPulse Analytics Dashboard
 * Pure Vanilla JavaScript implementation with WebStorage persistence
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'salespulse_transactions_v1';
  let transactions = [];
  let filteredTransactions = [];
  let currentPage = 1;
  const rowsPerPage = 8;

  // Chart instances
  let revenueChartInstance = null;
  let categoryChartInstance = null;
  let targetChartInstance = null;

  // DOM Elements
  const totalRevenueEl = document.getElementById('totalRevenue');
  const revenueTrendEl = document.getElementById('revenueTrend');
  const totalOrdersEl = document.getElementById('totalOrders');
  const ordersTrendEl = document.getElementById('ordersTrend');
  const averageOrderValueEl = document.getElementById('averageOrderValue');
  const aovTrendEl = document.getElementById('aovTrend');
  const fulfillmentRateEl = document.getElementById('fulfillmentRate');
  const refundRateCountEl = document.getElementById('refundRateCount');

  const regionPerformanceList = document.getElementById('regionPerformanceList');
  const transactionsTableBody = document.getElementById('transactionsTableBody');
  const recordCountBadge = document.getElementById('recordCountBadge');
  const tableEmptyState = document.getElementById('tableEmptyState');
  const paginationInfo = document.getElementById('paginationInfo');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const pagePillsContainer = document.getElementById('pagePillsContainer');

  // Filters
  const timeRangeSelect = document.getElementById('timeRangeSelect');
  const categoryFilter = document.getElementById('categoryFilter');
  const statusFilter = document.getElementById('statusFilter');
  const searchInput = document.getElementById('searchInput');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  // Modal & Form
  const addSaleModal = document.getElementById('addSaleModal');
  const openAddModalBtn = document.getElementById('openAddModalBtn');
  const closeAddModalBtn = document.getElementById('closeAddModalBtn');
  const cancelAddModalBtn = document.getElementById('cancelAddModalBtn');
  const addSaleForm = document.getElementById('addSaleForm');
  const saleDateInput = document.getElementById('saleDate');

  // Header Actions
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // --- Initial Seed Dataset Generator ---
  function getSeedDataset() {
    const today = new Date();
    const formatDate = (daysAgo) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };

    return [
      { id: 'TXN-9021', date: formatDate(1), customer: 'Apex Cloud Innovations', product: 'Enterprise Suite License', category: 'Enterprise SaaS', amount: 4800.00, region: 'North America', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-9020', date: formatDate(2), customer: 'Nexus Digital Media', product: 'Cloud Storage Tier 3', category: 'Cloud Storage', amount: 1250.00, region: 'Europe (EMEA)', payment: 'Credit Card', status: 'Completed' },
      { id: 'TXN-9019', date: formatDate(3), customer: 'Veritas BioHealth', product: 'Advanced Security Shield', category: 'Security Suite', amount: 2450.00, region: 'North America', payment: 'Stripe ACH', status: 'Completed' },
      { id: 'TXN-9018', date: formatDate(4), customer: 'Globex Logistics Co', product: 'API Developer License', category: 'API Licenses', amount: 650.00, region: 'Asia Pacific', payment: 'Credit Card', status: 'Pending' },
      { id: 'TXN-9017', date: formatDate(6), customer: 'Solaris Fintech Group', product: 'Strategic Implementation', category: 'Consulting', amount: 3500.00, region: 'Europe (EMEA)', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-9016', date: formatDate(7), customer: 'Quantum Dynamics', product: 'Enterprise SaaS Multi-seat', category: 'Enterprise SaaS', amount: 6200.00, region: 'North America', payment: 'Stripe ACH', status: 'Completed' },
      { id: 'TXN-9015', date: formatDate(9), customer: 'Acme Retail Platforms', product: 'Cloud Storage Tier 1', category: 'Cloud Storage', amount: 350.00, region: 'Latin America', payment: 'PayPal', status: 'Completed' },
      { id: 'TXN-9014', date: formatDate(11), customer: 'Vanguard Systems', product: 'Starter API Pack', category: 'API Licenses', amount: 250.00, region: 'Asia Pacific', payment: 'Credit Card', status: 'Refunded' },
      { id: 'TXN-9013', date: formatDate(12), customer: 'BlueWave Cyber Corp', product: 'Advanced Security Shield', category: 'Security Suite', amount: 2450.00, region: 'Europe (EMEA)', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-9012', date: formatDate(14), customer: 'Starlight Artificial Intel', product: 'Enterprise Suite License', category: 'Enterprise SaaS', amount: 5200.00, region: 'North America', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-9011', date: formatDate(16), customer: 'Summit Global Ventures', product: 'Cloud Storage Tier 3', category: 'Cloud Storage', amount: 1250.00, region: 'Asia Pacific', payment: 'Credit Card', status: 'Completed' },
      { id: 'TXN-9010', date: formatDate(18), customer: 'Horizon Robotics', product: 'Infrastructure Security Audit', category: 'Consulting', amount: 2800.00, region: 'North America', payment: 'Stripe ACH', status: 'Completed' },
      { id: 'TXN-9009', date: formatDate(19), customer: 'Zenith Retail Solutions', product: 'API High-Volume License', category: 'API Licenses', amount: 890.00, region: 'Latin America', payment: 'PayPal', status: 'Completed' },
      { id: 'TXN-9008', date: formatDate(22), customer: 'Alpha Stream Networks', product: 'Cloud Storage Tier 3', category: 'Cloud Storage', amount: 1250.00, region: 'Europe (EMEA)', payment: 'Credit Card', status: 'Pending' },
      { id: 'TXN-9007', date: formatDate(24), customer: 'Omni Worldwide Media', product: 'Enterprise Suite License', category: 'Enterprise SaaS', amount: 4800.00, region: 'North America', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-9006', date: formatDate(27), customer: 'Titanium Labs Inc', product: 'Advanced Security Shield', category: 'Security Suite', amount: 2450.00, region: 'Asia Pacific', payment: 'Credit Card', status: 'Completed' },
      { id: 'TXN-9005', date: formatDate(29), customer: 'Pinnacle Capital Partners', product: 'Strategic Implementation', category: 'Consulting', amount: 4200.00, region: 'North America', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-9004', date: formatDate(33), customer: 'Echo Medical Device Co', product: 'Cloud Storage Tier 1', category: 'Cloud Storage', amount: 350.00, region: 'Europe (EMEA)', payment: 'PayPal', status: 'Refunded' },
      { id: 'TXN-9003', date: formatDate(38), customer: 'Catalyst Software Group', product: 'API Developer License', category: 'API Licenses', amount: 650.00, region: 'North America', payment: 'Credit Card', status: 'Completed' },
      { id: 'TXN-9002', date: formatDate(42), customer: 'Aegis Sentinel Defense', product: 'Advanced Security Shield', category: 'Security Suite', amount: 2450.00, region: 'Europe (EMEA)', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-9001', date: formatDate(48), customer: 'Aurora Energy Tech', product: 'Enterprise Suite License', category: 'Enterprise SaaS', amount: 4800.00, region: 'North America', payment: 'Stripe ACH', status: 'Completed' },
      { id: 'TXN-9000', date: formatDate(55), customer: 'Terra Verde Agriculture', product: 'Cloud Storage Tier 3', category: 'Cloud Storage', amount: 1250.00, region: 'Latin America', payment: 'Credit Card', status: 'Completed' },
      { id: 'TXN-8999', date: formatDate(62), customer: 'Metro Urban Mobility', product: 'Strategic Implementation', category: 'Consulting', amount: 3100.00, region: 'Europe (EMEA)', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-8998', date: formatDate(70), customer: 'Pacific Rim Trade Hub', product: 'Enterprise SaaS Multi-seat', category: 'Enterprise SaaS', amount: 7400.00, region: 'Asia Pacific', payment: 'Wire Transfer', status: 'Completed' },
      { id: 'TXN-8997', date: formatDate(85), customer: 'Vector Cyber Intelligence', product: 'Advanced Security Shield', category: 'Security Suite', amount: 2450.00, region: 'North America', payment: 'Credit Card', status: 'Completed' }
    ];
  }

  // --- Storage Helper Functions ---
  function loadTransactions() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          transactions = parsed;
          return;
        }
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
    // Fallback to seed data
    transactions = getSeedDataset();
    saveTransactions();
  }

  function saveTransactions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      showToast('Error saving data to WebStorage', 'error');
    }
  }

  // --- Toast Notifications ---
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = message;
    toastNotification.classList.add('active');
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 3200);
  }

  // --- Currency & Number Formatters ---
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  function formatCompactCurrency(amount) {
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toFixed(0);
  }

  // --- Filter & Search Logic ---
  function applyFilters() {
    const timeRange = timeRangeSelect.value;
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;
    const query = searchInput.value.trim().toLowerCase();

    const now = new Date();
    let cutoffDate = null;

    if (timeRange === '7d') {
      cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - 30);
    } else if (timeRange === '90d') {
      cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - 90);
    } else if (timeRange === 'year') {
      cutoffDate = new Date();
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }

    filteredTransactions = transactions.filter(t => {
      // Time range check
      if (cutoffDate) {
        const tDate = new Date(t.date);
        if (tDate < cutoffDate) return false;
      }

      // Category check
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }

      // Status check
      if (selectedStatus !== 'all' && t.status !== selectedStatus) {
        return false;
      }

      // Search query check
      if (query) {
        const matchCustomer = t.customer.toLowerCase().includes(query);
        const matchProduct = t.product.toLowerCase().includes(query);
        const matchId = t.id.toLowerCase().includes(query);
        const matchCategory = t.category.toLowerCase().includes(query);
        if (!matchCustomer && !matchProduct && !matchId && !matchCategory) {
          return false;
        }
      }

      return true;
    });

    // Sort most recent first
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    currentPage = 1;
    renderDashboard();
  }

  // --- Dashboard Rendering ---
  function renderDashboard() {
    updateKPIs();
    updateCharts();
    updateRegionBreakdown();
    renderTable();
  }

  // 1. KPI Cards Calculation
  function updateKPIs() {
    const completedSales = filteredTransactions.filter(t => t.status === 'Completed');
    const totalRev = completedSales.reduce((sum, t) => sum + Number(t.amount), 0);
    const orderCount = filteredTransactions.length;
    const completedCount = completedSales.length;
    const refundCount = filteredTransactions.filter(t => t.status === 'Refunded').length;

    const aov = completedCount > 0 ? (totalRev / completedCount) : 0;
    const fulfillmentRate = orderCount > 0 ? Math.round((completedCount / orderCount) * 100) : 0;

    totalRevenueEl.textContent = formatCurrency(totalRev);
    totalOrdersEl.textContent = orderCount.toLocaleString();
    averageOrderValueEl.textContent = formatCurrency(aov);
    fulfillmentRateEl.textContent = `${fulfillmentRate}%`;
    refundRateCountEl.textContent = `${refundCount} refunded / ${orderCount - completedCount - refundCount} pending`;

    // Dynamic trend calculation based on current vs earlier slice
    const half = Math.floor(filteredTransactions.length / 2);
    if (half >= 2) {
      const recentSlice = filteredTransactions.slice(0, half).filter(t => t.status === 'Completed');
      const priorSlice = filteredTransactions.slice(half).filter(t => t.status === 'Completed');

      const recentSum = recentSlice.reduce((acc, t) => acc + Number(t.amount), 0);
      const priorSum = priorSlice.reduce((acc, t) => acc + Number(t.amount), 0);

      if (priorSum > 0) {
        const pctDiff = ((recentSum - priorSum) / priorSum) * 100;
        const sign = pctDiff >= 0 ? '+' : '';
        const badgeClass = pctDiff >= 0 ? 'positive' : 'negative';
        revenueTrendEl.innerHTML = `<span class="trend-badge ${badgeClass}">${sign}${pctDiff.toFixed(1)}%</span> <span class="trend-label">trend trajectory</span>`;
      } else {
        revenueTrendEl.innerHTML = `<span class="trend-badge positive">+100%</span> <span class="trend-label">new revenue</span>`;
      }
    } else {
      revenueTrendEl.innerHTML = `<span class="trend-badge neutral">Active</span> <span class="trend-label">current window</span>`;
    }
  }

  // 2. Charts Rendering
  function updateCharts() {
    if (typeof Chart === 'undefined') return;

    renderRevenueTrendChart();
    renderCategoryChart();
    renderTargetChart();
  }

  function renderRevenueTrendChart() {
    const ctx = document.getElementById('revenueTrendChart');
    if (!ctx) return;

    // Aggregate completed revenue by date
    const dateMap = {};
    const sortedChronological = [...filteredTransactions]
      .filter(t => t.status === 'Completed')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedChronological.forEach(t => {
      dateMap[t.date] = (dateMap[t.date] || 0) + Number(t.amount);
    });

    const labels = Object.keys(dateMap);
    const dataValues = Object.values(dateMap);

    // If few data points, format nicely
    const displayLabels = labels.map(d => {
      const dateObj = new Date(d);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    if (revenueChartInstance) {
      revenueChartInstance.destroy();
    }

    revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: displayLabels.length ? displayLabels : ['No Data'],
        datasets: [{
          label: 'Revenue ($)',
          data: dataValues.length ? dataValues : [0],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointBackgroundColor: '#4f46e5',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#ffffff',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return ` Revenue: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } }
          },
          y: {
            border: { dash: [4, 4] },
            grid: { color: '#e2e8f0' },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              callback: function (val) {
                return formatCompactCurrency(val);
              }
            }
          }
        }
      }
    });
  }

  function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const categoryMap = {};
    filteredTransactions.filter(t => t.status === 'Completed').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
    });

    const categories = Object.keys(categoryMap);
    const amounts = Object.values(categoryMap);

    const palette = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'];

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categories.length ? categories : ['None'],
        datasets: [{
          data: amounts.length ? amounts : [1],
          backgroundColor: palette.slice(0, Math.max(categories.length, 1)),
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              color: '#475569',
              font: { size: 11, weight: '500' }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return ` ${context.label}: ${formatCurrency(context.parsed)}`;
              }
            }
          }
        }
      }
    });
  }

  function renderTargetChart() {
    const ctx = document.getElementById('targetChart');
    if (!ctx) return;

    // Group actual revenue by month
    const monthActual = {};
    filteredTransactions.filter(t => t.status === 'Completed').forEach(t => {
      const date = new Date(t.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthActual[monthKey] = (monthActual[monthKey] || 0) + Number(t.amount);
    });

    let months = Object.keys(monthActual);
    if (months.length === 0) {
      months = ['Prev Month', 'Current Month'];
    }

    // Realistic target for comparison
    const targetValues = months.map(m => {
      const actual = monthActual[m] || 5000;
      return Math.round(Math.max(actual * 1.15, 8000));
    });

    const actualValues = months.map(m => monthActual[m] || 0);

    if (targetChartInstance) {
      targetChartInstance.destroy();
    }

    targetChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Target',
            data: targetValues,
            backgroundColor: '#cbd5e1',
            borderRadius: 6,
            barPercentage: 0.65
          },
          {
            label: 'Actual',
            data: actualValues,
            backgroundColor: '#4f46e5',
            borderRadius: 6,
            barPercentage: 0.65
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 10,
              padding: 10,
              color: '#475569',
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function (context) {
                return ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } }
          },
          y: {
            border: { dash: [4, 4] },
            grid: { color: '#e2e8f0' },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              callback: function (val) {
                return formatCompactCurrency(val);
              }
            }
          }
        }
      }
    });
  }

  // 3. Regional Performance Breakdown
  function updateRegionBreakdown() {
    const regionMap = {
      'North America': { revenue: 0, orders: 0, color: '#4f46e5' },
      'Europe (EMEA)': { revenue: 0, orders: 0, color: '#06b6d4' },
      'Asia Pacific': { revenue: 0, orders: 0, color: '#10b981' },
      'Latin America': { revenue: 0, orders: 0, color: '#f59e0b' }
    };

    filteredTransactions.forEach(t => {
      const reg = regionMap[t.region] || (regionMap[t.region] = { revenue: 0, orders: 0, color: '#6366f1' });
      reg.orders++;
      if (t.status === 'Completed') {
        reg.revenue += Number(t.amount);
      }
    });

    const totalRegRev = Object.values(regionMap).reduce((acc, r) => acc + r.revenue, 0) || 1;

    // Sort regions by revenue descending
    const sortedRegions = Object.entries(regionMap).sort((a, b) => b[1].revenue - a[1].revenue);

    regionPerformanceList.innerHTML = sortedRegions.map(([name, data]) => {
      const pct = Math.round((data.revenue / totalRegRev) * 100);
      return `
        <div class="region-item">
          <div class="region-item-top">
            <span class="region-name">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${data.color}"></span>
              ${name}
            </span>
            <span class="region-metrics">${formatCurrency(data.revenue)} <span style="font-weight:400; color:#64748b; font-size:12px">(${pct}%)</span></span>
          </div>
          <div class="region-bar-bg">
            <div class="region-bar-fill" style="width: ${pct}%; background-color: ${data.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 4. Data Table Rendering & Pagination
  function renderTable() {
    const totalRecords = filteredTransactions.length;
    recordCountBadge.textContent = `${totalRecords} ${totalRecords === 1 ? 'sale' : 'sales'}`;

    if (totalRecords === 0) {
      transactionsTableBody.innerHTML = '';
      tableEmptyState.style.display = 'flex';
      paginationInfo.textContent = 'Showing 0 of 0 entries';
      prevPageBtn.disabled = true;
      nextPageBtn.disabled = true;
      pagePillsContainer.innerHTML = '';
      return;
    }

    tableEmptyState.style.display = 'none';

    const totalPages = Math.ceil(totalRecords / rowsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalRecords);
    const pageRecords = filteredTransactions.slice(startIdx, endIdx);

    transactionsTableBody.innerHTML = pageRecords.map(item => {
      const statusClass = `status-${item.status.toLowerCase()}`;
      return `
        <tr>
          <td class="font-medium" style="color: #4f46e5;">${escapeHtml(item.id)}</td>
          <td>${escapeHtml(item.date)}</td>
          <td class="font-medium">${escapeHtml(item.customer)}</td>
          <td>${escapeHtml(item.product)}</td>
          <td><span style="color: #475569; font-size: 12px; background: #f1f5f9; padding: 2px 7px; border-radius: 4px;">${escapeHtml(item.category)}</span></td>
          <td class="text-right font-medium">${formatCurrency(item.amount)}</td>
          <td><span style="color: #64748b; font-size: 12px;">${escapeHtml(item.payment)}</span></td>
          <td>
            <span class="status-pill ${statusClass}">
              <span class="status-dot"></span>
              ${escapeHtml(item.status)}
            </span>
          </td>
          <td class="text-center">
            <button class="action-btn-del" data-id="${escapeHtml(item.id)}" title="Delete record">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Update Pagination UI
    paginationInfo.textContent = `Showing ${startIdx + 1}-${endIdx} of ${totalRecords} entries`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    renderPaginationPills(totalPages);

    // Attach row delete listeners
    document.querySelectorAll('.action-btn-del').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-id');
        deleteTransaction(id);
      });
    });
  }

  function renderPaginationPills(totalPages) {
    pagePillsContainer.innerHTML = '';
    const maxVisiblePills = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePills - 1);

    if (endPage - startPage + 1 < maxVisiblePills) {
      startPage = Math.max(1, endPage - maxVisiblePills + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
      const pill = document.createElement('button');
      pill.className = `page-pill ${p === currentPage ? 'active' : ''}`;
      pill.textContent = p;
      pill.addEventListener('click', () => {
        currentPage = p;
        renderTable();
      });
      pagePillsContainer.appendChild(pill);
    }
  }

  function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    applyFilters();
    showToast(`Transaction ${id} removed`);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Modal Operations ---
  function openModal() {
    addSaleForm.reset();
    saleDateInput.value = new Date().toISOString().split('T')[0];
    addSaleModal.classList.add('active');
  }

  function closeModal() {
    addSaleModal.classList.remove('active');
  }

  // --- Export to CSV ---
  function exportToCsv() {
    if (filteredTransactions.length === 0) {
      showToast('No transaction data to export');
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Customer', 'Product', 'Category', 'Amount (USD)', 'Region', 'Payment Method', 'Status'];
    const rows = filteredTransactions.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.customer.replace(/"/g, '""')}"`,
      `"${t.product.replace(/"/g, '""')}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      `"${t.region}"`,
      `"${t.payment}"`,
      `"${t.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported filtered sales to CSV');
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Filters
    timeRangeSelect.addEventListener('change', applyFilters);
    categoryFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);

    clearFiltersBtn.addEventListener('click', () => {
      timeRangeSelect.value = 'all';
      categoryFilter.value = 'all';
      statusFilter.value = 'all';
      searchInput.value = '';
      applyFilters();
    });

    // Pagination
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });

    // Modal Triggers
    openAddModalBtn.addEventListener('click', openModal);
    closeAddModalBtn.addEventListener('click', closeModal);
    cancelAddModalBtn.addEventListener('click', closeModal);

    addSaleModal.addEventListener('click', (e) => {
      if (e.target === addSaleModal) closeModal();
    });

    // Form Submit
    addSaleForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const customer = document.getElementById('saleCustomer').value.trim();
      const date = document.getElementById('saleDate').value;
      const product = document.getElementById('saleProduct').value.trim();
      const category = document.getElementById('saleCategory').value;
      const amount = parseFloat(document.getElementById('saleAmount').value);
      const region = document.getElementById('saleRegion').value;
      const payment = document.getElementById('salePayment').value;
      const status = document.getElementById('saleStatus').value;

      if (!customer || !product || isNaN(amount) || amount <= 0) {
        alert('Please fill out all required fields with valid values.');
        return;
      }

      // Generate random high-sequence ID
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newTransaction = {
        id: `TXN-${randomNum}`,
        date,
        customer,
        product,
        category,
        amount: Number(amount.toFixed(2)),
        region,
        payment,
        status
      };

      transactions.unshift(newTransaction);
      saveTransactions();
      closeModal();
      applyFilters();
      showToast(`Sale recorded successfully for ${customer}!`);
    });

    // Reset Demo Data
    resetDemoBtn.addEventListener('click', () => {
      if (confirm('Reset dashboard to fresh demo dataset? Any custom additions will be restored to defaults.')) {
        transactions = getSeedDataset();
        saveTransactions();
        applyFilters();
        showToast('Demo data successfully restored');
      }
    });

    // CSV Export
    exportCsvBtn.addEventListener('click', exportToCsv);
  }

  // --- Bootstrap Application ---
  function init() {
    loadTransactions();
    setupEventListeners();
    applyFilters();
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


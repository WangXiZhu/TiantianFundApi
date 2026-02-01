/**
 * 基金管理助手 - 前端交互逻辑
 */

// API 基础地址
const API_BASE = '';

// 本地存储 Key
const STORAGE_KEY = 'my_funds';
const LAST_REFRESH_KEY = 'last_refresh_time';

// 请求频率限制（毫秒）- 30分钟
const REFRESH_INTERVAL = 30 * 60 * 1000;

// DOM 元素
const elements = {
  fundCodeInput: document.getElementById('fundCodeInput'),
  searchBtn: document.getElementById('searchBtn'),
  previewCard: document.getElementById('previewCard'),
  addFundBtn: document.getElementById('addFundBtn'),
  refreshAllBtn: document.getElementById('refreshAllBtn'),
  fundsList: document.getElementById('fundsList'),
  toast: document.getElementById('toast'),
  loading: document.getElementById('loading'),
  // 预览区域元素
  previewName: document.getElementById('previewName'),
  previewCode: document.getElementById('previewCode'),
  previewNav: document.getElementById('previewNav'),
  previewChange: document.getElementById('previewChange'),
  previewType: document.getElementById('previewType'),
  previewCompany: document.getElementById('previewCompany'),
  amountInput: document.getElementById('amountInput'),
  // 资产统计元素
  statsSection: document.getElementById('statsSection'),
  listHeader: document.getElementById('listHeader'),
  emptySection: document.getElementById('emptySection'),
  totalAmount: document.getElementById('totalAmount'),
  todayProfit: document.getElementById('todayProfit'),
  // 弹窗元素
  addModal: document.getElementById('addModal'),
  openModalBtn: document.getElementById('openModalBtn'),
  closeModal: document.getElementById('closeModal'),
  modalOverlay: document.getElementById('modalOverlay'),
};

// 当前预览的基金数据
let currentPreviewFund = null;

// ==================== 工具函数 ====================

/**
 * 显示 Toast 提示
 */
function showToast(message, type = 'info') {
  elements.toast.textContent = message;
  elements.toast.className = `toast ${type}`;
  elements.toast.classList.add('show');
  elements.toast.classList.remove('hidden');
  
  setTimeout(() => {
    elements.toast.classList.remove('show');
    setTimeout(() => elements.toast.classList.add('hidden'), 300);
  }, 3000);
}

/**
 * 显示/隐藏加载状态
 */
function setLoading(show) {
  if (show) {
    elements.loading.classList.remove('hidden');
  } else {
    elements.loading.classList.add('hidden');
  }
}

/**
 * 从本地存储获取基金列表
 */
function getFundsFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

/**
 * 保存基金列表到本地存储
 */
function saveFundsToStorage(funds) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(funds));
}

/**
 * 格式化涨跌幅
 */
function formatChange(value) {
  if (value === null || value === undefined || value === '--') {
    return { text: '--', className: '' };
  }
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { text: '--', className: '' };
  }
  const sign = num >= 0 ? '+' : '';
  const className = num >= 0 ? 'up' : 'down';
  return { text: `${sign}${num.toFixed(2)}%`, className };
}

/**
 * 格式化净值
 */
function formatNav(value) {
  if (value === null || value === undefined || value === '--') {
    return '--';
  }
  const num = parseFloat(value);
  return isNaN(num) ? '--' : num.toFixed(4);
}

/**
 * 格式化金额
 */
function formatMoney(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '¥0.00';
  const sign = num >= 0 ? '' : '-';
  return `${sign}¥${Math.abs(num).toFixed(2)}`;
}

/**
 * 计算今日收益
 * 今日收益 = 持仓金额 * 日涨跌幅%
 */
function calculateTodayProfit(amount, changePercent) {
  const amountNum = parseFloat(amount) || 0;
  const changeNum = parseFloat(changePercent) || 0;
  return amountNum * changeNum / 100;
}

/**
 * 计算收益相关数据
 */
function calculateProfitData(funds) {
  let totalAmount = 0;
  let todayProfit = 0;
  let totalProfit = 0;

  funds.forEach(fund => {
    const amount = parseFloat(fund.amount) || 0;
    const changePercent = parseFloat(fund.change) || 0;
    const accumulated = parseFloat(fund.accumulatedProfit) || 0;
    
    totalAmount += amount;
    todayProfit += calculateTodayProfit(amount, changePercent);
    totalProfit += accumulated;
  });

  // 加上今日收益到累计收益
  totalProfit += todayProfit;

  const todayProfitRate = totalAmount > 0 ? (todayProfit / totalAmount * 100) : 0;

  return {
    totalAmount,
    todayProfit,
    todayProfitRate,
    totalProfit
  };
}

// ==================== API 请求 ====================

/**
 * 获取基金详情
 */
async function fetchFundDetail(fcode) {
  const response = await fetch(`${API_BASE}/fundMNDetailInformation?FCODE=${fcode}`);
  if (!response.ok) throw new Error('请求失败');
  return response.json();
}

/**
 * 获取基金净值
 */
async function fetchFundNav(fcode) {
  const response = await fetch(`${API_BASE}/fundMNHisNetList?FCODE=${fcode}&pageIndex=1&pagesize=1`);
  if (!response.ok) throw new Error('请求失败');
  return response.json();
}

/**
 * 获取基金简介
 */
async function fetchFundInfo(fcode) {
  const response = await fetch(`${API_BASE}/fundMNStopWatch?FCODE=${fcode}`);
  if (!response.ok) throw new Error('请求失败');
  return response.json();
}

// ==================== 业务逻辑 ====================

/**
 * 搜索基金
 */
async function searchFund() {
  const code = elements.fundCodeInput.value.trim();
  
  if (!code) {
    showToast('请输入基金代码', 'error');
    return;
  }
  
  if (!/^\d{6}$/.test(code)) {
    showToast('请输入6位数字的基金代码', 'error');
    return;
  }
  
  setLoading(true);
  
  try {
    // 并行请求基金详情和净值
    const [detailRes, navRes] = await Promise.all([
      fetchFundDetail(code),
      fetchFundNav(code)
    ]);
    
    // 检查是否有数据
    if (!detailRes.Datas || !detailRes.Datas.FCODE) {
      showToast('未找到该基金，请检查代码是否正确', 'error');
      return;
    }
    
    const detail = detailRes.Datas;
    const navData = navRes.Datas && navRes.Datas[0];
    
    // 组装预览数据
    currentPreviewFund = {
      code: detail.FCODE,
      name: detail.SHORTNAME,
      fullName: detail.FULLNAME,
      type: detail.FTYPE,
      company: detail.JJGS,
      manager: detail.JJJL,
      nav: navData ? navData.DWJZ : '--',
      change: navData ? navData.JZZZL : '--',
      updateTime: navData ? navData.FSRQ : '--',
      addedAt: new Date().toISOString()
    };
    
    // 更新预览卡片
    updatePreviewCard(currentPreviewFund);
    elements.previewCard.classList.remove('hidden');
    
  } catch (error) {
    console.error('搜索失败:', error);
    showToast('查询失败，请稍后重试', 'error');
  } finally {
    setLoading(false);
  }
}

/**
 * 更新预览卡片
 */
function updatePreviewCard(fund) {
  elements.previewName.textContent = fund.name;
  elements.previewCode.textContent = fund.code;
  elements.previewNav.textContent = formatNav(fund.nav);
  
  const change = formatChange(fund.change);
  elements.previewChange.textContent = change.text;
  elements.previewChange.className = `stat-value ${change.className}`;
  
  elements.previewType.textContent = fund.type || '--';
  elements.previewCompany.textContent = fund.company || '--';
}

/**
 * 添加基金到本地存储
 */
function addFund() {
  if (!currentPreviewFund) {
    showToast('请先查询基金', 'error');
    return;
  }
  
  const amount = parseFloat(elements.amountInput.value) || 0;
  
  if (amount <= 0) {
    showToast('请输入有效的持仓金额', 'error');
    return;
  }
  
  const funds = getFundsFromStorage();
  
  // 检查是否已存在
  if (funds.some(f => f.code === currentPreviewFund.code)) {
    showToast('该基金已在列表中', 'error');
    return;
  }
  
  // 添加到列表，包含金额和累计收益
  const fundWithAmount = {
    ...currentPreviewFund,
    amount: amount,
    accumulatedProfit: 0, // 累计收益初始为0
    lastUpdateDate: currentPreviewFund.updateTime // 记录最后更新日期用于判断是否需要累加收益
  };
  
  funds.unshift(fundWithAmount);
  saveFundsToStorage(funds);
  
  // 刷新列表
  renderFundsList();
  
  // 关闭弹窗并清空
  elements.addModal.classList.add('hidden');
  elements.previewCard.classList.add('hidden');
  elements.fundCodeInput.value = '';
  elements.amountInput.value = '';
  currentPreviewFund = null;
  
  showToast('添加成功！', 'success');
}

/**
 * 删除基金
 */
function deleteFund(code) {
  if (!confirm('确定要删除这只基金吗？')) {
    return;
  }
  
  let funds = getFundsFromStorage();
  funds = funds.filter(f => f.code !== code);
  saveFundsToStorage(funds);
  
  renderFundsList();
  showToast('已删除', 'success');
}

/**
 * 刷新单只基金数据
 */
async function refreshFund(code, forceRefresh = false) {
  // 检查请求频率限制
  if (!forceRefresh && !canRefresh()) {
    const remainingTime = getRefreshRemainingTime();
    showToast(`请 ${remainingTime} 后再刷新`, 'error');
    return;
  }
  
  setLoading(true);
  
  try {
    const [detailRes, navRes] = await Promise.all([
      fetchFundDetail(code),
      fetchFundNav(code)
    ]);
    
    const detail = detailRes.Datas;
    const navData = navRes.Datas && navRes.Datas[0];
    
    let funds = getFundsFromStorage();
    const index = funds.findIndex(f => f.code === code);
    
    if (index !== -1) {
      const oldFund = funds[index];
      const newUpdateDate = navData ? navData.FSRQ : oldFund.updateTime;
      
      // 如果是新的一天，将昨日收益累加到累计收益中
      let accumulatedProfit = parseFloat(oldFund.accumulatedProfit) || 0;
      if (oldFund.lastUpdateDate && newUpdateDate && oldFund.lastUpdateDate !== newUpdateDate) {
        // 计算旧的今日收益并累加
        const oldTodayProfit = calculateTodayProfit(oldFund.amount, oldFund.change);
        accumulatedProfit += oldTodayProfit;
      }
      
      funds[index] = {
        ...oldFund,
        name: detail.SHORTNAME,
        type: detail.FTYPE,
        company: detail.JJGS,
        nav: navData ? navData.DWJZ : '--',
        change: navData ? navData.JZZZL : '--',
        updateTime: newUpdateDate,
        lastUpdateDate: newUpdateDate,
        accumulatedProfit: accumulatedProfit
      };
      
      saveFundsToStorage(funds);
      updateLastRefreshTime();
      renderFundsList();
      showToast('刷新成功', 'success');
    }
  } catch (error) {
    console.error('刷新失败:', error);
    showToast('刷新失败', 'error');
  } finally {
    setLoading(false);
  }
}

/**
 * 刷新所有基金数据
 */
async function refreshAllFunds(forceRefresh = false) {
  const funds = getFundsFromStorage();
  
  if (funds.length === 0) {
    showToast('暂无基金需要刷新', 'error');
    return;
  }
  
  // 检查请求频率限制
  if (!forceRefresh && !canRefresh()) {
    const remainingTime = getRefreshRemainingTime();
    showToast(`请 ${remainingTime} 后再刷新`, 'error');
    return;
  }
  
  setLoading(true);
  
  try {
    const updatedFunds = await Promise.all(
      funds.map(async (fund) => {
        try {
          const [detailRes, navRes] = await Promise.all([
            fetchFundDetail(fund.code),
            fetchFundNav(fund.code)
          ]);
          
          const detail = detailRes.Datas;
          const navData = navRes.Datas && navRes.Datas[0];
          
          return {
            ...fund,
            name: detail.SHORTNAME || fund.name,
            type: detail.FTYPE || fund.type,
            company: detail.JJGS || fund.company,
            nav: navData ? navData.DWJZ : fund.nav,
            change: navData ? navData.JZZZL : fund.change,
            updateTime: navData ? navData.FSRQ : fund.updateTime
          };
        } catch {
          return fund;
        }
      })
    );
    
    saveFundsToStorage(updatedFunds);
    updateLastRefreshTime();
    renderFundsList();
    showToast(`已刷新 ${funds.length} 只基金`, 'success');
  } catch (error) {
    console.error('批量刷新失败:', error);
    showToast('刷新失败', 'error');
  } finally {
    setLoading(false);
  }
}

/**
 * 检查是否可以刷新（频率限制）
 */
function canRefresh() {
  const lastRefresh = localStorage.getItem(LAST_REFRESH_KEY);
  if (!lastRefresh) return true;
  
  const elapsed = Date.now() - parseInt(lastRefresh, 10);
  return elapsed >= REFRESH_INTERVAL;
}

/**
 * 更新上次刷新时间
 */
function updateLastRefreshTime() {
  localStorage.setItem(LAST_REFRESH_KEY, Date.now().toString());
}

/**
 * 获取距离下次可刷新的剩余时间（格式化）
 */
function getRefreshRemainingTime() {
  const lastRefresh = localStorage.getItem(LAST_REFRESH_KEY);
  if (!lastRefresh) return '0分钟';
  
  const elapsed = Date.now() - parseInt(lastRefresh, 10);
  const remaining = REFRESH_INTERVAL - elapsed;
  
  if (remaining <= 0) return '0分钟';
  
  const minutes = Math.ceil(remaining / 60000);
  return `${minutes}分钟`;
}

/**
 * 渲染基金列表
 */
function renderFundsList() {
  const funds = getFundsFromStorage();
  
  // 计算并更新资产统计
  updateStats(funds);
  
  // 空状态处理
  if (funds.length === 0) {
    elements.fundsList.innerHTML = '';
    elements.emptySection.classList.remove('hidden');
    elements.listHeader.classList.add('hidden');
    return;
  }
  
  elements.emptySection.classList.add('hidden');
  elements.listHeader.classList.remove('hidden');
  
  // 渲染列表
  elements.fundsList.innerHTML = funds.map(fund => {
    const change = formatChange(fund.change);
    const amount = parseFloat(fund.amount) || 0;
    const todayProfit = calculateTodayProfit(fund.amount, fund.change);
    const accumulatedProfit = parseFloat(fund.accumulatedProfit) || 0;
    const totalHoldProfit = accumulatedProfit + todayProfit;
    
    const todayProfitFormatted = formatProfitValue(todayProfit);
    const holdProfitFormatted = formatProfitValue(totalHoldProfit);
    const holdProfitRate = amount > 0 ? (totalHoldProfit / amount * 100) : 0;
    
    return `
      <div class="fund-row" data-code="${fund.code}">
        <div class="fund-info">
          <div class="fund-name">${fund.name}</div>
          <div class="fund-meta">
            <span class="fund-amount">¥${amount.toLocaleString('zh-CN', {minimumFractionDigits: 2})}</span>
            <span>${fund.code}</span>
          </div>
        </div>
        <div class="fund-col">
          <span class="fund-col-main ${change.className}">${change.text}</span>
          <span class="fund-col-sub">${formatNav(fund.nav)}</span>
        </div>
        <div class="fund-col">
          <span class="fund-col-main ${todayProfitFormatted.className}">${formatMoneyShort(todayProfit)}</span>
        </div>
        <div class="fund-col">
          <span class="fund-col-main ${holdProfitFormatted.className}">${formatMoneyShort(totalHoldProfit)}</span>
          <span class="fund-col-sub ${holdProfitFormatted.className}">${holdProfitRate >= 0 ? '+' : ''}${holdProfitRate.toFixed(2)}%</span>
        </div>
        <div class="fund-actions">
          <button class="fund-action-btn delete" onclick="deleteFund('${fund.code}')" title="删除">×</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 格式化金额（短格式）
 */
function formatMoneyShort(value) {
  const num = parseFloat(value) || 0;
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(2)}`;
}

/**
 * 格式化收益值
 */
function formatProfitValue(value) {
  const num = parseFloat(value) || 0;
  const sign = num >= 0 ? '+' : '';
  const className = num >= 0 ? 'up' : 'down';
  return {
    text: `${sign}${formatMoney(num).replace('¥', '¥')}`,
    className
  };
}

/**
 * 更新资产统计
 */
function updateStats(funds) {
  const hasAmountFunds = funds.some(f => parseFloat(f.amount) > 0);
  
  if (!hasAmountFunds || funds.length === 0) {
    elements.statsSection.classList.add('hidden');
    return;
  }
  
  elements.statsSection.classList.remove('hidden');
  
  const stats = calculateProfitData(funds);
  
  // 总资产
  elements.totalAmount.textContent = stats.totalAmount.toLocaleString('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  });
  
  // 今日收益
  const sign = stats.todayProfit >= 0 ? '+' : '';
  elements.todayProfit.textContent = `${sign}${stats.todayProfit.toFixed(2)}`;
  elements.todayProfit.className = `stats-profit-value ${stats.todayProfit >= 0 ? 'up' : 'down'}`;
}

/**
 * 编辑持仓金额
 */
function editAmount(code) {
  const funds = getFundsFromStorage();
  const fund = funds.find(f => f.code === code);
  
  if (!fund) return;
  
  const newAmount = prompt(`请输入新的持仓金额（当前：${fund.amount || 0}元）：`, fund.amount || '');
  
  if (newAmount === null) return; // 用户取消
  
  const amount = parseFloat(newAmount);
  if (isNaN(amount) || amount < 0) {
    showToast('请输入有效的金额', 'error');
    return;
  }
  
  const index = funds.findIndex(f => f.code === code);
  if (index !== -1) {
    funds[index].amount = amount;
    saveFundsToStorage(funds);
    renderFundsList();
    showToast('金额已更新', 'success');
  }
}

// ==================== 事件绑定 ====================

// 搜索按钮点击
elements.searchBtn.addEventListener('click', searchFund);

// 输入框回车
elements.fundCodeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchFund();
  }
});

// 添加基金
elements.addFundBtn.addEventListener('click', addFund);

// 刷新所有（使用箭头函数避免事件对象被误作参数）
elements.refreshAllBtn.addEventListener('click', () => refreshAllFunds());

// 输入框只允许数字
elements.fundCodeInput.addEventListener('input', (e) => {
  e.target.value = e.target.value.replace(/\D/g, '');
});

// ==================== 弹窗控制 ====================

/**
 * 打开添加基金弹窗
 */
function openModal() {
  elements.addModal.classList.remove('hidden');
  elements.fundCodeInput.value = '';
  elements.amountInput.value = '';
  elements.previewCard.classList.add('hidden');
  currentPreviewFund = null;
  // 聚焦到输入框
  setTimeout(() => elements.fundCodeInput.focus(), 100);
}

/**
 * 关闭添加基金弹窗
 */
function closeModal() {
  elements.addModal.classList.add('hidden');
  elements.fundCodeInput.value = '';
  elements.amountInput.value = '';
  elements.previewCard.classList.add('hidden');
  currentPreviewFund = null;
}

// 打开弹窗
elements.openModalBtn.addEventListener('click', openModal);

// 关闭弹窗
elements.closeModal.addEventListener('click', closeModal);
elements.modalOverlay.addEventListener('click', closeModal);

// ESC 键关闭弹窗
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !elements.addModal.classList.contains('hidden')) {
    closeModal();
  }
});

// ==================== 初始化 ====================

// 页面加载时渲染列表
document.addEventListener('DOMContentLoaded', () => {
  renderFundsList();
});

// 将函数暴露到全局作用域，供 onclick 调用
window.deleteFund = deleteFund;
window.refreshFund = refreshFund;
window.editAmount = editAmount;

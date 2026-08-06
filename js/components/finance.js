import { store } from '../store.js';

export function renderFinance(container) {
  try {
    const { data } = store;

    // Clean Slate Fallbacks
    if (!data.finance) {
      data.finance = {
        incomeSources: [],
        categories: [
          { id: 'cat-1', name: '🍔 Food', allocated: 0, spent: 0 },
          { id: 'cat-2', name: '🛒 Shopping', allocated: 0, spent: 0 },
          { id: 'cat-3', name: '🚗 Transportation', allocated: 0, spent: 0 },
          { id: 'cat-4', name: '📚 School', allocated: 0, spent: 0 },
          { id: 'cat-5', name: '🏠 Dorm / Housing', allocated: 0, spent: 0 },
          { id: 'cat-6', name: '💻 Tech', allocated: 0, spent: 0 },
          { id: 'cat-7', name: '🎮 Entertainment', allocated: 0, spent: 0 },
          { id: 'cat-8', name: '🎁 Gifts', allocated: 0, spent: 0 },
          { id: 'cat-9', name: '💊 Health', allocated: 0, spent: 0 },
          { id: 'cat-10', name: '💰 Savings', allocated: 0, spent: 0 }
        ],
        accounts: { checking: 0, savings: 0, rothIra: 0 },
        scholarships: [],
        subscriptions: [],
        bigPurchases: [],
        collapsedSections: { income: false, categories: false, savings: false, scholarships: false, subscriptions: false, bigPurchases: false }
      };
    }

    const finance = data.finance;
    const incomeSources = Array.isArray(finance.incomeSources) ? finance.incomeSources : [];
    const categories = Array.isArray(finance.categories) ? finance.categories : [];
    const accounts = finance.accounts || { checking: 0, savings: 0, rothIra: 0 };
    const scholarships = Array.isArray(finance.scholarships) ? finance.scholarships : [];
    const subscriptions = Array.isArray(finance.subscriptions) ? finance.subscriptions : [];
    const bigPurchases = Array.isArray(finance.bigPurchases) ? finance.bigPurchases : [];
    const collapsed = finance.collapsedSections || {};

    // --- Calculate Dynamic Totals ---
    const totalMonthlyIncome = incomeSources.reduce((sum, inc) => {
      let monthlyVal = 0;
      const statusVal = inc.status || 'Active';
      const drawVal = parseFloat(inc.monthlyDraw) || 0;

      if (statusVal === 'Ended') {
        // Ended jobs contribute any designated Monthly College Draw
        monthlyVal = drawVal;
      } else if (inc.frequency === 'Weekly') {
        monthlyVal = (parseFloat(inc.amount) || 0) * 4.33 + drawVal;
      } else if (inc.frequency === 'Biweekly') {
        monthlyVal = (parseFloat(inc.amount) || 0) * 2.16 + drawVal;
      } else if (inc.frequency === 'Monthly') {
        monthlyVal = (parseFloat(inc.amount) || 0) + drawVal;
      } else if (inc.frequency === 'One-time') {
        monthlyVal = drawVal;
      }
      return sum + monthlyVal;
    }, 0);

    const totalEarnedToDate = incomeSources.reduce((sum, inc) => sum + (parseFloat(inc.amount) || 0), 0);

    const totalBudgetedExpenses = categories.reduce((sum, cat) => sum + (parseFloat(cat.allocated) || 0), 0);
    const estimatedMonthlySavings = totalMonthlyIncome - totalBudgetedExpenses;

    const totalScholarshipsAwarded = scholarships
      .filter(s => s.status === 'Awarded')
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

    const totalScholarshipsApplied = scholarships
      .filter(s => s.status === 'Applied' || s.status === 'Awarded')
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);

    const totalLiquidBalances = (parseFloat(accounts.checking) || 0) + (parseFloat(accounts.savings) || 0) + (parseFloat(accounts.rothIra) || 0);

    container.innerHTML = `
      <div class="space-y-8 animate-fade-in pb-16">
        
        <!-- Top Summary Dashboard Banner -->
        <div class="glass-card p-6 bg-gradient-to-r from-emerald-950/20 via-bg-card to-indigo-950/20 border-emerald-500/30">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <i data-lucide="wallet" class="w-5 h-5"></i>
              </div>
              <div>
                <h2 class="font-bold text-lg text-text">College Financial Planning Dashboard</h2>
                <p class="text-xs text-text-subtle">Clean slate structure ready for your real numbers.</p>
              </div>
            </div>

            <button id="clean-slate-finance-btn" class="btn btn-secondary text-xs" title="Reset all finance items & allocations to a clean slate start">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              <span>Clean Slate Start ($0 Reset)</span>
            </button>
          </div>

          <!-- 5 Summary KPI Stat Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-1">
              <span class="text-[10px] uppercase font-bold text-text-subtle">Active Monthly Income</span>
              <div class="text-xl font-extrabold text-emerald-400 font-mono">$${Math.round(totalMonthlyIncome).toLocaleString()}</div>
              <span class="text-[10px] text-text-subtle font-mono">Total Logged: $${Math.round(totalEarnedToDate).toLocaleString()}</span>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-1">
              <span class="text-[10px] uppercase font-bold text-text-subtle">Budgeted Expenses</span>
              <div class="text-xl font-extrabold text-indigo-400 font-mono">$${Math.round(totalBudgetedExpenses).toLocaleString()}</div>
              <span class="text-[10px] text-text-subtle font-mono">${categories.length} Categories</span>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-1">
              <span class="text-[10px] uppercase font-bold text-text-subtle">Est. Monthly Savings</span>
              <div class="text-xl font-extrabold ${estimatedMonthlySavings >= 0 ? 'text-emerald-400' : 'text-danger'} font-mono">
                $${Math.round(estimatedMonthlySavings).toLocaleString()}
              </div>
              <span class="text-[10px] text-text-subtle font-mono">Net Flow / mo</span>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-1">
              <span class="text-[10px] uppercase font-bold text-text-subtle">Scholarship Awarded</span>
              <div class="text-xl font-extrabold text-amber-400 font-mono">$${Math.round(totalScholarshipsAwarded).toLocaleString()}</div>
              <span class="text-[10px] text-text-subtle font-mono">Applied: $${Math.round(totalScholarshipsApplied).toLocaleString()}</span>
            </div>

            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-1">
              <span class="text-[10px] uppercase font-bold text-text-subtle">Total Liquid Balances</span>
              <div class="text-xl font-extrabold text-cyan-400 font-mono">$${Math.round(totalLiquidBalances).toLocaleString()}</div>
              <span class="text-[10px] text-text-subtle font-mono">Checking + Savings + IRA</span>
            </div>
          </div>
        </div>


        <!-- 1. INCOME SOURCES SECTION (Collapsible) -->
        <div class="glass-card overflow-hidden">
          <div 
            data-toggle-section="income" 
            class="p-5 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">💵</span>
              <h3 class="font-bold text-base text-text">1. Income Sources</h3>
              <span class="badge bg-emerald-500/15 text-emerald-300 font-mono text-xs">
                Active Monthly: $${Math.round(totalMonthlyIncome)}/mo
              </span>
            </div>
            <div class="flex items-center gap-3">
              <button id="add-inc-btn" class="btn btn-primary text-xs py-1 px-3">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>+ Add Income Source</span>
              </button>
              <span class="text-text-subtle text-sm">${collapsed.income ? '▼' : '▲'}</span>
            </div>
          </div>

          ${!collapsed.income ? `
            <div class="p-6 border-t border-border space-y-4 bg-black/20">
              ${incomeSources.length === 0 ? `
                <p class="text-xs text-text-subtle text-center py-4">No income sources added yet. Click "+ Add Income Source" to enter your part-time jobs, internships, scholarships, or family support.</p>
              ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${incomeSources.map(inc => {
                    const statusVal = inc.status || 'Active';
                    const statusBadge = statusVal === 'Ended' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                       statusVal === 'Planned' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                                       'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                    const statusLabel = statusVal === 'Ended' ? '🏁 Ended / Saved' :
                                        statusVal === 'Planned' ? '⏳ Planned' : '🟢 Active';
                    const payPeriodLabel = inc.payPeriod ? `📅 ${inc.payPeriod}` : '';
                    const accountLabel = inc.accountKey === 'savings' ? '🏦 In Savings' :
                                         inc.accountKey === 'checking' ? '💳 In Checking' :
                                         inc.accountKey === 'rothIra' ? '📈 In Roth IRA' : '';
                    const drawLabel = inc.monthlyDraw ? `💸 $${inc.monthlyDraw}/mo Draw` : '';

                    return `
                      <div class="p-4 rounded-2xl bg-white/5 border border-border flex items-start justify-between space-y-1">
                        <div class="space-y-1.5">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-bold text-sm text-text">${inc.name}</span>
                            <span class="badge text-[10px] ${statusBadge}">${statusLabel}</span>
                            <span class="badge text-[10px] bg-white/10 text-text-subtle border border-border">${inc.frequency}</span>
                            ${accountLabel ? `<span class="badge text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">${accountLabel}</span>` : ''}
                            ${payPeriodLabel ? `<span class="badge text-[10px] bg-white/10 text-accent font-mono">${payPeriodLabel}</span>` : ''}
                            ${drawLabel ? `<span class="badge text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">${drawLabel}</span>` : ''}
                          </div>
                          <div class="text-lg font-extrabold text-emerald-400 font-mono">$${(parseFloat(inc.amount) || 0).toLocaleString()} <span class="text-xs font-normal text-text-subtle">/${inc.frequency.toLowerCase()}</span></div>
                          ${inc.notes ? `<p class="text-xs text-text-subtle leading-relaxed">${inc.notes}</p>` : ''}
                        </div>

                        <div class="flex items-center gap-1">
                          <button data-edit-inc="${inc.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-accent" title="Edit Income Source">
                            <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
                          </button>
                          <button data-delete-inc="${inc.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger" title="Delete Source">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              `}
            </div>
          ` : ''}
        </div>


        <!-- 2. BUDGET CATEGORIES SECTION (Collapsible) -->
        <div class="glass-card overflow-hidden">
          <div 
            data-toggle-section="categories" 
            class="p-5 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">📊</span>
              <h3 class="font-bold text-base text-text">2. College Budget Categories</h3>
              <span class="badge bg-indigo-500/15 text-indigo-300 font-mono text-xs">
                Budgeted: $${Math.round(totalBudgetedExpenses)}/mo
              </span>
            </div>
            <div class="flex items-center gap-3">
              <button id="add-cat-btn" class="btn btn-primary text-xs py-1 px-3">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>+ Add Category</span>
              </button>
              <span class="text-text-subtle text-sm">${collapsed.categories ? '▼' : '▲'}</span>
            </div>
          </div>

          ${!collapsed.categories ? `
            <div class="p-6 border-t border-border space-y-4 bg-black/20">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                ${categories.map(cat => `
                  <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-3 flex flex-col justify-between">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-sm text-text truncate pr-1">${cat.name}</span>
                      <button data-delete-cat="${cat.id || cat.name}" class="text-text-subtle hover:text-danger p-1" title="Delete Category">
                        <i data-lucide="x" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>

                    <div class="space-y-1">
                      <label class="text-[10px] text-text-subtle uppercase font-bold block">Monthly Allocation ($)</label>
                      <input 
                        type="number" 
                        data-update-cat-alloc="${cat.id || cat.name}" 
                        value="${cat.allocated}" 
                        placeholder="0"
                        class="input-field py-1 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>


        <!-- 3. SAVINGS & ACCOUNTS TRACKER (Collapsible) -->
        <div class="glass-card overflow-hidden">
          <div 
            data-toggle-section="savings" 
            class="p-5 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">🏦</span>
              <h3 class="font-bold text-base text-text">3. Savings & Liquid Accounts</h3>
              <span class="badge bg-cyan-500/15 text-cyan-300 font-mono text-xs">
                Total: $${Math.round(totalLiquidBalances).toLocaleString()}
              </span>
            </div>
            <span class="text-text-subtle text-sm">${collapsed.savings ? '▼' : '▲'}</span>
          </div>

          ${!collapsed.savings ? `
            <div class="p-6 border-t border-border space-y-4 bg-black/20">
              <p class="text-xs text-text-subtle">Manually enter your current account balances whenever you want. Linked income sources show where your money is held.</p>
              
              <form id="update-accounts-form" class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">💳</span>
                      <span class="font-bold text-sm text-text">Checking Account</span>
                    </div>
                  </div>
                  <input 
                    id="acc-checking" 
                    type="number" 
                    step="0.01"
                    value="${accounts.checking || 0}" 
                    class="input-field text-base font-bold font-mono py-2"
                  />
                  <div class="space-y-1 pt-1">
                    ${incomeSources.filter(i => i.accountKey === 'checking').map(i => `
                      <span class="badge text-[9px] bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 block truncate">
                        💵 Includes $${(parseFloat(i.amount)||0).toLocaleString()} (${i.name})
                      </span>
                    `).join('')}
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">🏦</span>
                      <span class="font-bold text-sm text-text">Savings Account</span>
                    </div>
                  </div>
                  <input 
                    id="acc-savings" 
                    type="number" 
                    step="0.01"
                    value="${accounts.savings || 0}" 
                    class="input-field text-base font-bold font-mono py-2"
                  />
                  <div class="space-y-1 pt-1">
                    ${incomeSources.filter(i => i.accountKey === 'savings').map(i => `
                      <span class="badge text-[9px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 block truncate">
                        💰 Includes $${(parseFloat(i.amount)||0).toLocaleString()} (${i.name})
                      </span>
                    `).join('')}
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="text-base">📈</span>
                      <span class="font-bold text-sm text-text">Roth IRA</span>
                    </div>
                  </div>
                  <input 
                    id="acc-roth" 
                    type="number" 
                    step="0.01"
                    value="${accounts.rothIra || 0}" 
                    class="input-field text-base font-bold font-mono py-2"
                  />
                  <div class="space-y-1 pt-1">
                    ${incomeSources.filter(i => i.accountKey === 'rothIra').map(i => `
                      <span class="badge text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 block truncate">
                        📈 Includes $${(parseFloat(i.amount)||0).toLocaleString()} (${i.name})
                      </span>
                    `).join('')}
                  </div>
                </div>

                <div class="sm:col-span-3 flex justify-end">
                  <button type="submit" class="btn btn-primary text-xs">
                    <span>Save Balances</span>
                  </button>
                </div>
              </form>
            </div>
          ` : ''}
        </div>


        <!-- 4. SCHOLARSHIPS TRACKER (Collapsible) -->
        <div class="glass-card overflow-hidden">
          <div 
            data-toggle-section="scholarships" 
            class="p-5 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">🎓</span>
              <h3 class="font-bold text-base text-text">4. Scholarship Tracker</h3>
              <span class="badge bg-amber-500/15 text-amber-300 font-mono text-xs">
                Awarded: $${Math.round(totalScholarshipsAwarded).toLocaleString()}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <button id="add-sch-btn" class="btn btn-primary text-xs py-1 px-3">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>+ Add Scholarship</span>
              </button>
              <span class="text-text-subtle text-sm">${collapsed.scholarships ? '▼' : '▲'}</span>
            </div>
          </div>

          ${!collapsed.scholarships ? `
            <div class="p-6 border-t border-border space-y-4 bg-black/20">
              ${scholarships.length === 0 ? `
                <p class="text-xs text-text-subtle text-center py-4">No scholarships tracked yet. Click "+ Add Scholarship" to track grants, application deadlines, and awarded amounts.</p>
              ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${scholarships.map(s => renderScholarshipCard(s)).join('')}
                </div>
              `}
            </div>
          ` : ''}
        </div>


        <!-- 5. SUBSCRIPTIONS & RECURRING PAYMENTS (Collapsible) -->
        <div class="glass-card overflow-hidden">
          <div 
            data-toggle-section="subscriptions" 
            class="p-5 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">🔄</span>
              <h3 class="font-bold text-base text-text">5. Subscriptions & Recurring Payments</h3>
              <span class="badge bg-purple-500/15 text-purple-300 font-mono text-xs">
                ${subscriptions.filter(s => s.active).length} Active
              </span>
            </div>
            <div class="flex items-center gap-3">
              <button id="add-sub-btn" class="btn btn-primary text-xs py-1 px-3">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>+ Add Subscription</span>
              </button>
              <span class="text-text-subtle text-sm">${collapsed.subscriptions ? '▼' : '▲'}</span>
            </div>
          </div>

          ${!collapsed.subscriptions ? `
            <div class="p-6 border-t border-border space-y-4 bg-black/20">
              ${subscriptions.length === 0 ? `
                <p class="text-xs text-text-subtle text-center py-4">No recurring subscriptions added yet.</p>
              ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${subscriptions.map(sub => `
                    <div class="p-4 rounded-2xl bg-white/5 border border-border flex items-start justify-between">
                      <div class="space-y-1">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-sm text-text">${sub.name}</span>
                          <span class="badge text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">${sub.category || 'Tech'}</span>
                        </div>
                        <div class="text-base font-extrabold text-purple-400 font-mono">$${sub.cost} <span class="text-xs font-normal text-text-subtle">/${sub.cycle ? sub.cycle.toLowerCase() : 'monthly'}</span></div>
                        ${sub.renewalDate ? `<span class="text-[10px] text-text-subtle font-mono block">Renewal: ${sub.renewalDate}</span>` : ''}
                      </div>

                      <div class="flex items-center gap-2">
                        <button data-toggle-sub="${sub.id}" class="badge ${sub.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-text-subtle'}">
                          ${sub.active ? 'Active' : 'Paused'}
                        </button>
                        <button data-delete-sub="${sub.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          ` : ''}
        </div>


        <!-- 6. BIG PURCHASES SAVINGS TRACKER (Collapsible) -->
        <div class="glass-card overflow-hidden">
          <div 
            data-toggle-section="bigPurchases" 
            class="p-5 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg">🎯</span>
              <h3 class="font-bold text-base text-text">6. Big Purchases Savings Goals</h3>
              <span class="badge bg-rose-500/15 text-rose-300 font-mono text-xs">
                ${bigPurchases.length} Target Items
              </span>
            </div>
            <div class="flex items-center gap-3">
              <button id="add-bp-btn" class="btn btn-primary text-xs py-1 px-3">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>+ Add Big Purchase</span>
              </button>
              <span class="text-text-subtle text-sm">${collapsed.bigPurchases ? '▼' : '▲'}</span>
            </div>
          </div>

          ${!collapsed.bigPurchases ? `
            <div class="p-6 border-t border-border space-y-4 bg-black/20">
              ${bigPurchases.length === 0 ? `
                <p class="text-xs text-text-subtle text-center py-4">No big purchases tracked yet. Click "+ Add Big Purchase" to set goals for laptops, monitors, smart mirror components, or furniture!</p>
              ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${bigPurchases.map(bp => renderBigPurchaseCard(bp)).join('')}
                </div>
              `}
            </div>
          ` : ''}
        </div>

      </div>
    `;

    // Attach Clean Slate Reset Listener
    container.querySelector('#clean-slate-finance-btn')?.addEventListener('click', () => {
      if (confirm('Reset all financial data to a clean slate start ($0 allocations, 0 items)?')) {
        store.data.finance = {
          incomeSources: [],
          categories: [
            { id: 'cat-1', name: '🍔 Food', allocated: 0, spent: 0 },
            { id: 'cat-2', name: '🛒 Shopping', allocated: 0, spent: 0 },
            { id: 'cat-3', name: '🚗 Transportation', allocated: 0, spent: 0 },
            { id: 'cat-4', name: '📚 School', allocated: 0, spent: 0 },
            { id: 'cat-5', name: '🏠 Dorm / Housing', allocated: 0, spent: 0 },
            { id: 'cat-6', name: '💻 Tech', allocated: 0, spent: 0 },
            { id: 'cat-7', name: '🎮 Entertainment', allocated: 0, spent: 0 },
            { id: 'cat-8', name: '🎁 Gifts', allocated: 0, spent: 0 },
            { id: 'cat-9', name: '💊 Health', allocated: 0, spent: 0 },
            { id: 'cat-10', name: '💰 Savings', allocated: 0, spent: 0 }
          ],
          accounts: { checking: 0, savings: 0, rothIra: 0 },
          scholarships: [],
          subscriptions: [],
          bigPurchases: [],
          collapsedSections: { income: false, categories: false, savings: false, scholarships: false, subscriptions: false, bigPurchases: false }
        };
        store.saveData();
      }
    });

    // Attach Event Handlers
    container.querySelectorAll('[data-toggle-section]').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const key = e.currentTarget.getAttribute('data-toggle-section');
        store.toggleFinanceSectionCollapse(key);
      });
    });

    // Income Sources
    container.querySelector('#add-inc-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddIncomeModal();
    });
    container.querySelectorAll('[data-edit-inc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-edit-inc');
        openEditIncomeModal(id);
      });
    });
    container.querySelectorAll('[data-delete-inc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-delete-inc');
        store.deleteIncomeSource(id);
      });
    });

    // Category Allocation Updates
    container.querySelector('#add-cat-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const catName = prompt('Enter new category name (e.g. 🎒 Books, 🍕 Takeout):');
      if (catName && catName.trim()) {
        store.addFinanceCategory({ name: catName.trim(), allocated: 0 });
      }
    });

    container.querySelectorAll('[data-update-cat-alloc]').forEach(input => {
      input.addEventListener('change', (e) => {
        const catId = e.currentTarget.getAttribute('data-update-cat-alloc');
        const val = parseFloat(e.currentTarget.value) || 0;
        store.updateFinanceCategory(catId, { allocated: val });
      });
    });

    container.querySelectorAll('[data-delete-cat]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const catId = e.currentTarget.getAttribute('data-delete-cat');
        if (confirm('Delete this budget category?')) {
          store.deleteFinanceCategory(catId);
        }
      });
    });

    // Accounts Form
    container.querySelector('#update-accounts-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.updateAccountBalances({
        checking: parseFloat(document.getElementById('acc-checking').value) || 0,
        savings: parseFloat(document.getElementById('acc-savings').value) || 0,
        rothIra: parseFloat(document.getElementById('acc-roth').value) || 0
      });
      alert('Account balances saved!');
    });

    // Scholarships
    container.querySelector('#add-sch-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddScholarshipModal();
    });
    container.querySelectorAll('[data-delete-sch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-delete-sch');
        store.deleteScholarship(id);
      });
    });

    container.querySelectorAll('[data-update-sch-status]').forEach(select => {
      select.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-update-sch-status');
        store.updateScholarship(id, { status: e.currentTarget.value });
      });
    });

    // Subscriptions
    container.querySelector('#add-sub-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddSubscriptionModal();
    });
    container.querySelectorAll('[data-toggle-sub]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-toggle-sub');
        store.toggleSubscription(id);
      });
    });
    container.querySelectorAll('[data-delete-sub]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-delete-sub');
        store.deleteSubscription(id);
      });
    });

    // Big Purchases
    container.querySelector('#add-bp-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddBigPurchaseModal();
    });
    container.querySelectorAll('[data-update-bp-saved]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-update-bp-saved');
        const bp = bigPurchases.find(b => b.id === id);
        if (bp) {
          const newVal = prompt(`Update amount saved for "${bp.name}":`, bp.amountSaved);
          if (newVal !== null) {
            store.updateBigPurchase(id, { amountSaved: parseFloat(newVal) || 0 });
          }
        }
      });
    });
    container.querySelectorAll('[data-delete-bp]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-delete-bp');
        store.deleteBigPurchase(id);
      });
    });

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Error rendering finance view:', err);
    container.innerHTML = `<div class="p-8 text-center text-danger">Failed to render Finance view: ${err.message}</div>`;
  }
}

function renderScholarshipCard(s) {
  const statusColors = {
    'Awarded': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Applied': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Planning': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Rejected': 'bg-rose-500/20 text-rose-300 border-rose-500/30'
  };

  return `
    <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-3 flex flex-col justify-between">
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-sm text-text truncate pr-2">${s.name}</h4>
          <select data-update-sch-status="${s.id}" class="badge text-[10px] border ${statusColors[s.status] || 'bg-white/10 text-text'} cursor-pointer">
            <option value="Planning" ${s.status === 'Planning' ? 'selected' : ''}>Planning</option>
            <option value="Applied" ${s.status === 'Applied' ? 'selected' : ''}>Applied</option>
            <option value="Awarded" ${s.status === 'Awarded' ? 'selected' : ''}>Awarded</option>
            <option value="Rejected" ${s.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>

        <div class="text-lg font-extrabold text-amber-400 font-mono">$${(parseFloat(s.amount) || 0).toLocaleString()}</div>
        ${s.deadline ? `<span class="text-[10px] text-text-subtle font-mono block">Deadline: ${s.deadline}</span>` : ''}
        ${s.notes ? `<p class="text-xs text-text-subtle leading-relaxed mt-1">${s.notes}</p>` : ''}
      </div>

      <div class="flex justify-end pt-2 border-t border-border/40">
        <button data-delete-sch="${s.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

function renderBigPurchaseCard(bp) {
  const est = parseFloat(bp.estimatedCost) || 0;
  const saved = parseFloat(bp.amountSaved) || 0;
  const percent = est > 0 ? Math.min(100, Math.round((saved / est) * 100)) : 0;
  const priorityColors = {
    'Urgent': 'badge-urgent',
    'High': 'badge-high',
    'Medium': 'badge-medium',
    'Low': 'badge-low'
  };

  return `
    <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-3 flex flex-col justify-between">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-sm text-text truncate pr-2">${bp.name}</h4>
          <span class="badge ${priorityColors[bp.priority] || 'badge-medium'} text-[10px]">${bp.priority} Priority</span>
        </div>

        <div class="flex items-baseline justify-between font-mono">
          <span class="text-base font-extrabold text-rose-400">$${saved.toLocaleString()}</span>
          <span class="text-xs text-text-subtle">of $${est.toLocaleString()} target</span>
        </div>

        <!-- Progress Bar -->
        <div class="space-y-1">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${percent}%"></div>
          </div>
          <div class="flex items-center justify-between text-[10px] text-text-subtle font-mono">
            <span>Progress: ${percent}%</span>
            <span>Target: ${bp.targetDate || 'Flexible'}</span>
          </div>
        </div>

        ${bp.notes ? `<p class="text-xs text-text-subtle leading-relaxed pt-1">${bp.notes}</p>` : ''}
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-border/40">
        <button data-update-bp-saved="${bp.id}" class="btn btn-secondary text-xs py-1 px-3">
          <span>Update Savings</span>
        </button>

        <button data-delete-bp="${bp.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// MODALS
// ----------------------------------------------------
function openAddIncomeModal() {
  const modalHTML = `
    <div id="inc-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Add Income Source</h3>
          <button id="inc-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-inc-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Source Name *</label>
            <input id="inc-name" type="text" class="input-field" placeholder="e.g. Summer Internship, Grandma Allowance, Part-time Job" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Total Amount ($) *</label>
              <input id="inc-amount" type="number" step="0.01" class="input-field" placeholder="e.g. 4000" required />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Frequency *</label>
              <select id="inc-freq" class="input-field">
                <option value="Weekly">Weekly</option>
                <option value="Biweekly">Biweekly (Per Paycheck)</option>
                <option value="Monthly" selected>Monthly</option>
                <option value="One-time">One-time / Total YTD</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Status *</label>
              <select id="inc-status" class="input-field">
                <option value="Active" selected>🟢 Active Pay</option>
                <option value="Ended">🏁 Ended / Saved Capital</option>
                <option value="Planned">⏳ Planned / Allowance</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Deposited To Account</label>
              <select id="inc-account" class="input-field">
                <option value="savings" selected>🏦 Savings Account</option>
                <option value="checking">💳 Checking Account</option>
                <option value="rothIra">📈 Roth IRA</option>
                <option value="none">General / Unassigned</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Pay Period / Date</label>
              <input id="inc-payperiod" type="text" class="input-field" placeholder="e.g. Summer 2026, Aug 2026" />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Monthly Draw ($/mo)</label>
              <input id="inc-draw" type="number" step="0.01" class="input-field" placeholder="e.g. 1000 (draw for budget)" />
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Notes</label>
            <textarea id="inc-notes" rows="2" class="input-field resize-none" placeholder="Paycheck details, final check pending, etc..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Add Income Source</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('inc-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'inc-modal') modal.remove(); });
  document.getElementById('inc-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-inc-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addIncomeSource({
      name: document.getElementById('inc-name').value,
      amount: document.getElementById('inc-amount').value,
      frequency: document.getElementById('inc-freq').value,
      status: document.getElementById('inc-status').value,
      accountKey: document.getElementById('inc-account').value,
      payPeriod: document.getElementById('inc-payperiod').value,
      monthlyDraw: document.getElementById('inc-draw').value,
      notes: document.getElementById('inc-notes').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openEditIncomeModal(id) {
  const { data } = store;
  const inc = (data.finance?.incomeSources || []).find(i => i.id === id);
  if (!inc) return;

  const modalHTML = `
    <div id="edit-inc-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Edit Income Source</h3>
          <button id="edit-inc-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="edit-inc-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Source Name *</label>
            <input id="e-inc-name" type="text" class="input-field" value="${inc.name || ''}" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Total Amount ($) *</label>
              <input id="e-inc-amount" type="number" step="0.01" class="input-field" value="${inc.amount || 0}" required />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Frequency *</label>
              <select id="e-inc-freq" class="input-field">
                <option value="Weekly" ${inc.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
                <option value="Biweekly" ${inc.frequency === 'Biweekly' ? 'selected' : ''}>Biweekly (Per Paycheck)</option>
                <option value="Monthly" ${inc.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option>
                <option value="One-time" ${inc.frequency === 'One-time' ? 'selected' : ''}>One-time / Total YTD</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Status *</label>
              <select id="e-inc-status" class="input-field">
                <option value="Active" ${inc.status === 'Active' ? 'selected' : ''}>🟢 Active Pay</option>
                <option value="Ended" ${inc.status === 'Ended' ? 'selected' : ''}>🏁 Ended / Saved Capital</option>
                <option value="Planned" ${inc.status === 'Planned' ? 'selected' : ''}>⏳ Planned / Allowance</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Deposited To Account</label>
              <select id="e-inc-account" class="input-field">
                <option value="savings" ${inc.accountKey === 'savings' ? 'selected' : ''}>🏦 Savings Account</option>
                <option value="checking" ${inc.accountKey === 'checking' ? 'selected' : ''}>💳 Checking Account</option>
                <option value="rothIra" ${inc.accountKey === 'rothIra' ? 'selected' : ''}>📈 Roth IRA</option>
                <option value="none" ${inc.accountKey === 'none' ? 'selected' : ''}>General / Unassigned</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Pay Period / Date</label>
              <input id="e-inc-payperiod" type="text" class="input-field" value="${inc.payPeriod || ''}" placeholder="e.g. Summer 2026, Aug 2026" />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Monthly Draw ($/mo)</label>
              <input id="e-inc-draw" type="number" step="0.01" class="input-field" value="${inc.monthlyDraw || ''}" placeholder="e.g. 1000 (draw for budget)" />
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Notes</label>
            <textarea id="e-inc-notes" rows="2" class="input-field resize-none">${inc.notes || ''}</textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('edit-inc-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'edit-inc-modal') modal.remove(); });
  document.getElementById('edit-inc-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('edit-inc-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateIncomeSource(id, {
      name: document.getElementById('e-inc-name').value,
      amount: parseFloat(document.getElementById('e-inc-amount').value) || 0,
      frequency: document.getElementById('e-inc-freq').value,
      status: document.getElementById('e-inc-status').value,
      accountKey: document.getElementById('e-inc-account').value,
      payPeriod: document.getElementById('e-inc-payperiod').value,
      monthlyDraw: parseFloat(document.getElementById('e-inc-draw').value) || 0,
      notes: document.getElementById('e-inc-notes').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openAddScholarshipModal() {
  const modalHTML = `
    <div id="sch-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Add Scholarship</h3>
          <button id="sch-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-sch-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Scholarship Name *</label>
            <input id="sch-name" type="text" class="input-field" placeholder="e.g. OSU Engineering Merit Grant" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Amount ($) *</label>
              <input id="sch-amount" type="number" class="input-field" placeholder="e.g. 2500" required />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Status *</label>
              <select id="sch-status" class="input-field">
                <option value="Planning" selected>Planning</option>
                <option value="Applied">Applied</option>
                <option value="Awarded">Awarded</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Deadline Date</label>
            <input id="sch-date" type="date" class="input-field" />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Notes & Requirements</label>
            <textarea id="sch-notes" rows="2" class="input-field resize-none" placeholder="GPA requirements, essay topics, etc."></textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Add Scholarship</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('sch-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'sch-modal') modal.remove(); });
  document.getElementById('sch-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-sch-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addScholarship({
      name: document.getElementById('sch-name').value,
      amount: document.getElementById('sch-amount').value,
      status: document.getElementById('sch-status').value,
      deadline: document.getElementById('sch-date').value,
      notes: document.getElementById('sch-notes').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openAddSubscriptionModal() {
  const modalHTML = `
    <div id="sub-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Add Subscription</h3>
          <button id="sub-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-sub-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Subscription Name *</label>
            <input id="sub-name" type="text" class="input-field" placeholder="e.g. Spotify Student, ChatGPT Plus" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Cost ($) *</label>
              <input id="sub-cost" type="number" step="0.01" class="input-field" placeholder="e.g. 5.99" required />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Billing Cycle</label>
              <select id="sub-cycle" class="input-field">
                <option value="Monthly" selected>Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Category</label>
              <input id="sub-cat" type="text" class="input-field" placeholder="Entertainment, Tech" />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Renewal Date</label>
              <input id="sub-date" type="date" class="input-field" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Add Subscription</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('sub-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'sub-modal') modal.remove(); });
  document.getElementById('sub-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-sub-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addSubscription({
      name: document.getElementById('sub-name').value,
      cost: document.getElementById('sub-cost').value,
      cycle: document.getElementById('sub-cycle').value,
      category: document.getElementById('sub-cat').value,
      renewalDate: document.getElementById('sub-date').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openAddBigPurchaseModal() {
  const modalHTML = `
    <div id="bp-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Add Big Purchase Goal</h3>
          <button id="bp-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-bp-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Item Name *</label>
            <input id="bp-name" type="text" class="input-field" placeholder="e.g. New Laptop, Smart Mirror Components" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Estimated Cost ($) *</label>
              <input id="bp-cost" type="number" class="input-field" placeholder="e.g. 1800" required />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Amount Saved So Far ($)</label>
              <input id="bp-saved" type="number" class="input-field" placeholder="e.g. 500" value="0" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Priority</label>
              <select id="bp-prio" class="input-field">
                <option value="Urgent">Urgent</option>
                <option value="High" selected>High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Target Purchase Date</label>
              <input id="bp-date" type="date" class="input-field" />
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Notes</label>
            <textarea id="bp-notes" rows="2" class="input-field resize-none" placeholder="Model preferences, specs, components needed..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Add Big Purchase Goal</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('bp-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'bp-modal') modal.remove(); });
  document.getElementById('bp-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-bp-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addBigPurchase({
      name: document.getElementById('bp-name').value,
      estimatedCost: document.getElementById('bp-cost').value,
      amountSaved: document.getElementById('bp-saved').value,
      priority: document.getElementById('bp-prio').value,
      targetDate: document.getElementById('bp-date').value,
      notes: document.getElementById('bp-notes').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

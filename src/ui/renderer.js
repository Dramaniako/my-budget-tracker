let allTransactions = [];
window.allTransactions = allTransactions;

// 1. CACHE DOM ELEMENTS (Performance)
const elements = {
    form: document.getElementById('budget-form'),
    listContainer: document.getElementById('transaction-list'),
    search: document.getElementById('search-desc'),
    category: document.getElementById('filter-category'),
    date: document.getElementById('filter-date')
};

document.getElementById('filter-btn').addEventListener('click', applyFilters);

// 2. STATE (Single Source of Truth)

// 3. CORE FUNCTIONS
async function loadAndRender() {
    try {
        const data = await window.budgetAPI.getTransactions();
        console.log("Raw data from storage:", data); // Check this in console!
        allTransactions = data || [];
        applyFilters();
    } catch (err) {
        console.error("IPC Connection Error:", err);
    }
}

function displayTransactions(list) {
    if (!list || list.length === 0) {
        elements.listContainer.innerHTML = '<p style="color: gray; text-align: center;">No transactions found.</p>';
        return;
    }

    elements.listContainer.innerHTML = list.map(tx => `
        <div class="transaction-item">
            <span>${new Date(tx.date).toLocaleDateString()}</span>
            <strong>${tx.description}</strong>
            <span class="category-tag">${tx.category}</span>
            <span class="amount">$${Number(tx.amount).toFixed(2)}</span>
        </div>
    `).join('');
}

function applyFilters() {
    const searchTerm = elements.search.value.toLowerCase();
    const catValue = elements.category.value;
    const dateValue = elements.date.value;

    const filtered = allTransactions.filter(tx => {
        const matchesSearch = tx.description.toLowerCase().includes(searchTerm);
        const matchesCategory = catValue === 'all' || tx.category === catValue;
        const txDate = tx.date.split('T')[0];
        const matchesDate = !dateValue || txDate === dateValue;
        return matchesSearch && matchesCategory && matchesDate;
    });

    displayTransactions(filtered);
}

// 4. EVENT HANDLERS
elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newTx = {
        description: document.getElementById('desc').value,
        amount: parseFloat(document.getElementById('amount').value),
        category: document.getElementById('category').value,
        date: new Date().toISOString()
    };

    // 1. Send to "Back-end" (Main Process)
    await window.budgetAPI.addTransaction(newTx);

    // 2. Update "Front-end" State
    allTransactions.push(newTx);

    // 3. Re-run Filters and Display
    applyFilters();

    elements.form.reset();
});

// 5. INITIALIZE
[elements.search, elements.category, elements.date].forEach(el => {
    el.addEventListener('input', applyFilters);
});

loadAndRender();
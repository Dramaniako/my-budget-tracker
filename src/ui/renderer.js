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
    const container = document.getElementById('transaction-list');

    if (!list || list.length === 0) {
        container.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No data found.</td></tr>';
        return;
    }

    // Wrap each set of TD tags in a TR tag
    container.innerHTML = list.map(tx => {
        const isIncome = tx.amount > 0;
        const total = Math.abs(Number(tx.price) * Number(tx.amount));

        return `
            <tr>
                <td>${new Date(tx.date).toLocaleDateString()}</td>
                <td><strong>${tx.description}</strong></td>
                <td><small class="category-tag">${tx.category}</small></td>
                <td style="text-align: right;">Rp${Number(tx.price).toLocaleString('id-ID')}</td>
                <td style="text-align: center;">x${Math.abs(tx.amount)}</td>
                <td style="text-align: right;">
                    ${isIncome ? '+' : '-'} 
                    <span class="${isIncome ? 'income-text' : 'expense-text'}">
                        Rp${total.toLocaleString('id-ID')}
                    </span>
                </td>
                <td style="text-align: center;">
                    <button class="delete-btn" data-id="${tx.id}">delete</button>
                </td>
            </tr>
        `;
    }).join('');
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
    updateTotalBalance();
}

function updateTotalBalance() {
    const total = allTransactions.reduce((sum, tx) => {
        return sum + (Number(tx.price) * Number(tx.amount));
    }, 0);

    const balanceElement = document.getElementById('balance-summary');

    // We wrap the dynamic number in a span so we can color JUST the number
    const formattedNumber = Math.abs(total).toLocaleString('id-ID');
    const color = total >= 0 ? '#2ecc71' : '#e74c3c';
    const sign = total >= 0 ? '' : '-';

    balanceElement.innerHTML = `Total Balance: <span style="color: ${color}">${sign}Rp ${formattedNumber}</span>`;
}

function updateTotalBalance() {
    // .reduce iterates through the array and adds up the 'amount' values
    const total = allTransactions.reduce((sum, tx) => sum + (tx.amount * tx.price), 0);

    const balanceElement = document.getElementById('balance-summary');
    balanceElement.textContent = `Total Balance: Rp ${total.toLocaleString('id-ID')}`;

    // UI Polish: Change color based on positive or negative balance
    balanceElement.style.color = total >= 0 ? '#39a439' : '#ff4444';
}

// 4. EVENT HANDLERS
elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get values from your new input fields
    const type = document.getElementById('transaction-type').value;
    const rawAmount = parseFloat(document.getElementById('amount').value) || 0;
    const rawPrice = parseFloat(document.getElementById('price').value) || 0;

    // Logic: Expenses are negative, Income/Allowance is positive
    const finalAmount = type === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    const newTx = {
        description: document.getElementById('desc').value,
        amount: finalAmount,      // This is your Quantity (e.g., -1)
        price: rawPrice,          // This is the cost per item (e.g., 5000)
        category: document.getElementById('category').value,
        date: new Date().toISOString()
    };

    const savedTx = await window.budgetAPI.addTransaction(newTx);
    allTransactions.push(savedTx);

    applyFilters();
    updateTotalBalance();
    elements.form.reset();
});

// 5. INITIALIZE
[elements.search, elements.category, elements.date].forEach(el => {
    el.addEventListener('input', applyFilters);
});

elements.listContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = Number(e.target.dataset.id);

        // 1. Tell the Back-end to delete from file
        await window.budgetAPI.deleteTransaction(id);

        // 2. Update the local State
        allTransactions = allTransactions.filter(tx => tx.id !== id);

        // 3. Re-render the UI
        applyFilters();
    }
});

loadAndRender();
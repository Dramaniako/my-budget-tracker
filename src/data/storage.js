const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Store data in the user's standard AppData folder
const DATA_PATH = path.join(app.getPath('userData'), 'budget-data.json');

const storage = {
    // Read data from file
    read() {
        if (!fs.existsSync(DATA_PATH)) return [];
        const data = fs.readFileSync(DATA_PATH);
        return JSON.parse(data);
    },

    // Save data to file
    save(transactions) {
        fs.writeFileSync(DATA_PATH, JSON.stringify(transactions, null, 2));
    },

    // Add this to your storage object in src/data/storage.js
    delete(id) {
        const transactions = this.read();
        const filtered = transactions.filter(tx => tx.id !== id);
        this.save(filtered);
        return filtered;
    }
};



module.exports = storage;
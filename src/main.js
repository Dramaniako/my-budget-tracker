const { app, BrowserWindow, ipcMain } = require('electron');
const storage = require('./data/storage');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Securely connects UI to Node
            nodeIntegration: false, // Security best practice
            contextIsolation: true
        }
    });

    win.loadFile('src/ui/index.html');
}

ipcMain.handle('add-transaction', (event, newTx) => {
    const transactions = storage.read();
    const transactionWithId = { ...newTx, id: Date.now() }; // Generate ID here
    transactions.push(transactionWithId);
    storage.save(transactions);
    return transactionWithId; // Return the full object back to the UI
});

ipcMain.handle('get-transactions', () => {
    return storage.read();
});

ipcMain.handle('delete-transaction', (event, id) => {
    return storage.delete(id);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
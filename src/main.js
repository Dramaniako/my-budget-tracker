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

ipcMain.on('add-transaction', (event, newTx) => {
    const transactions = storage.read();
    transactions.push({ ...newTx, id: Date.now() }); // Add unique ID
    storage.save(transactions);
});

ipcMain.handle('get-transactions', () => {
    return storage.read();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const storage = require('./data/storage');
const fs = require('fs');
const path = require('path');

// This is the "Back-end" listener that fixes your error
ipcMain.handle('save-export', async (event, csvContent) => {
    try {
        const { filePath } = await dialog.showSaveDialog({
            title: 'Export Budget Data',
            defaultPath: path.join(app.getPath('downloads'), 'budget_report.csv'),
            filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        });

        if (filePath) {
            fs.writeFileSync(filePath, csvContent, 'utf-8');
            return true; // Success
        }
        return false; // User cancelled
    } catch (error) {
        console.error("Export Error:", error);
        return false;
    }
});

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
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('budgetAPI', {
    addTransaction: (transaction) => ipcRenderer.send('add-transaction', transaction),
    getTransactions: () => ipcRenderer.invoke('get-transactions')
});
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('budgetAPI', {
    addTransaction: (transaction) => ipcRenderer.invoke('add-transaction', transaction),
    getTransactions: () => ipcRenderer.invoke('get-transactions'),
    deleteTransaction: (id) => ipcRenderer.invoke('delete-transaction', id),
    saveExport: (csvContent) => ipcRenderer.invoke('save-export', csvContent)
});

"use client";

import type { Order, User, MenuItem, InventoryItem } from '@/lib/data';

function escapeCsvCell(cell: any): string {
    const cellStr = String(cell ?? '');
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
}

function downloadCsv(content: string, fileName: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function convertToCsv(headers: string[], data: any[][]): string {
    const headerRow = headers.map(escapeCsvCell).join(',');
    const bodyRows = data.map(row => row.map(escapeCsvCell).join(','));
    return [headerRow, ...bodyRows].join('\n');
}

export const exportOrdersCSV = (orders: Order[]) => {
    const headers = ['Order ID', 'Customer', 'Status', 'Date', 'Amount'];
    const data = orders.map(order => [
      order.id,
      order.customerName,
      order.status,
      new Date(order.orderDate).toLocaleDateString(),
      order.total.toFixed(2)
    ]);
    const csvContent = convertToCsv(headers, data);
    downloadCsv(csvContent, 'orders-report.csv');
};

export const exportInventoryCSV = (menu: MenuItem[], inventory: InventoryItem[]) => {
    const headers = ['Name', 'Status', 'Price', 'Stock'];
    const data = menu.map(item => {
        const stockItem = inventory.find(inv => inv.id === item.id);
        const stock = stockItem?.stock ?? 0;
        const stockStatus = stock === 0 ? "Out of Stock" : stock < (stockItem?.lowStockThreshold ?? 15) ? "Low Stock" : "In Stock";
        return [
            item.name,
            stockStatus,
            item.price.toFixed(2),
            stock.toString()
        ];
    });
    const csvContent = convertToCsv(headers, data);
    downloadCsv(csvContent, 'inventory-report.csv');
};

export const exportUsersCSV = (users: User[]) => {
    const headers = ['Name', 'Email', 'Role', 'Class', 'Balance'];
    const data = users.map(user => [
        user.name,
        user.email,
        user.role,
        user.class || "N/A",
        user.role === 'Student' ? user.balance.toFixed(2) : "N/A"
    ]);
    const csvContent = convertToCsv(headers, data);
    downloadCsv(csvContent, 'users-report.csv');
};

export const exportSectionCSV = (sectionTitle: string, data: {head: string[][], body: any[][]}) => {
    const csvContent = convertToCsv(data.head[0], data.body);
    downloadCsv(csvContent, `${sectionTitle.toLowerCase().replace(/ /g, '-')}-report.csv`);
};

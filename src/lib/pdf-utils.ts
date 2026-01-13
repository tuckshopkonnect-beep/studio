
"use client";

import type { Order, User, MenuItem, InventoryItem } from '@/lib/data';
import { format } from 'date-fns';

// --- Specific Report Generators ---

export const exportOrdersPDF = (orders: Order[], jsPDF: any, autoTable: any) => {
    const doc = new jsPDF();
    doc.text("Orders Report", 14, 16);

    const tableData = orders.map(order => [
      order.customerName,
      order.status,
      new Date(order.orderDate).toLocaleDateString(),
      `₦${order.total.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Customer', 'Status', 'Date', 'Amount']],
      body: tableData,
      startY: 20,
    });

    doc.save('orders-report.pdf');
};

export const exportInventoryPDF = (menu: MenuItem[], inventory: InventoryItem[], jsPDF: any, autoTable: any) => {
    const doc = new jsPDF();
    doc.text("Menu & Inventory Report", 14, 16);
    
    const tableData = menu.map(item => {
        const stockItem = inventory.find(inv => inv.id === item.id);
        const stock = stockItem?.stock ?? 0;
        const stockStatus = stock === 0 ? "Out of Stock" : stock < (stockItem?.lowStockThreshold ?? 15) ? "Low Stock" : "In Stock";
        return [
            item.name,
            stockStatus,
            `₦${item.price.toFixed(2)}`,
            stock.toString()
        ];
    });

    autoTable(doc, {
        head: [['Name', 'Status', 'Price', 'Stock']],
        body: tableData,
        startY: 20,
    });

    doc.save('inventory-report.pdf');
};

export const exportUsersPDF = (users: User[], jsPDF: any, autoTable: any) => {
    const doc = new jsPDF();
    doc.text("Users Report", 14, 16);

    const tableData = users.map(user => [
        user.name,
        user.email,
        user.role,
        user.class || "N/A",
        user.role === 'Student' ? `₦${user.balance.toFixed(2)}` : "N/A"
    ]);

    autoTable(doc, {
        head: [['Name', 'Email', 'Role', 'Class', 'Balance']],
        body: tableData,
        startY: 20,
    });

    doc.save('users-report.pdf');
};

export const downloadReceiptPDF = async (orderResult: any, studentName: string, studentBalance: number, qrCodeRef: React.RefObject<HTMLDivElement> | null, jsPDF: any, autoTable: any) => {
    const doc = new jsPDF();

    doc.text("Order Receipt", 14, 20);
    doc.text(`Transaction ID: ${orderResult.id}`, 14, 30);
    doc.text(`Student: ${studentName}`, 14, 36);
    doc.text(`Date: ${new Date().toLocaleString()}`, 14, 42);

    autoTable(doc, {
        head: [['Item', 'Quantity', 'Price', 'Total']],
        body: orderResult.items.map((item: any) => [
            item.name,
            item.quantity,
            `₦${item.price.toFixed(2)}`,
            `₦${(item.price * item.quantity).toFixed(2)}`
        ]),
        startY: 50,
    });
    
    let finalY = (doc as any).lastAutoTable.finalY || 70;
    
    doc.setFontSize(12);
    doc.text(`Order Total: ₦${orderResult.total.toFixed(2)}`, 14, finalY + 10);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`New Balance: ₦${studentBalance.toFixed(2)}`, 14, finalY + 18);
    doc.setFont(undefined, 'normal');

    if (qrCodeRef?.current) {
        const svgElement = qrCodeRef.current.querySelector('svg');
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const canvas = document.createElement("canvas");
            const svgSize = svgElement.getBoundingClientRect();
            canvas.width = svgSize.width;
            canvas.height = svgSize.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const img = document.createElement("img");
                img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))));
                await new Promise<void>((resolve) => {
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                        const dataUrl = canvas.toDataURL("image/png");
                        doc.addImage(dataUrl, 'PNG', 14, finalY + 30, 50, 50);
                        doc.save(`receipt-${orderResult.id}.pdf`);
                        resolve();
                    };
                    img.onerror = () => {
                        // If image fails to load, save without it
                        doc.save(`receipt-${orderResult.id}.pdf`);
                        resolve();
                    }
                });
                return;
            }
        }
    }
    
    // Fallback to save if QR code is not available or fails
    doc.save(`receipt-${orderResult.id}.pdf`);
};

export const exportSectionPDF = (sectionTitle: string, data: any, jsPDF: any, autoTable: any) => {
    const doc = new jsPDF();
    doc.text(sectionTitle, 14, 16);
    
    autoTable(doc, { head: data.head, body: data.body, startY: 20 });
    doc.save(`${sectionTitle.toLowerCase().replace(/ /g, '-')}-report.pdf`);
};


export const generateFullReportPDF = (dateRange: any, reportData: any, jsPDF: any, autoTable: any) => {
    const doc = new jsPDF();
    const finalY = (doc.internal.pageSize.height - 10);
    const pageMargin = 14;

    doc.setFontSize(20);
    doc.text("Tuckshop Full Report", pageMargin, 22);
    doc.setFontSize(12);
    const fromDate = dateRange?.from ? format(dateRange.from, "LLL dd, y") : 'N/A';
    const toDate = dateRange?.to ? format(dateRange.to, "LLL dd, y") : 'N/A';
    doc.text(`Date Range: ${fromDate} - ${toDate}`, pageMargin, 30);
    let startY = 40;

    const checkPageBreak = (currentY: number) => {
        if (currentY > finalY - 30) {
            doc.addPage();
            return 20;
        }
        return currentY;
    };
    
    const sections = [
        { title: 'Activity Log', data: reportData.activityLog },
        { title: 'Sales Report', data: reportData.salesReport },
        { title: 'Sales by Category', data: reportData.salesByCategory },
        { title: 'Student Spending', data: reportData.studentSpending },
        { title: 'Product Performance', data: reportData.productPerformance },
        { title: 'Inventory Report (Current State)', data: reportData.inventoryReport }
    ];

    for (const section of sections) {
        if(section.data.body.length === 0) continue;

        startY = checkPageBreak(startY);
        doc.setFontSize(16);
        doc.text(section.title, pageMargin, startY);
        autoTable(doc, {
            head: section.data.head,
            body: section.data.body,
            startY: startY + 5,
        });
        startY = (doc as any).lastAutoTable.finalY + 15;
    }
    
    doc.save(`full-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

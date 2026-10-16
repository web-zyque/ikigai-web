"use client";

import { jsPDF } from "jspdf";

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptOrder {
  orderId: string;
  date: string;
  paymentMethod: string;
  customerName: string;
  items: ReceiptItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

export function exportReceiptToPdf(order: ReceiptOrder) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const rightEdge = pageWidth - margin;

  let y = 20;

  const money = (amount: number) => `INR ${amount.toFixed(2)}`;

  const drawDivider = (position: number) => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(margin, position, rightEdge, position);
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - 25) {
      doc.addPage();
      y = 20;
    }
  };

  // Brand header
  doc.setFillColor(100, 12, 12);
  doc.rect(0, 0, pageWidth, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("IKIGAI CUSTOMS CAR ACCESSORIES", margin, 15);

  doc.setFontSize(10);
  doc.text("Your Car. Your Style. Your Ikigai", margin, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Official Order Receipt", margin, 29);

  y = 47;

  // Receipt title
  doc.setTextColor(25, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ORDER RECEIPT", margin, y);

  y += 10;

  // Order information
  const details: [string, string][] = [
    ["Order ID", String(order.orderId)],
    ["Date", String(order.date)],
    ["Payment Method", String(order.paymentMethod)],
    ["Customer", String(order.customerName)],
  ];

  doc.setFontSize(10);

  details.forEach(([label, value]) => {
    const valueLines = doc.splitTextToSize(
      value,
      contentWidth - 38
    );

    const rowHeight = Math.max(7, valueLines.length * 5);

    ensureSpace(rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(110, 110, 110);
    doc.text(label, margin, y);

    doc.setTextColor(30, 30, 30);
    doc.text(valueLines, margin + 38, y);

    y += rowHeight;
  });

  y += 3;
  drawDivider(y);
  y += 9;

  // Purchased items heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("PURCHASED ITEMS", margin, y);

  y += 9;

  // Table column positions
  const productX = margin + 2;
  const qtyX = margin + contentWidth * 0.62;
  const priceX = margin + contentWidth * 0.79;
  const totalX = rightEdge - 2;

  // Table header
  const headerHeight = 10;

  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 5, contentWidth, headerHeight, "F");

  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);

  const headerY = y + 1;

  doc.text("Product", productX, headerY);
  doc.text("Qty", qtyX, headerY);
  doc.text("Price", priceX, headerY);
  doc.text("Total", totalX, headerY, { align: "right" });

  y += headerHeight + 2;

  // Item rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  order.items.forEach((item) => {
    const productLines = doc.splitTextToSize(
      String(item.name),
      qtyX - productX - 5
    );

    const rowHeight = Math.max(10, productLines.length * 4.5 + 5);

    ensureSpace(rowHeight);

    const textY = y + 2;

    doc.setTextColor(40, 40, 40);
    doc.text(productLines, productX, textY);

    doc.text(String(item.quantity), qtyX, textY);

    doc.text(money(item.price), priceX, textY);

    doc.text(
      money(item.quantity * item.price),
      totalX,
      textY,
      { align: "right" }
    );

    // Draw the separator at the bottom of the row.
    y += rowHeight;
    drawDivider(y);
    y += 3;
  });

  y += 5;

  // Totals section
  const totalsLabelX = margin + contentWidth * 0.48;
  const totalsValueX = rightEdge - 2;

  const addTotal = (
    label: string,
    value: string,
    bold = false
  ) => {
    const rowHeight = 8;

    ensureSpace(rowHeight + (bold ? 2 : 0));

    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 10);
    doc.setTextColor(35, 35, 35);

    // Keep the text vertically centered inside the row.
    const textY = y + 5;

    doc.text(label, totalsLabelX, textY);
    doc.text(value, totalsValueX, textY, {
      align: "right",
    });

    // Move below the text before drawing any separator.
    y += rowHeight;
  };

  addTotal("Subtotal", money(order.subtotal));

  if (order.discount > 0) {
    addTotal("Discount", `- ${money(order.discount)}`);
  }

  addTotal(
    "Shipping",
    order.shippingFee === 0
      ? "FREE"
      : money(order.shippingFee)
  );

  y += 1;
  drawDivider(y);
  y += 2;

  addTotal("TOTAL", money(order.total), true);

  y += 4;

  // Footer on every page
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);

    doc.text(
      "Thank you for shopping with Ikigai Customs.",
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" }
    );

    doc.text(
      "Keep this receipt for warranty and order tracking.",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  doc.save(`receipt-${order.orderId}.pdf`);
}
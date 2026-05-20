import PDFDocument from "pdfkit";

export const generateInvoice = async (order, res) => {
  try {
    const doc = new PDFDocument({ 
      margin: 40, // Slightly smaller margins to fit more on one page
      size: 'A4',
      layout: 'portrait',
      bufferPages: true // Allows us to handle page layout better
    });

    // 1. Setup Response Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${order._id.toString().slice(-6)}.pdf`
    );

    // 2. Pipe PDF to response
    doc.pipe(res);

    // Color Palette (Enterprise Green Theme)
    const colors = {
      primary: "#065f46", // Dark Emerald
      secondary: "#6B7280",
      accent: "#10b981",  // Bright Emerald
      lightBg: "#f9fafb",
      border: "#e5e7eb",
      text: "#111827"
    };

    const formatCurrency = (val) => `Rs. ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    // ========== HEADER ==========
    // Logo & Company Info in one row
    doc.fillColor(colors.primary)
       .rect(0, 0, 600, 80)
       .fill();

    doc.fillColor("#FFFFFF")
       .fontSize(22)
       .font("Helvetica-Bold")
       .text("YOUR STORE", 40, 30);
    
    doc.fontSize(10)
       .font("Helvetica")
       .text("Premium Quality E-Commerce", 40, 55);

    doc.fontSize(20)
       .font("Helvetica-Bold")
       .text("INVOICE", 400, 32, { align: 'right' });

    doc.moveDown(3);

    // ========== METADATA & BILLING ==========
    const topRowY = 100;
    
    // Left side: Billing Details
    doc.fillColor(colors.text).fontSize(10).font("Helvetica-Bold").text("BILL TO:", 40, topRowY);
    doc.font("Helvetica").text(order.shippingAddress.fullName, 40, topRowY + 15);
    doc.fontSize(9).fillColor(colors.secondary)
       .text(order.shippingAddress.address, 40, topRowY + 28, { width: 200 })
       .text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`, 40, doc.y + 2);

    // Right side: Invoice Details
    doc.fillColor(colors.text).font("Helvetica-Bold").text("INVOICE INFO", 400, topRowY, { align: 'right' });
    doc.font("Helvetica").fontSize(9)
       .text(`Order ID: #${order._id.toString().slice(-8).toUpperCase()}`, 400, topRowY + 15, { align: 'right' })
       .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, topRowY + 28, { align: 'right' })
       .fillColor(order.paymentStatus === 'paid' ? colors.accent : "#ef4444")
       .text(`STATUS: ${order.paymentStatus.toUpperCase()}`, 400, topRowY + 41, { align: 'right' });

    doc.moveDown(4);

    // ========== ITEMS TABLE ==========
    const tableTop = 200;
    
    // Table Header
    doc.fillColor(colors.primary).rect(40, tableTop, 515, 20).fill();
    doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold");
    doc.text("PRODUCT DESCRIPTION", 50, tableTop + 6);
    doc.text("QTY", 300, tableTop + 6);
    doc.text("UNIT PRICE", 360, tableTop + 6);
    doc.text("TOTAL", 480, tableTop + 6);

    let currentY = tableTop + 20;
    let subtotal = 0;

    // Draw Rows
    order.items.forEach((item, i) => {
      const lineTotal = item.priceAtTime * item.quantity;
      subtotal += lineTotal;

      // Zebra striping
      if (i % 2 !== 0) {
        doc.fillColor("#f3f4f6").rect(40, currentY, 515, 20).fill();
      }

      doc.fillColor(colors.text).font("Helvetica").fontSize(8);
      doc.text(item.name.substring(0, 45), 50, currentY + 6);
      doc.text(item.quantity.toString(), 300, currentY + 6);
      doc.text(formatCurrency(item.priceAtTime), 360, currentY + 6);
      doc.text(formatCurrency(lineTotal), 480, currentY + 6);

      currentY += 20;
    });

    // ========== TOTALS SECTION ==========
    doc.moveTo(40, currentY + 10).lineTo(555, currentY + 10).stroke(colors.border);
    
    const totalsY = currentY + 20;
    const tax = subtotal * 0.18;
    const shipping = subtotal > 500 ? 0 : 50;
    const grandTotal = subtotal + tax + shipping;

    const drawTotalLine = (label, amount, y, isBold = false) => {
      doc.fillColor(isBold ? colors.text : colors.secondary)
         .font(isBold ? "Helvetica-Bold" : "Helvetica")
         .fontSize(isBold ? 11 : 9);
      doc.text(label, 350, y, { align: 'right', width: 100 });
      doc.text(formatCurrency(amount), 460, y, { align: 'right', width: 90 });
    };

    drawTotalLine("Subtotal:", subtotal, totalsY);
    drawTotalLine("GST (18%):", tax, totalsY + 15);
    drawTotalLine("Shipping:", shipping, totalsY + 30);
    
    // Grand Total Box
    doc.rect(350, totalsY + 50, 205, 25).fill(colors.primary);
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10);
    doc.text("GRAND TOTAL", 360, totalsY + 58);
    doc.text(formatCurrency(grandTotal), 460, totalsY + 58, { align: 'right', width: 85 });

    // ========== FOOTER (Fixed at bottom) ==========
    const footerTop = 750;
    doc.moveTo(40, footerTop).lineTo(555, footerTop).stroke(colors.primary);
    
    doc.fillColor(colors.secondary).fontSize(8)
       .text("Thank you for your business!", 40, footerTop + 10, { align: 'center' })
       .text("This is a computer-generated invoice. No signature required.", 40, footerTop + 22, { align: 'center' });

    // 3. Finalize
    doc.end();

  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (!res.headersSent) {
      res.status(500).send("Error generating PDF invoice.");
    }
  }
};
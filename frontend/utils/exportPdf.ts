export interface PdfReportPayload {
  title: string;
  subtitle: string;
  dateRange: string;
  metrics?: { label: string; value: string }[];
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export function exportToPdf({
  title,
  subtitle,
  dateRange,
  metrics,
  headers,
  rows,
  filename,
}: PdfReportPayload) {
  function escapePdf(str: unknown): string {
    return String(str ?? "")
      .replace(/₹/g, "INR ")
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  let content = "";
  // Header band
  content += "0.392 0.047 0.047 rg\n"; // IKIGAI brand crimson #640C0C
  content += "BT /F2 16 Tf 45 790 Td (" + escapePdf(title) + ") Tj ET\n";

  content += "0.15 0.15 0.15 rg\n";
  content += "BT /F2 12 Tf 45 770 Td (" + escapePdf(subtitle) + ") Tj ET\n";

  content += "0.45 0.45 0.45 rg\n";
  content +=
    "BT /F1 9 Tf 45 754 Td (Date Range: " +
    escapePdf(dateRange) +
    " | Generated: " +
    new Date().toLocaleDateString("en-IN") +
    ") Tj ET\n";

  content += "0.85 0.85 0.85 RG 1 w 45 742 m 550 742 l S\n";

  let y = 722;

  // Key metrics box
  if (metrics && metrics.length > 0) {
    content += "0.96 0.96 0.96 rg 45 " + (y - 24) + " 505 30 re f\n";
    content += "0.88 0.88 0.88 RG 0.75 w 45 " + (y - 24) + " 505 30 re S\n";

    const metricWidth = Math.min(160, Math.floor(505 / metrics.length));
    let metricX = 55;
    metrics.forEach((m) => {
      content += "0.4 0.4 0.4 rg\n";
      content +=
        "BT /F1 8 Tf " +
        metricX +
        " " +
        (y - 4) +
        " Td (" +
        escapePdf(m.label.toUpperCase()) +
        ") Tj ET\n";
      content += "0.1 0.1 0.1 rg\n";
      content +=
        "BT /F2 10 Tf " +
        metricX +
        " " +
        (y - 18) +
        " Td (" +
        escapePdf(m.value) +
        ") Tj ET\n";
      metricX += metricWidth;
    });
    y -= 40;
  }

  // Table header background
  content += "0.92 0.92 0.92 rg 45 " + (y - 16) + " 505 20 re f\n";
  content += "0.8 0.8 0.8 RG 0.5 w 45 " + (y - 16) + " 505 20 re S\n";

  // Table header texts
  const colWidth = Math.floor(505 / headers.length);
  content += "0.15 0.15 0.15 rg\n";
  headers.forEach((h, i) => {
    content +=
      "BT /F2 8.5 Tf " +
      (52 + i * colWidth) +
      " " +
      (y - 11) +
      " Td (" +
      escapePdf(h) +
      ") Tj ET\n";
  });
  y -= 26;

  // Rows
  rows.forEach((row, rowIdx) => {
    if (y < 60) return; // single page safety limit

    if (rowIdx % 2 === 1) {
      content += "0.98 0.98 0.98 rg 45 " + (y - 12) + " 505 16 re f\n";
    }
    content += "0.92 0.92 0.92 RG 0.5 w 45 " + (y - 12) + " 505 16 re S\n";

    content += "0.2 0.2 0.2 rg\n";
    row.forEach((cell, i) => {
      content +=
        "BT /F1 8 Tf " +
        (52 + i * colWidth) +
        " " +
        (y - 8) +
        " Td (" +
        escapePdf(cell) +
        ") Tj ET\n";
    });
    y -= 17;
  });

  // Footer
  content += "0.5 0.5 0.5 rg\n";
  content +=
    "BT /F1 8 Tf 45 35 Td (IKIGAI Auto Parts - Confidential Admin Report) Tj ET\n";
  content += "0.85 0.85 0.85 RG 0.5 w 45 47 m 550 47 l S\n";

  const objects: string[] = [];
  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n"
  );
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n"
  );

  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(content).length;
  objects.push(
    "6 0 obj\n<< /Length " +
      contentBytes +
      " >>\nstream\n" +
      content +
      "\nendstream\nendobj\n"
  );

  const header = "%PDF-1.4\n";
  const offsets: number[] = [0];
  let body = "";
  for (let i = 0; i < objects.length; i++) {
    offsets.push(encoder.encode(header + body).length);
    body += objects[i];
  }

  const xrefOffset = encoder.encode(header + body).length;
  let xref = "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    xref += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }

  const trailer =
    "trailer\n<< /Size " +
    (objects.length + 1) +
    " /Root 1 0 R >>\nstartxref\n" +
    xrefOffset +
    "\n%%EOF\n";

  const fullPdfString = header + body + xref + trailer;
  const pdfBytes = encoder.encode(fullPdfString);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

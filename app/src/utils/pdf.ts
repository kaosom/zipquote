import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Item } from "../lib/types";

/** Datos básicos de cada parte */
export interface Party {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/** Payload completo que recibe generatePdf */
export interface PdfPayload {
  contractor: Party;
  client: Party;
  items: Item[];
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

/** Genera y devuelve un jsPDF con el estimate maquetado */
export async function generatePdf(data: PdfPayload) {
  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const left = 40;
  let y = 40;

  /* ---------- Header ---------- */
  pdf.setFont("helvetica", "bold").setFontSize(22).setTextColor("#6B21A8");
  pdf.text("ESTIMATE", left, y);

  pdf
    .setFont("helvetica", "normal")
    .setFontSize(10)
    .setTextColor("#374151")
    .text(`Date: ${new Date().toLocaleDateString()}`, left, (y += 20));

  /* ---------- Contractor ---------- */
  y += 20;
  pdf.setFontSize(11).text("From:", left, y);
  pdf
    .setFont("helvetica", "bold")
    .text(data.contractor.company || data.contractor.name, left + 45, y);

  pdf.setFont("helvetica", "normal");
  if (data.contractor.company)
    pdf.text(data.contractor.name, left + 45, (y += 12));
  if (data.contractor.address)
    pdf.text(data.contractor.address, left + 45, (y += 12));
  if (data.contractor.phone)
    pdf.text(data.contractor.phone, left + 45, (y += 12));
  if (data.contractor.email)
    pdf.text(data.contractor.email, left + 45, (y += 12));

  /* ---------- Client ---------- */
  y = 80;
  const mid = pdf.internal.pageSize.getWidth() / 2;
  pdf.text("To:", mid, y);
  pdf.setFont("helvetica", "bold").text(data.client.name, mid + 25, y);

  pdf.setFont("helvetica", "normal");
  if (data.client.address) pdf.text(data.client.address, mid + 25, (y += 12));
  if (data.client.phone) pdf.text(data.client.phone, mid + 25, (y += 12));
  if (data.client.email) pdf.text(data.client.email, mid + 25, (y += 12));

  /* ---------- Items table ---------- */
  autoTable(pdf, {
    startY: 180,
    head: [["Description", "Qty", "Unit", "Total"]],
    body: data.items.map((it) => [
      it.name,
      it.quantity.toString(),
      `$${it.price.toFixed(2)}`,
      `$${(it.quantity * it.price).toFixed(2)}`,
    ]),
    styles: { font: "helvetica", fontSize: 9, halign: "right" },
    headStyles: { fillColor: [243, 244, 246], textColor: 40 },
    columnStyles: {
      0: { halign: "left" },
      1: { cellWidth: 40 },
      2: { cellWidth: 60 },
    },
    margin: { left, right: left },
  });

  const endY = (pdf as any).lastAutoTable.finalY || 200;

  /* ---------- Totals ---------- */
  pdf.setFontSize(11);
  pdf.text(`Subtotal: $${data.subtotal.toFixed(2)}`, left, endY + 25);
  pdf.text(`Tax (${data.taxRate}%): $${data.tax.toFixed(2)}`, left, endY + 40);

  pdf.setFont("helvetica", "bold").setFontSize(13);
  pdf.text(`TOTAL: $${data.total.toFixed(2)}`, left, endY + 62);

  /* ---------- Signature ---------- */
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(120);
  pdf.line(
    left,
    pageH - 120,
    pdf.internal.pageSize.getWidth() - left,
    pageH - 120
  );
  pdf.setFont("helvetica", "normal").setFontSize(10).setTextColor("#6B7280");
  pdf.text("Client signature", left, pageH - 105);

  return pdf;
}

import type { Item } from "../lib/types";
import type { Party } from "../utils/pdf";

interface PreviewProps {
  contractor: Party;
  client: Party;
  items: Item[];
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

export default function PdfPreview(p: PreviewProps) {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      id="pdf-content"
      class="bg-white text-gray-800 p-8 max-w-3xl mx-auto shadow-lg rounded-lg"
    >
      <header class="flex justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-purple-600">ESTIMATE</h1>
          <p class="text-sm">Date: {date}</p>
        </div>

        <div class="text-right">
          <h2 class="font-bold">{p.contractor.company || p.contractor.name}</h2>
          {p.contractor.company && <p>{p.contractor.name}</p>}
          {p.contractor.phone && <p>{p.contractor.phone}</p>}
          {p.contractor.email && <p>{p.contractor.email}</p>}
        </div>
      </header>

      <section class="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <p class="font-semibold mb-1">From:</p>
          <p>{p.contractor.name}</p>
          {p.contractor.company && <p>{p.contractor.company}</p>}
          {p.contractor.address && <p>{p.contractor.address}</p>}
          {p.contractor.phone && <p>{p.contractor.phone}</p>}
          {p.contractor.email && <p>{p.contractor.email}</p>}
        </div>

        <div>
          <p class="font-semibold mb-1">To:</p>
          <p>{p.client.name}</p>
          {p.client.company && <p>{p.client.company}</p>}
          {p.client.address && <p>{p.client.address}</p>}
          {p.client.phone && <p>{p.client.phone}</p>}
          {p.client.email && <p>{p.client.email}</p>}
        </div>
      </section>

      <table class="w-full text-sm mb-6">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 text-left">Description</th>
            <th class="p-2 text-center">Qty</th>
            <th class="p-2 text-right">Unit</th>
            <th class="p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {p.items.map((it, i) => (
            <tr class={i % 2 ? "bg-gray-50" : ""}>
              <td class="p-2">{it.name}</td>
              <td class="p-2 text-center">{it.quantity}</td>
              <td class="p-2 text-right">${it.price.toFixed(2)}</td>
              <td class="p-2 text-right">
                ${(it.quantity * it.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div class="text-right text-sm space-y-1">
        <p>Subtotal: ${p.subtotal.toFixed(2)}</p>
        <p>
          Tax ({p.taxRate}%): ${p.tax.toFixed(2)}
        </p>
        <p class="font-bold text-lg">Total: ${p.total.toFixed(2)}</p>
      </div>

      <p class="mt-8 text-center text-xs text-gray-500 border-t pt-4">
        This estimate is valid for 30 days. Prices may be subject to change.
      </p>
    </div>
  );
}

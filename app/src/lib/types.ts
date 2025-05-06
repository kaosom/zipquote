export interface Item {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Party {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
}
export interface Estimate {
  id: string;
  date: string;
  contractor: Party;
  client: Party;
  items: Item[];

  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;

  pdfData?: string;
}

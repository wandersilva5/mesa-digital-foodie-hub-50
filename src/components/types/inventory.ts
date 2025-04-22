export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minimumStock: number;
    lastRestocked: string;
    pricePerUnit: number;
    unit: string;
  }
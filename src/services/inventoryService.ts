import { doc, getDoc, updateDoc, setDoc, collection, Timestamp, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface InventoryTransaction {
  id?: string;
  productId: string;
  type: "in" | "out" | "reserved" | "released";
  currentStock: number;
  orderId?: string;
  reason: "purchase" | "sale" | "adjustment" | "return" | "loss";
  notes?: string;
  userId: string;
  previouscurrentStock: number;
  newcurrentStock: number;
  createdAt?: Timestamp;
}

export interface InventoryItem {
  id: string;
  category: string;
  currentStock: string;
  lastUpdated: Timestamp;
  minStock: string;
  name: string;
  price: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  unit: string;
  cost?: number; // Added cost property
}

/**
 * Updates the stock level of a product and records the transaction
 */
export const updateStock = async (
  productId: string,
  currentStock: number,
  type: "in" | "out" | "reserved" | "released",
  reason: "purchase" | "sale" | "adjustment" | "return" | "loss",
  userId: string,
  orderId?: string,
  notes?: string
): Promise<boolean> => {
  try {
    // Get current product information
    const productRef = doc(db, "products", productId);
    const productSnap = await getDoc(productRef);
    
    if (!productSnap.exists()) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    const productData = productSnap.data();
    
    // Check if stock management is enabled for this product
    if (!productData.stockManagement) {
      console.log(`Stock management not enabled for product ${productId}`);
      return true;
    }
    
    // Calculate new quantities based on transaction type
    let newStockcurrentStock = productData.stockcurrentStock || 0;
    let newReservedcurrentStock = productData.stockReserved || 0;
    
    switch (type) {
      case "in":
        // Add to stock
        newStockcurrentStock += currentStock;
        break;
      case "out":
        // Remove from stock
        if (newStockcurrentStock < currentStock) {
          throw new Error(`Not enough stock for product ${productId}`);
        }
        newStockcurrentStock -= currentStock;
        break;
      case "reserved":
        // Move from available to reserved
        if (newStockcurrentStock < currentStock) {
          throw new Error(`Not enough stock for product ${productId}`);
        }
        newStockcurrentStock -= currentStock;
        newReservedcurrentStock += currentStock;
        break;
      case "released":
        // Move from reserved back to available
        if (newReservedcurrentStock < currentStock) {
          throw new Error(`Not enough reserved stock for product ${productId}`);
        }
        newReservedcurrentStock -= currentStock;
        newStockcurrentStock += currentStock;
        break;
    }
    
    const previouscurrentStock = productData.stockcurrentStock || 0;
    
    // Update the product
    await updateDoc(productRef, {
      stockcurrentStock: newStockcurrentStock,
      stockReserved: newReservedcurrentStock,
      updatedAt: Timestamp.now()
    });
    
    // Record the transaction
    const transactionData: InventoryTransaction = {
      productId,
      type,
      currentStock,
      orderId,
      reason,
      notes,
      userId,
      previouscurrentStock,
      newcurrentStock: newStockcurrentStock,
      createdAt: Timestamp.now()
    };
    
    const transactionRef = doc(collection(db, "inventory_transactions"));
    await setDoc(transactionRef, transactionData);
    
    console.log(`Stock updated successfully for product ${productId}`);
    return true;
  } catch (error) {
    console.error("Error updating stock:", error);
    return false;
  }
};

/**
 * Reserve stock items when an order is created with "pending" status
 */
export const reserveStockForOrder = async (
  orderId: string,
  items: { productId: string; currentStock: number }[],
  userId: string
): Promise<boolean> => {
  try {
    // Process each item in the order
    for (const item of items) {
      await updateStock(
        item.productId,
        item.currentStock,
        "reserved",
        "sale",
        userId,
        orderId,
        `Reserved for order ${orderId}`
      );
    }
    return true;
  } catch (error) {
    console.error("Error reserving stock for order:", error);
    return false;
  }
};

/**
 * Release reserved stock when an order is canceled
 */
export const releaseReservedStock = async (
  orderId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Get the order
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    const orderData = orderSnap.data();
    const items = orderData.items || [];
    
    // Release each reserved item
    for (const item of items) {
      await updateStock(
        item.productId,
        item.currentStock,
        "released",
        "return",
        userId,
        orderId,
        `Released from canceled order ${orderId}`
      );
    }
    
    return true;
  } catch (error) {
    console.error("Error releasing reserved stock:", error);
    return false;
  }
};

/**
 * Finalize stock reduction when an order is completed
 */
export const finalizeStockReduction = async (
  orderId: string,
  userId: string
): Promise<boolean> => {
  try {
    // Get the order
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    const orderData = orderSnap.data();
    const items = orderData.items || [];
    
    // Process each item
    for (const item of items) {
      // Get current product data
      const productRef = doc(db, "products", item.productId);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) continue;
      
      const productData = productSnap.data();
      
      if (!productData.stockManagement) continue;
      
      // Update product: reduce reserved amount (stock was already reduced when reserved)
      const newReservedcurrentStock = Math.max(0, (productData.stockReserved || 0) - item.currentStock);
      
      await updateDoc(productRef, {
        stockReserved: newReservedcurrentStock,
        updatedAt: Timestamp.now()
      });
      
      // Record the final transaction
      const transactionData: InventoryTransaction = {
        productId: item.productId,
        type: "out",
        currentStock: item.currentStock,
        orderId,
        reason: "sale",
        notes: `Final stock reduction for order ${orderId}`,
        userId,
        previouscurrentStock: productData.stockReserved || 0,
        newcurrentStock: newReservedcurrentStock,
        createdAt: Timestamp.now()
      };
      
      const transactionRef = doc(collection(db, "inventory_transactions"));
      await setDoc(transactionRef, transactionData);
    }
    
    return true;
  } catch (error) {
    console.error("Error finalizing stock reduction:", error);
    return false;
  }
};

/**
 * Get inventory transactions for a product
 */
export const getProductInventoryHistory = async (productId: string) => {
  try {
    const transactionsRef = collection(db, "inventory_transactions");
    const q = query(transactionsRef, where("productId", "==", productId));
    const querySnapshot = await getDocs(q);
    
    const transactions: InventoryTransaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() } as InventoryTransaction);
    });
    
    return transactions;
  } catch (error) {
    console.error("Error getting product inventory history:", error);
    return [];
  }
};

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const inventoryRef = collection(db, "inventory");
    const snapshot = await getDocs(inventoryRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      currentStock: doc.data().currentStock || '0',
      price: doc.data().price || '',
      unit: doc.data().unit || 'un',
      minStock: (doc.data().minStock !== undefined ? String(doc.data().minStock) : '0'),
      category: doc.data().category || '',
      lastUpdated: doc.data().lastUpdated || Timestamp.now(),
      status: doc.data().status || 'in_stock',
    }));
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<string> => {
  try {
    const inventoryRef = doc(collection(db, "inventory"));
    
    // Garantir que os valores numéricos sejam numbers
    const newItem = {
      ...item,
      currentStock: Number(item.currentStock) || 0,
      minStock: Number(item.minStock) || 0,
      cost: Number(item.cost) || 0,
      lastUpdated: Timestamp.now(),
      status: calculateStatus(Number(item.currentStock) || 0, Number(item.minStock) || 0)
    };
    
    await setDoc(inventoryRef, newItem);
    return inventoryRef.id;
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw error;
  }
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<void> => {
  try {
    const itemRef = doc(db, "inventory", id);
    
    // Garantir que os valores numéricos sejam numbers
    const updatedData = {
      ...updates,
      currentStock: updates.currentStock !== undefined ? Number(updates.currentStock) : undefined,
      minStock: updates.minStock !== undefined ? Number(updates.minStock) : undefined,
      cost: updates.cost !== undefined ? Number(updates.cost) : undefined,
      lastUpdated: Timestamp.now(),
    };

    // Calcular status apenas se currentStock foi atualizada
    if (updatedData.currentStock !== undefined) {
      updatedData.status = calculateStatus(
        updatedData.currentStock,
        updatedData.minStock || 0
      );
    }
    
    await updateDoc(itemRef, updatedData);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "inventory", id));
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
};

export const restockItem = async (id: string, currentStock: number): Promise<void> => {
  try {
    const itemRef = doc(db, "inventory", id);
    const item = (await getDoc(itemRef)).data() as InventoryItem;
    
    const updatedData = {
      currentStock: Number(item.currentStock) + Number(currentStock),
      lastUpdated: Timestamp.now(),
      status: calculateStatus(Number(item.currentStock) + Number(currentStock), Number(item.minStock) || 0)
    };

    await updateDoc(itemRef, updatedData);
  } catch (error) {
    console.error("Error restocking item:", error);
    throw error;
  }
};

export const handleRestock = async (itemId: string, currentStock: number) => {
  const itemRef = doc(db, "inventory", itemId);
  const itemSnap = await getDoc(itemRef);
  
  if (!itemSnap.exists()) {
    throw new Error("Item não encontrado");
  }
  
  const currentcurrentStock = itemSnap.data().currentStock || 0;
  await updateDoc(itemRef, {
    currentStock: currentcurrentStock + currentStock,
    lastUpdated: Timestamp.now()
  });
};

const calculateStatus = (currentStock: number, minStock: number): InventoryItem['status'] => {
  if (currentStock <= 0) return 'out_of_stock';
  if (currentStock <= minStock) return 'low_stock';
  return 'in_stock';
};

/**
 * Get current stock quantity for an item
 */
export const getCurrentStock = async (itemId: string): Promise<number> => {
  try {
    const itemRef = doc(db, "inventory", itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (!itemSnap.exists()) {
      throw new Error("Item não encontrado");
    }
    
    // Convert string to number
    return Number(itemSnap.data().currentStock) || 0;
  } catch (error) {
    console.error("Error getting current stock:", error);
    throw error;
  }
};

/**
 * Get minimum stock quantity for an item
 */
export const getMinimumStock = async (itemId: string): Promise<number> => {
  try {
    const itemRef = doc(db, "inventory", itemId);
    const itemSnap = await getDoc(itemRef);
    
    if (!itemSnap.exists()) {
      throw new Error("Item não encontrado");
    }
    
    // Convert string to number
    return Number(itemSnap.data().minStock) || 0;
  } catch (error) {
    console.error("Error getting minimum stock:", error);
    throw error;
  }
};

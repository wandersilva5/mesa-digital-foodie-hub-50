import { doc, getDoc, updateDoc, setDoc, collection, Timestamp, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface InventoryTransaction {
  id?: string;
  productId: string;
  type: "in" | "out" | "reserved" | "released";
  quantity: number;
  orderId?: string;
  reason: "purchase" | "sale" | "adjustment" | "return" | "loss";
  notes?: string;
  userId: string;
  previousQuantity: number;
  newQuantity: number;
  createdAt?: Timestamp;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: Timestamp;
  category: string;
  cost: number;
  supplier?: string;
}

/**
 * Updates the stock level of a product and records the transaction
 */
export const updateStock = async (
  productId: string,
  quantity: number,
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
    let newStockQuantity = productData.stockQuantity || 0;
    let newReservedQuantity = productData.stockReserved || 0;
    
    switch (type) {
      case "in":
        // Add to stock
        newStockQuantity += quantity;
        break;
      case "out":
        // Remove from stock
        if (newStockQuantity < quantity) {
          throw new Error(`Not enough stock for product ${productId}`);
        }
        newStockQuantity -= quantity;
        break;
      case "reserved":
        // Move from available to reserved
        if (newStockQuantity < quantity) {
          throw new Error(`Not enough stock for product ${productId}`);
        }
        newStockQuantity -= quantity;
        newReservedQuantity += quantity;
        break;
      case "released":
        // Move from reserved back to available
        if (newReservedQuantity < quantity) {
          throw new Error(`Not enough reserved stock for product ${productId}`);
        }
        newReservedQuantity -= quantity;
        newStockQuantity += quantity;
        break;
    }
    
    const previousQuantity = productData.stockQuantity || 0;
    
    // Update the product
    await updateDoc(productRef, {
      stockQuantity: newStockQuantity,
      stockReserved: newReservedQuantity,
      updatedAt: Timestamp.now()
    });
    
    // Record the transaction
    const transactionData: InventoryTransaction = {
      productId,
      type,
      quantity,
      orderId,
      reason,
      notes,
      userId,
      previousQuantity,
      newQuantity: newStockQuantity,
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
  items: { productId: string; quantity: number }[],
  userId: string
): Promise<boolean> => {
  try {
    // Process each item in the order
    for (const item of items) {
      await updateStock(
        item.productId,
        item.quantity,
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
        item.quantity,
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
      const newReservedQuantity = Math.max(0, (productData.stockReserved || 0) - item.quantity);
      
      await updateDoc(productRef, {
        stockReserved: newReservedQuantity,
        updatedAt: Timestamp.now()
      });
      
      // Record the final transaction
      const transactionData: InventoryTransaction = {
        productId: item.productId,
        type: "out",
        quantity: item.quantity,
        orderId,
        reason: "sale",
        notes: `Final stock reduction for order ${orderId}`,
        userId,
        previousQuantity: productData.stockReserved || 0,
        newQuantity: newReservedQuantity,
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
    
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        quantity: Number(data.quantity) || 0,
        unit: data.unit || 'un',
        minQuantity: Number(data.minQuantity) || 0,
        category: data.category || '',
        cost: Number(data.cost) || 0,
        supplier: data.supplier || '',
        status: data.status || 'in_stock',
        lastUpdated: data.lastUpdated || Timestamp.now()
      } as InventoryItem;
    });
    
    console.log("Processed inventory items:", items); // Debug log
    return items;
  } catch (error) {
    console.error("Error in getInventoryItems:", error);
    throw error;
  }
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<string> => {
  try {
    const inventoryRef = doc(collection(db, "inventory"));
    
    // Garantir que os valores numéricos sejam numbers
    const newItem = {
      ...item,
      quantity: Number(item.quantity) || 0,
      minQuantity: Number(item.minQuantity) || 0,
      cost: Number(item.cost) || 0,
      lastUpdated: Timestamp.now(),
      status: calculateStatus(Number(item.quantity) || 0, Number(item.minQuantity) || 0)
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
      quantity: updates.quantity !== undefined ? Number(updates.quantity) : undefined,
      minQuantity: updates.minQuantity !== undefined ? Number(updates.minQuantity) : undefined,
      cost: updates.cost !== undefined ? Number(updates.cost) : undefined,
      lastUpdated: Timestamp.now(),
    };

    // Calcular status apenas se quantity foi atualizada
    if (updatedData.quantity !== undefined) {
      updatedData.status = calculateStatus(
        updatedData.quantity,
        updatedData.minQuantity || 0
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

export const restockItem = async (id: string, quantity: number): Promise<void> => {
  try {
    const itemRef = doc(db, "inventory", id);
    const item = (await getDoc(itemRef)).data() as InventoryItem;
    
    const updatedData = {
      quantity: Number(item.quantity) + Number(quantity),
      lastUpdated: Timestamp.now(),
      status: calculateStatus(Number(item.quantity) + Number(quantity), item.minQuantity)
    };

    await updateDoc(itemRef, updatedData);
  } catch (error) {
    console.error("Error restocking item:", error);
    throw error;
  }
};

const calculateStatus = (quantity: number, minQuantity: number): InventoryItem['status'] => {
  if (quantity <= 0) return 'out_of_stock';
  if (quantity <= minQuantity) return 'low_stock';
  return 'in_stock';
};

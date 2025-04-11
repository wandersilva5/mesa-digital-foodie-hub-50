
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, Timestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { reserveStockForOrder, releaseReservedStock, finalizeStockReduction } from "./inventoryService";

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  observations?: string;
}

interface Order {
  id?: string;
  tableId?: string;
  tableNumber?: number;
  userId?: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "canceled";
  paymentMethod?: string;
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  paymentId?: string;
  delivery?: boolean;
  address?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  completedAt?: Timestamp;
}

/**
 * Create a new order
 */
export const createOrder = async (orderData: Order, userId: string): Promise<string> => {
  try {
    // Set default values
    const order: Order = {
      ...orderData,
      status: "pending",
      paymentStatus: "pending",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Create a new order document
    const orderRef = doc(collection(db, "orders"));
    await setDoc(orderRef, order);
    
    // Reserve stock for all items in the order
    await reserveStockForOrder(
      orderRef.id,
      order.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
      userId
    );
    
    // If it's a table order, update the table status
    if (order.tableId) {
      const tableRef = doc(db, "tables", order.tableId);
      await updateDoc(tableRef, {
        status: "occupied",
        currentOrderId: orderRef.id,
        lastOrderTimestamp: Timestamp.now()
      });
    }
    
    return orderRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: "pending" | "preparing" | "ready" | "delivered" | "canceled",
  userId: string
): Promise<boolean> => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    const orderData = orderSnap.data() as Order;
    const currentStatus = orderData.status;
    
    // Prevent invalid status transitions
    if (currentStatus === "canceled" && newStatus !== "canceled") {
      throw new Error("Cannot change status of a canceled order");
    }
    
    if (currentStatus === "delivered" && newStatus !== "delivered") {
      throw new Error("Cannot change status of a delivered order");
    }
    
    const updateData: Partial<Order> = {
      status: newStatus,
      updatedAt: Timestamp.now()
    };
    
    // Handle inventory based on status change
    if (newStatus === "canceled" && currentStatus !== "canceled") {
      // Release reserved stock if order is canceled
      await releaseReservedStock(orderId, userId);
    }
    
    if (newStatus === "ready" && currentStatus !== "ready") {
      // Finalize stock reduction when order is ready
      await finalizeStockReduction(orderId, userId);
    }
    
    if (newStatus === "delivered") {
      updateData.completedAt = Timestamp.now();
      
      // Release table if this is a table order
      if (orderData.tableId) {
        const tableRef = doc(db, "tables", orderData.tableId);
        await updateDoc(tableRef, {
          status: "available",
          currentOrderId: null
        });
      }
    }
    
    // Update the order
    await updateDoc(orderRef, updateData);
    
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    return false;
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId: string) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      return null;
    }
    
    return { id: orderSnap.id, ...orderSnap.data() } as Order;
  } catch (error) {
    console.error("Error getting order:", error);
    return null;
  }
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status: string | string[]) => {
  try {
    const ordersRef = collection(db, "orders");
    let q;
    
    if (Array.isArray(status)) {
      q = query(
        ordersRef,
        where("status", "in", status),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        ordersRef,
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error("Error getting orders by status:", error);
    return [];
  }
};

/**
 * Get orders ready for payment (completed but not paid)
 */
export const getOrdersForCheckout = async () => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("status", "==", "delivered"),
      where("paymentStatus", "==", "pending"),
      orderBy("completedAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error("Error getting orders for checkout:", error);
    return [];
  }
};


import { collection, doc, setDoc, updateDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Payment {
  id?: string;
  orderId: string;
  userId?: string;
  staffId: string;
  method: "cash" | "credit" | "debit" | "pix" | "app";
  amount: number;
  tip?: number;
  taxes?: number;
  serviceCharge?: number;
  amountReceived?: number;
  change?: number;
  status: "completed" | "refunded" | "canceled" | "failed";
  reference?: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Process a payment for an order
 */
export const processPayment = async (paymentData: Payment): Promise<string> => {
  try {
    // Set default values
    const payment: Payment = {
      ...paymentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: paymentData.status || "completed"
    };
    
    // Create a new payment document
    const paymentRef = doc(collection(db, "payments"));
    await setDoc(paymentRef, payment);
    
    // Update order status to reflect payment
    const orderRef = doc(db, "orders", payment.orderId);
    await updateDoc(orderRef, {
      paymentStatus: "paid",
      paymentMethod: payment.method,
      paymentId: paymentRef.id,
      updatedAt: Timestamp.now()
    });
    
    // If there's an active register session, add this payment to it
    await addPaymentToActiveRegisterSession(paymentRef.id, payment);
    
    return paymentRef.id;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

/**
 * Add payment to active register session if one exists
 */
const addPaymentToActiveRegisterSession = async (paymentId: string, payment: Payment) => {
  try {
    // Find active register session
    const sessionsRef = collection(db, "register_sessions");
    const q = query(sessionsRef, where("status", "==", "open"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No active register session found");
      return;
    }
    
    // Get the first open session
    const sessionDoc = querySnapshot.docs[0];
    const sessionId = sessionDoc.id;
    const sessionData = sessionDoc.data();
    
    // Create a transaction record
    const transaction = {
      paymentId,
      orderId: payment.orderId,
      method: payment.method,
      amount: payment.amount,
      timestamp: Timestamp.now()
    };
    
    // Calculate new expected closing amount
    const expectedClosingAmount = sessionData.expectedClosingAmount || 0;
    const newExpectedAmount = payment.method === "cash" 
      ? expectedClosingAmount + payment.amount 
      : expectedClosingAmount;
    
    // Update the session with the new transaction and updated expected amount
    await updateDoc(doc(db, "register_sessions", sessionId), {
      transactions: [...(sessionData.transactions || []), transaction],
      expectedClosingAmount: newExpectedAmount,
      updatedAt: Timestamp.now()
    });
    
    console.log(`Payment added to register session ${sessionId}`);
  } catch (error) {
    console.error("Error adding payment to register session:", error);
  }
};

/**
 * Get all payments for an order
 */
export const getOrderPayments = async (orderId: string) => {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const querySnapshot = await getDocs(q);
    
    const payments: Payment[] = [];
    querySnapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() } as Payment);
    });
    
    return payments;
  } catch (error) {
    console.error("Error getting order payments:", error);
    return [];
  }
};

/**
 * Open a new register session
 */
export const openRegisterSession = async (
  userId: string,
  openingAmount: number,
  notes: string = ""
): Promise<string> => {
  try {
    const sessionData = {
      userId,
      status: "open",
      openingAmount,
      expectedClosingAmount: openingAmount,
      actualClosingAmount: 0,
      difference: 0,
      openedAt: Timestamp.now(),
      closedAt: null,
      notes,
      transactions: [],
      updatedAt: Timestamp.now()
    };
    
    const sessionRef = doc(collection(db, "register_sessions"));
    await setDoc(sessionRef, sessionData);
    
    return sessionRef.id;
  } catch (error) {
    console.error("Error opening register session:", error);
    throw error;
  }
};

/**
 * Close a register session
 */
export const closeRegisterSession = async (
  sessionId: string,
  actualClosingAmount: number,
  notes: string = ""
): Promise<boolean> => {
  try {
    const sessionRef = doc(db, "register_sessions", sessionId);
    const sessionSnap = await getDocs(query(collection(db, "register_sessions"), where("id", "==", sessionId)));
    
    if (sessionSnap.empty) {
      throw new Error(`Register session with ID ${sessionId} not found`);
    }
    
    const sessionData = sessionSnap.docs[0].data();
    
    // Calculate difference
    const expectedAmount = sessionData.expectedClosingAmount || 0;
    const difference = actualClosingAmount - expectedAmount;
    
    // Update session
    await updateDoc(sessionRef, {
      status: "closed",
      actualClosingAmount,
      difference,
      closedAt: Timestamp.now(),
      notes: sessionData.notes ? `${sessionData.notes}\n${notes}` : notes,
      updatedAt: Timestamp.now()
    });
    
    return true;
  } catch (error) {
    console.error("Error closing register session:", error);
    return false;
  }
};

/**
 * Get active register session if one exists
 */
export const getActiveRegisterSession = async () => {
  try {
    const sessionsRef = collection(db, "register_sessions");
    const q = query(sessionsRef, where("status", "==", "open"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    // Return the first open session
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error getting active register session:", error);
    return null;
  }
};

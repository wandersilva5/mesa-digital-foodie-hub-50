import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Category {
  id: number;
  name: string;
  description: string;
  order: number;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoryRef = collection(db, "categories");
    const q = query(categoryRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id || Number(doc.id),
        name: data.name,
        description: data.description,
        order: data.order || 0
      } as Category;
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

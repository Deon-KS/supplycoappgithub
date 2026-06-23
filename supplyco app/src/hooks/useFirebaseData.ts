import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Product, Offer } from '../types';

export interface Banner {
  id: string;
  tag: string;
  title: string;
  desc: string;
  img: string;
  tab: string;
}

export function useLiveProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData: Product[] = [];
      snapshot.forEach((doc) => {
        liveData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(liveData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to products:", error);
    });

    return () => unsubscribe();
  }, []);

  return { products, loading };
}

export function useLiveOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can query only active offers, or just fetch all and filter
    const q = query(collection(db, "offers"), where("isActive", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData: Offer[] = [];
      snapshot.forEach((doc) => {
        liveData.push({ id: doc.id, ...doc.data() } as Offer);
      });
      setOffers(liveData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to offers:", error);
    });

    return () => unsubscribe();
  }, []);

  return { offers, loading };
}

export function useLiveBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "banners"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData: Banner[] = [];
      snapshot.forEach((doc) => {
        liveData.push({ id: doc.id, ...doc.data() } as Banner);
      });
      setBanners(liveData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to banners:", error);
    });

    return () => unsubscribe();
  }, []);

  return { banners, loading };
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "alert" | "offer" | "info";
  createdAt: string | null;
  isPublished?: boolean;
}

export function useLiveNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: sorting requires a composite index if combining with 'where'.
    // Here we fetch all notifications and strictly filter and sort locally to avoid forcing index creation on the user immediately.
    const q = query(collection(db, "notifications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData: AppNotification[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as AppNotification;
        if (data.isPublished) {
          liveData.push({ id: doc.id, ...data });
        }
      });
      // Sort locally by createdAt descending
      liveData.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setNotifications(liveData);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to notifications:", error);
    });

    return () => unsubscribe();
  }, []);

  return { notifications, loading };
}

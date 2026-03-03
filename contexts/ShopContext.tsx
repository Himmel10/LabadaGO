import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { LaundryShop, LaundryService, Review } from '@/types';

const SHOPS_KEY = 'labadago_shops';
const REVIEWS_KEY = 'labadago_reviews';

export const [ShopProvider, useShops] = createContextHook(() => {
  const [shops, setShops] = useState<LaundryShop[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const shopsRef = useRef(shops);
  shopsRef.current = shops;
  const reviewsRef = useRef(reviews);
  reviewsRef.current = reviews;

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [storedShops, storedReviews] = await Promise.all([
        AsyncStorage.getItem(SHOPS_KEY),
        AsyncStorage.getItem(REVIEWS_KEY),
      ]);
      if (storedShops) setShops(JSON.parse(storedShops));
      if (storedReviews) setReviews(JSON.parse(storedReviews));
      console.log('Loaded shops:', storedShops ? JSON.parse(storedShops).length : 0);
    } catch (e) {
      console.log('Failed to load shop data:', e);
    }
  };

  const saveShops = useCallback(async (updated: LaundryShop[]) => {
    setShops(updated);
    await AsyncStorage.setItem(SHOPS_KEY, JSON.stringify(updated));
  }, []);

  const saveReviews = useCallback(async (updated: Review[]) => {
    setReviews(updated);
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
  }, []);

  const addShop = useCallback(async (shop: Omit<LaundryShop, 'id' | 'reviews'>) => {
    const newShop: LaundryShop = {
      ...shop,
      id: `shop_${Date.now()}`,
      reviews: [],
    };
    const updated = [...shopsRef.current, newShop];
    await saveShops(updated);
    console.log('Added shop:', newShop.name);
    return newShop;
  }, [saveShops]);

  const updateShop = useCallback(async (shopId: string, updates: Partial<LaundryShop>) => {
    const updated = shopsRef.current.map((s) =>
      s.id === shopId ? { ...s, ...updates } : s
    );
    await saveShops(updated);
    console.log('Updated shop:', shopId);
  }, [saveShops]);

  const getShopByOwner = useCallback((ownerId: string): LaundryShop | undefined => {
    return shops.find((s) => s.ownerId === ownerId);
  }, [shops]);

  const addService = useCallback(async (shopId: string, service: Omit<LaundryService, 'id' | 'shopId'>) => {
    const newService: LaundryService = {
      ...service,
      id: `sv_${Date.now()}`,
      shopId,
    };
    const updated = shopsRef.current.map((s) =>
      s.id === shopId
        ? { ...s, services: [...s.services, newService] }
        : s
    );
    await saveShops(updated);
    console.log('Added service:', newService.name, 'to shop:', shopId);
    return newService;
  }, [saveShops]);

  const removeService = useCallback(async (shopId: string, serviceId: string) => {
    const updated = shopsRef.current.map((s) =>
      s.id === shopId
        ? { ...s, services: s.services.filter((sv) => sv.id !== serviceId) }
        : s
    );
    await saveShops(updated);
    console.log('Removed service:', serviceId, 'from shop:', shopId);
  }, [saveShops]);

  const addReview = useCallback(async (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedReviews = [newReview, ...reviewsRef.current];
    await saveReviews(updatedReviews);

    const currentShops = shopsRef.current;
    const shop = currentShops.find((s) => s.id === review.shopId);
    if (shop) {
      const shopReviews = updatedReviews.filter((r) => r.shopId === review.shopId);
      const avgRating = Math.round((shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length) * 10) / 10;
      await updateShop(review.shopId, {
        rating: avgRating,
        reviewCount: shopReviews.length,
      });
    }

    console.log('Added review for shop:', review.shopId, 'rating:', review.rating);
    return newReview;
  }, [saveReviews, updateShop]);

  const replyToReview = useCallback(async (reviewId: string, replyText: string) => {
    const updated = reviewsRef.current.map((r) =>
      r.id === reviewId
        ? { ...r, reply: replyText, repliedAt: new Date().toISOString() }
        : r
    );
    await saveReviews(updated);
    console.log('Replied to review:', reviewId);
  }, [saveReviews]);

  const updateServicePhoto = useCallback(async (shopId: string, serviceId: string, photo: string) => {
    const updated = shopsRef.current.map((s) =>
      s.id === shopId
        ? {
            ...s,
            services: s.services.map((sv) =>
              sv.id === serviceId ? { ...sv, photo } : sv
            ),
          }
        : s
    );
    await saveShops(updated);
    console.log('Updated service photo:', serviceId);
  }, [saveShops]);

  const getReviewsByShop = useCallback((shopId: string) => {
    return reviews.filter((r) => r.shopId === shopId);
  }, [reviews]);

  const getOpenShops = useCallback(() => {
    return shops.filter((s) => s.isOpen);
  }, [shops]);

  return {
    shops,
    reviews,
    addShop,
    updateShop,
    getShopByOwner,
    addService,
    removeService,
    addReview,
    replyToReview,
    updateServicePhoto,
    getReviewsByShop,
    getOpenShops,
  };
});

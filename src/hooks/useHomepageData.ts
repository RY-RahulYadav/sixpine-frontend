import { useState, useEffect, useCallback, useRef } from 'react';
import { homepageAPI, productAPI } from '../services/api';

// Cache for homepage data to prevent re-fetching on page revisit
const homepageCache: {
    data: HomepageData | null;
    timestamp: number;
    categories: any[] | null;
} = {
    data: null,
    timestamp: 0,
    categories: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export interface HomepageData {
    hero: any;
    hero2: any;
    hero3: any;
    promotionalBanner: any;
    categories: any;
    furnitureSections: any;
    furnitureOfferSections: any;
    featureCard: any;
    bannerCards: any;
    furnitureInfoSection: any;
}

interface UseHomepageDataResult {
    data: HomepageData | null;
    navbarCategories: any[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

// Default data for all sections (for immediate render)
export const defaultHomepageData: HomepageData = {
    hero: null,
    hero2: null,
    hero3: null,
    promotionalBanner: null,
    categories: null,
    furnitureSections: null,
    furnitureOfferSections: null,
    featureCard: null,
    bannerCards: null,
    furnitureInfoSection: null,
};

// Batch all homepage API calls into a single parallel request
async function fetchAllHomepageData(): Promise<HomepageData> {
    const sectionKeys = [
        'hero',
        'hero2',
        'hero3',
        'promotional-banner',
        'categories',
        'furniture-sections',
        'furniture-offer-sections',
        'feature-card',
        'banner-cards',
        'furniture-info-section',
    ];

    // Execute all API calls in parallel
    const results = await Promise.allSettled(
        sectionKeys.map((key) => homepageAPI.getHomepageContent(key))
    );

    const data: HomepageData = { ...defaultHomepageData };

    // Map results to data object
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value?.data?.content) {
            const key = sectionKeys[index];
            switch (key) {
                case 'hero':
                    data.hero = result.value.data.content;
                    break;
                case 'hero2':
                    data.hero2 = result.value.data.content;
                    break;
                case 'hero3':
                    data.hero3 = result.value.data.content;
                    break;
                case 'promotional-banner':
                    data.promotionalBanner = result.value.data.content;
                    break;
                case 'categories':
                    data.categories = result.value.data.content;
                    break;
                case 'furniture-sections':
                    data.furnitureSections = result.value.data.content;
                    break;
                case 'furniture-offer-sections':
                    data.furnitureOfferSections = result.value.data.content;
                    break;
                case 'feature-card':
                    data.featureCard = result.value.data.content;
                    break;
                case 'banner-cards':
                    data.bannerCards = result.value.data.content;
                    break;
                case 'furniture-info-section':
                    data.furnitureInfoSection = result.value.data.content;
                    break;
            }
        }
    });

    return data;
}

export function useHomepageData(): UseHomepageDataResult {
    const [data, setData] = useState<HomepageData | null>(homepageCache.data);
    const [navbarCategories, setNavbarCategories] = useState<any[]>(
        homepageCache.categories || []
    );
    const [isLoading, setIsLoading] = useState(!homepageCache.data);
    const [error, setError] = useState<Error | null>(null);
    const fetchingRef = useRef(false);

    const fetchData = useCallback(async (forceRefresh = false) => {
        // Prevent duplicate fetches
        if (fetchingRef.current) return;

        const now = Date.now();
        const cacheValid =
            homepageCache.data &&
            now - homepageCache.timestamp < CACHE_DURATION &&
            !forceRefresh;

        if (cacheValid) {
            setData(homepageCache.data);
            setNavbarCategories(homepageCache.categories || []);
            setIsLoading(false);
            return;
        }

        fetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            // Fetch homepage data and navbar categories in parallel
            const [homepageData, categoriesResponse] = await Promise.all([
                fetchAllHomepageData(),
                productAPI.getNavbarCategories(),
            ]);

            const categories =
                categoriesResponse.data?.results || categoriesResponse.data || [];

            // Update cache
            homepageCache.data = homepageData;
            homepageCache.categories = categories;
            homepageCache.timestamp = now;

            setData(homepageData);
            setNavbarCategories(categories);
        } catch (err) {
            console.error('Error fetching homepage data:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        } finally {
            setIsLoading(false);
            fetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    return { data, navbarCategories, isLoading, error, refetch };
}

// Clear cache when needed (e.g., admin updates content)
export function clearHomepageCache(): void {
    homepageCache.data = null;
    homepageCache.categories = null;
    homepageCache.timestamp = 0;
}

export default useHomepageData;

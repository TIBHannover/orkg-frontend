import { useCallback, useEffect, useState } from 'react';

export type ContributionData = {
    paperId: string;
    paperTitle: string;
    contributionTitle: string;
};

export type Comparison = {
    byId: Record<string, ContributionData>;
    allIds: string[];
};

export const COMPARISON_STORAGE_KEY = 'comparison';
export const COMPARISON_CHANGE_EVENT = 'comparison-changed';

export const getComparisonFromLocalStorage = (): Comparison => {
    try {
        const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error parsing comparison from localStorage:', error);
    }
    return { byId: {}, allIds: [] };
};

export const saveComparisonToLocalStorage = (comparison: Comparison): void => {
    try {
        localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(comparison));
        // Dispatch custom event for same-tab synchronization
        window.dispatchEvent(new CustomEvent(COMPARISON_CHANGE_EVENT, { detail: comparison }));
    } catch (error) {
        console.error('Error saving comparison to localStorage:', error);
    }
};

/**
 * Custom hook to manage comparison state with automatic synchronization
 * Listens to both storage events (cross-tab) and custom events (same-tab)
 */
export const useComparisonPopup = () => {
    const [comparison, setComparison] = useState<Comparison>(() => getComparisonFromLocalStorage());

    useEffect(() => {
        // Handler for cross-tab synchronization (storage event)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === COMPARISON_STORAGE_KEY) {
                setComparison(getComparisonFromLocalStorage());
            }
        };

        // Handler for same-tab synchronization (custom event)
        const handleComparisonChange = (e: Event) => {
            const customEvent = e as CustomEvent<Comparison>;
            if (customEvent.detail) {
                setComparison(customEvent.detail);
            } else {
                setComparison(getComparisonFromLocalStorage());
            }
        };

        // Listen to storage changes from other tabs
        window.addEventListener('storage', handleStorageChange);
        // Listen to custom events from same tab
        window.addEventListener(COMPARISON_CHANGE_EVENT, handleComparisonChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(COMPARISON_CHANGE_EVENT, handleComparisonChange);
        };
    }, []);

    const updateComparison = useCallback((updater: (prev: Comparison) => Comparison) => {
        setComparison((prev) => {
            const newComparison = updater(prev);
            saveComparisonToLocalStorage(newComparison);
            return newComparison;
        });
    }, []);

    return { comparison, updateComparison };
};

export default useComparisonPopup;

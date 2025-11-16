import { useState, useEffect } from 'react';

function getValueFromLocalStorage<T>(key: string, initialValue: T | (() => T)): T {
    try {
        const item = window.localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
    } catch (error) {
        console.error(`Error reading localStorage key “${key}”:`, error);
    }

    if (initialValue instanceof Function) {
        return initialValue();
    }
    return initialValue;
}

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        return getValueFromLocalStorage(key, initialValue);
    });

    useEffect(() => {
        try {
            const valueToStore =
                typeof storedValue === 'function'
                    ? storedValue(storedValue)
                    : storedValue;
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}

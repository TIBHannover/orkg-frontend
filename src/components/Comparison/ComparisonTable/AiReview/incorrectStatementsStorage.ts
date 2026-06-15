const keyFor = (comparisonId: string) => `orkg.aiComparison.incorrectStatements.${comparisonId}`;

export const loadIncorrectStatementIds = (comparisonId: string): string[] => {
    try {
        const raw = localStorage.getItem(keyFor(comparisonId));
        return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
        // ignore — localStorage may be unavailable (private mode, quota, SSR, etc.)
        return [];
    }
};

export const saveIncorrectStatementIds = (comparisonId: string, ids: string[]): void => {
    try {
        localStorage.setItem(keyFor(comparisonId), JSON.stringify(ids));
    } catch {
        // ignore
    }
};

export const clearIncorrectStatementIds = (comparisonId: string): void => {
    try {
        localStorage.removeItem(keyFor(comparisonId));
    } catch {
        // ignore
    }
};

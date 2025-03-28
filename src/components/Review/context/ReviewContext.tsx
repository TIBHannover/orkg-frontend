import { createContext, ReactNode, SetStateAction, useMemo, useState } from 'react';

type UsedReference = {
    [sectionId: string]: string[];
};

export const reviewContext = createContext<{
    usedReferences: UsedReference;
    setUsedReferences: (data: SetStateAction<UsedReference>) => void;
}>({
    usedReferences: {},
    setUsedReferences: () => {},
});

export default function ReviewContextProvider({ children }: { children: ReactNode }) {
    const [usedReferences, setUsedReferences] = useState<UsedReference>({});
    const contextValue = useMemo(() => ({ usedReferences, setUsedReferences }), [usedReferences, setUsedReferences]);

    return <reviewContext.Provider value={contextValue}>{children}</reviewContext.Provider>;
}

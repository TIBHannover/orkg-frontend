import { type MoveItem } from '@orkg/pragmatic-dnd-hooks';
import { createContext, useContext } from 'react';

type ListOrderingContextType = {
    instanceId: symbol;
    moveItem: MoveItem;
} | null;

export const ListOrderingContext = createContext<ListOrderingContextType>(null);

const useListOrderingContext = () => useContext(ListOrderingContext);

export default useListOrderingContext;

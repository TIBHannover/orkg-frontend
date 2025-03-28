import { findIndex } from 'lodash';
import { parseAsJson, useQueryState } from 'nuqs';
import { z } from 'zod';

import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';

const schemaHistory = z.array(
    z.object({
        p: z.array(z.string()),
    }),
);

export type History = {
    p: string[];
}[];

const useHistory = () => {
    const { rootId, config, history: stateHistory } = useDataBrowserState();
    const dispatch = useDataBrowserDispatch();

    const [history, setHistory] = useQueryState('history', parseAsJson<History>(schemaHistory.parse).withDefault([]));

    // Current history is the history that starts with the root id (from context)
    let currentHistory = history.find((h) => h.p.length > 0 && h.p[0] === rootId)?.p ?? [];

    // if the defaultHistory is not an empty array, the history will be from the local state
    if (!currentHistory.length && config.defaultHistory && config.defaultHistory.length > 0) {
        currentHistory = stateHistory ?? [];
    }

    const currentId = currentHistory.length > 1 ? currentHistory[currentHistory.length - 1] : rootId;

    const setCurrentHistory = (newHistory: string[]) => {
        // if the defaultHistory is empty array, the history will be from the url
        if (!config.defaultHistory?.length) {
            const currentHistoryIndex = findIndex(history, (h) => h.p.length > 0 && h.p[0] === rootId);

            if (currentHistoryIndex !== -1) {
                setHistory((prev) => {
                    const newHistories = [...prev];
                    if (newHistory.length > 1) {
                        newHistories[currentHistoryIndex] = { p: newHistory };
                    } else {
                        newHistories.splice(currentHistoryIndex, 1);
                    }
                    return newHistories;
                });
                dispatch({ type: 'SET_LOADED_RESOURCES', payload: {} });
            } else {
                setHistory((prev) => [...prev, ...(newHistory.length > 1 ? [{ p: newHistory }] : [])]);
                dispatch({ type: 'SET_LOADED_RESOURCES', payload: {} });
            }
        } else {
            dispatch({ type: 'SET_HISTORY', payload: newHistory });
            dispatch({ type: 'SET_LOADED_RESOURCES', payload: {} });
        }
    };

    const getPreviousId = (id: string) => {
        const index = currentHistory.indexOf(id);
        return index > 1 ? currentHistory[index - 2] : undefined;
    };

    return { currentId, history: currentHistory, setHistory: setCurrentHistory, getPreviousId };
};

export default useHistory;

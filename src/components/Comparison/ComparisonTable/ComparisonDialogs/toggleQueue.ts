// Serializes visibility toggles per comparison: SWR does NOT queue concurrent
// mutate(asyncUpdater) calls, so without this two rapid toggles on different
// properties would both read the same base selected_paths and the second PUT
// would silently overwrite the first. Module-level so dialogs of the same
// comparison share one queue; failures don't break the chain (errors are
// handled inside each queued task).

const toggleQueues = new Map<string, Promise<void>>();

const enqueueToggle = (comparisonId: string, task: () => Promise<void>): Promise<void> => {
    const next = (toggleQueues.get(comparisonId) ?? Promise.resolve()).then(task);
    toggleQueues.set(
        comparisonId,
        next.finally(() => {
            if (toggleQueues.get(comparisonId) === next) {
                toggleQueues.delete(comparisonId);
            }
        }),
    );
    return next;
};

export default enqueueToggle;

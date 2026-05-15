import { Alert, Button, Modal } from '@heroui/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

import PathList from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/PathList/PathList';
import { PathWithSettings } from '@/components/Comparison/ComparisonTable/ColumnHeaders/FirstColumnHeader/TablePathsModal/types';
import useComparison from '@/components/Comparison/hooks/useComparison';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import { comparisonUrl, getComparisonTablePaths, updateComparisonContents } from '@/services/backend/comparisons';
import { ComparisonPath, ComparisonUpdateSelectedPath } from '@/services/backend/types';

type TablePathsModalProps = {
    toggle: () => void;
};

const toggleExpandPath = (paths: PathWithSettings[], targetPath: string[]): PathWithSettings[] => {
    return paths.map((path) => {
        if (path.id === targetPath[0]) {
            if (targetPath.length === 1) {
                return { ...path, isExpanded: !path.isExpanded };
            }
            if (path.children) {
                return { ...path, children: toggleExpandPath(path.children, targetPath.slice(1)) };
            }
        }
        return path;
    });
};

const deselectChildren = (paths: PathWithSettings[]): PathWithSettings[] => {
    return paths.map((path) => ({
        ...path,
        isSelected: false,
        children: path.children ? deselectChildren(path.children) : path.children,
    }));
};

const toggleSelectPath = (paths: PathWithSettings[], targetPath: string[]): PathWithSettings[] => {
    return paths.map((path) => {
        if (path.id !== targetPath[0]) {
            return path;
        }

        if (targetPath.length === 1) {
            return {
                ...path,
                isSelected: !path.isSelected,
                children: path.isSelected && path.children ? deselectChildren(path.children) : path.children,
            };
        }

        if (path.children) {
            const updatedChildren = toggleSelectPath(path.children, targetPath.slice(1));
            const isAnyChildSelected = updatedChildren.some((child) => child.isSelected);
            return {
                ...path,
                isSelected: isAnyChildSelected || path.isSelected,
                children: updatedChildren,
            };
        }

        return path;
    });
};

const mergeSelectedPathsWithTablePaths = (selectedPaths: ComparisonPath[], tablePaths: ComparisonPath[]): PathWithSettings[] => {
    const map = new Map<string, PathWithSettings>();

    selectedPaths.forEach((node) =>
        map.set(node.id, { ...node, isExpanded: true, isSelected: true, children: node.children ? [...node.children] : [] }),
    );

    tablePaths.forEach((node) => {
        if (map.has(node.id)) {
            const existing = map.get(node.id)!;
            if (node.children) {
                existing.children = mergeSelectedPathsWithTablePaths(existing.children || [], node.children);
            }
        } else {
            map.set(node.id, { ...node, children: node.children ? [...node.children] : [] });
        }
    });

    return Array.from(map.values());
};

const updateChildrenOrder = ({
    paths,
    newPathOrder,
    parentPathIds,
}: {
    paths: PathWithSettings[];
    newPathOrder: PathWithSettings[];
    parentPathIds: string[];
}): PathWithSettings[] => {
    return paths.map((path) => {
        if (path.id === parentPathIds[0]) {
            if (parentPathIds.length === 1) {
                return { ...path, children: newPathOrder };
            }
            if (path.children) {
                return {
                    ...path,
                    children: updateChildrenOrder({ paths: path.children, newPathOrder, parentPathIds: parentPathIds.slice(1) }),
                };
            }
        }
        return path;
    });
};

const prepareUpdatePaths = (paths: PathWithSettings[]): ComparisonUpdateSelectedPath[] => {
    return paths
        .filter((path) => path.isSelected)
        .map(({ id, type, children }) => ({
            id,
            type,
            children: children && children.length > 0 ? prepareUpdatePaths(children) : [],
        }));
};

const TablePathsModal = ({ toggle }: TablePathsModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [pathsNew, setPathsNew] = useState<PathWithSettings[]>([]);

    const { comparison, comparisonContents, mutateComparisonContents } = useComparison();

    const { data: tablePaths, isLoading: isLoadingTablePaths } = useSWR(
        comparison?.id ? [comparison?.id, comparisonUrl, 'getComparisonTablePaths'] : null,
        ([params]) => getComparisonTablePaths(params),
        {
            revalidateOnMount: true,
        },
    );

    useEffect(() => {
        if (tablePaths && comparisonContents?.selected_paths) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPathsNew(mergeSelectedPathsWithTablePaths(comparisonContents?.selected_paths, tablePaths));
        }
    }, [comparisonContents?.selected_paths, tablePaths]);

    if (!comparison) {
        return null;
    }

    const handleToggleExpandPath = (propertyPath: string[]) => {
        setPathsNew(toggleExpandPath(pathsNew, propertyPath));
    };

    const handleSelectPath = (propertyPath: string[]) => {
        setPathsNew(toggleSelectPath(pathsNew, propertyPath));
    };

    const handleReorder = ({ newPathOrder, parentPathIds }: { newPathOrder: PathWithSettings[]; parentPathIds: string[] }) => {
        setPathsNew((prevPaths) => {
            if (parentPathIds.length === 0) {
                return newPathOrder;
            }
            return updateChildrenOrder({ paths: prevPaths, newPathOrder, parentPathIds });
        });
    };

    const handleSelect = async () => {
        setIsLoading(true);
        const items = prepareUpdatePaths(pathsNew);
        await updateComparisonContents({
            id: comparison.id,
            selected_paths: items,
        });
        await mutateComparisonContents();
        toggle();
    };

    const isBusy = isLoadingTablePaths || isLoading;

    const handleOpenChange = (open: boolean) => {
        if (!open && !isBusy) {
            toggle();
        }
    };

    return (
        <Modal.Backdrop isOpen onOpenChange={handleOpenChange} isDismissable={!isBusy} isKeyboardDismissDisabled={isBusy}>
            <Modal.Container size="lg" className="max-h-[calc(100vh-73px)] mt-[73px]">
                <Modal.Dialog className="max-w-3xl">
                    <LoadingOverlay isLoading={isBusy} className="rounded" />
                    <Modal.Header className="flex-row items-center justify-between gap-3">
                        <Modal.Heading>Select properties</Modal.Heading>
                        <Modal.CloseTrigger className="static" />
                    </Modal.Header>
                    <Modal.Body className="pt-4 pb-2 px-1">
                        {!isLoadingTablePaths && pathsNew.length > 0 && (
                            <PathList
                                paths={pathsNew}
                                handleReorder={handleReorder}
                                handleToggleExpandPath={handleToggleExpandPath}
                                handleSelectPath={handleSelectPath}
                            />
                        )}
                        {!isLoadingTablePaths && pathsNew.length === 0 && (
                            <Alert status="accent">
                                No properties available for selection. Add sources or edit data from your sources and try again
                            </Alert>
                        )}
                    </Modal.Body>
                    {!isLoadingTablePaths && pathsNew.length > 0 && (
                        <Modal.Footer>
                            <Button onPress={handleSelect}>Select</Button>
                        </Modal.Footer>
                    )}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default TablePathsModal;

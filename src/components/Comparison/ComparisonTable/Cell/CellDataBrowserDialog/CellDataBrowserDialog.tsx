import classToType from '@/components/Comparison/ComparisonTable/Cell/helpers/classToType';
import useComparison from '@/components/Comparison/hooks/useComparison';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import { ThingReference } from '@/services/backend/types';

type CellDataBrowserDialogProps = {
    value: ThingReference;
    dataBrowserHistory?: string[];
    onClose: () => void;
};

const CellDataBrowserDialog = ({ value, dataBrowserHistory, onClose }: CellDataBrowserDialogProps) => {
    const { selectedPathsFlattened, comparisonContents, mutateComparisonContents, isEditMode } = useComparison();

    return (
        <DataBrowserDialog
            show
            toggleModal={() => {
                if (isEditMode) mutateComparisonContents(comparisonContents, { revalidate: true });
                onClose();
            }}
            id={value.id ?? ''}
            label={value.label ?? ''}
            type={classToType?.[value?._class] ?? 'literal_ref'}
            comparisonSelectedPaths={selectedPathsFlattened.map((selectedPath) => [...(selectedPath.path ?? []), selectedPath.id])}
            isEditMode={isEditMode}
            defaultHistory={dataBrowserHistory}
        />
    );
};

export default CellDataBrowserDialog;

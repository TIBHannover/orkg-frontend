import { FC, useCallback } from 'react';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import VisualizationPreview from '@/components/Resource/Tabs/Preview/VisualizationPreview/VisualizationPreview';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { CLASSES } from '@/constants/graphSettings';

type PreviewFactoryProps = {
    id: string;
    classes: string[];
};

const PreviewFactory: FC<PreviewFactoryProps> = ({ id, classes }) => {
    const findClass = useCallback((classId: string) => classes?.includes(classId), [classes]);

    const { isEditMode } = useIsEditMode();

    if (findClass(CLASSES.VISUALIZATION)) {
        return <VisualizationPreview id={id} />;
    }

    if (findClass(CLASSES.CSVW_TABLE)) {
        return (
            <div className="p-4">
                <DataBrowser id={id} showHeader={false} isEditMode={isEditMode} showFooter={false} />
            </div>
        );
    }

    return null;
};

export default PreviewFactory;

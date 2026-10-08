import { FC } from 'react';

import CSVWTable from '@/components/DataBrowser/components/Body/ValuePreviewFactory/CSVWTable/CSVTable';
import { hasValuePreview } from '@/components/DataBrowser/utils/dataBrowserUtils';
import { Statement } from '@/services/backend/types';

type ValuePreviewFactoryProps = {
    value: Statement['object'];
    children: React.ReactNode;
};

const ValuePreviewFactory: FC<ValuePreviewFactoryProps> = ({ value, children }) => {
    if (hasValuePreview(value)) {
        return <CSVWTable id={value.id} />;
    }

    return children;
};
export default ValuePreviewFactory;

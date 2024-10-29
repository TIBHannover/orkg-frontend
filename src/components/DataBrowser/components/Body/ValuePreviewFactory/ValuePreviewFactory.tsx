import CSVWTable from 'components/DataBrowser/components/Body/ValuePreviewFactory/CSVWTable/CSVTable';
import { CLASSES } from 'constants/graphSettings';
import { FC } from 'react';
import { Statement } from 'services/backend/types';

type ValuePreviewFactoryProps = {
    value: Statement['object'];
    children: JSX.Element;
};

const ValuePreviewFactory: FC<ValuePreviewFactoryProps> = ({ value, children }) => {
    const findClass = (classId: string) => 'classes' in value && value.classes?.includes(classId);

    if (findClass(CLASSES.CSVW_TABLE)) {
        return <CSVWTable id={value.id} />;
    }

    return children;
};
export default ValuePreviewFactory;

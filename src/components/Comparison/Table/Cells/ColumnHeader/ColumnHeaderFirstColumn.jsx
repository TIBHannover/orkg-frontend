import { useSelector } from 'react-redux';

import { Properties, PropertiesInner } from '@/components/Comparison/styled';

const ColumnHeaderFirstColumn = () => {
    const transpose = useSelector((state) => state.comparison.configuration.transpose);

    return (
        <Properties>
            <PropertiesInner transpose={transpose} className="first">
                Properties
            </PropertiesInner>
        </Properties>
    );
};

export default ColumnHeaderFirstColumn;

import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import Tooltip from 'components/FloatingUI/Tooltip';
import { memo } from 'react';
import { useSelector } from 'react-redux';

const TableHeaderColumnFirst = () => {
    const isLoading = useSelector((state) => state.contributionEditor.isLoading);

    return (
        <Properties>
            <PropertiesInner $transpose={false} className="first d-flex justify-content-between align-items-start">
                Properties
                <Tooltip content="Every change you make is automatically saved">
                    <div>
                        {isLoading && (
                            <div className="rounded">
                                <FontAwesomeIcon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {!isLoading && (
                            <div className="rounded" style={{ color: 'rgb(228, 228, 228)' }}>
                                <FontAwesomeIcon icon={faCheck} /> Saved
                            </div>
                        )}
                    </div>
                </Tooltip>
            </PropertiesInner>
        </Properties>
    );
};

export default memo(TableHeaderColumnFirst);

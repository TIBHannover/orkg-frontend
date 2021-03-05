import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import { memo } from 'react';
import { useSelector } from 'react-redux';

const TableHeaderColumnFirst = () => {
    const isLoading = useSelector(state => state.contributionEditor.isLoading);

    return (
        <Properties>
            <PropertiesInner transpose={false} className="first d-flex justify-content-between align-items-start">
                Properties
                <Tippy content="Every change you make is automatically saved">
                    <div>
                        {isLoading && (
                            <div className="rounded">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {!isLoading && (
                            <div className="rounded" style={{ color: 'rgb(228, 228, 228)' }}>
                                <Icon icon={faCheck} /> Saved
                            </div>
                        )}
                    </div>
                </Tippy>
            </PropertiesInner>
        </Properties>
    );
};

export default memo(TableHeaderColumnFirst);

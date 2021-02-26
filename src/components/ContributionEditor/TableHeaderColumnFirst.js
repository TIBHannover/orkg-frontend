import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { usePrevious } from 'react-use';

const TableHeaderColumnFirst = () => {
    const isLoading = useSelector(state => state.contributionEditor.isLoading);
    const [isDone, setIsDone] = useState(false);
    const prevIsLoading = usePrevious(isLoading);

    useEffect(() => {
        if (prevIsLoading && !isLoading) {
            setIsDone(true);
            setTimeout(() => {
                setIsDone(false);
            }, 3000);
        }
    }, [isLoading, prevIsLoading]);

    return (
        <Properties>
            <PropertiesInner transpose={false} className="first d-flex justify-content-between align-items-start">
                Properties
                {isLoading && (
                    <div className="bg-darkblueDarker px-2 py-1 rounded">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
                {!isLoading && isDone && (
                    <div className="bg-success px-2 py-1 rounded">
                        <Icon icon={faCheck} /> Done
                    </div>
                )}
            </PropertiesInner>
        </Properties>
    );
};

export default memo(TableHeaderColumnFirst);

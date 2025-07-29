import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import useBreadcrumbs from '@/components/DataBrowser/hooks/useBreadcrumbs';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import Button from '@/components/Ui/Button/Button';

const BreadcrumbItem = styled.li`
    border-radius: 5px;
    background: ${(props) => props.theme.lightLighter};
    border: 1px solid ${(props) => props.theme.primary};
    font-size: 87%;
    max-width: 55px;
    cursor: pointer;
    transition: max-width 0.5s;

    &:hover {
        max-width: 100%;
        color: ${(props) => props.theme.secondaryDarker};
    }

    &:last-of-type {
        background: ${(props) => props.theme.primary};
        color: #fff;
        max-width: 100%;
        cursor: default;
    }

    &:not(:first-child) {
        margin-left: -15px;
    }
`;

const Breadcrumbs = () => {
    const { history } = useHistory();

    const { historyEntities, isLoading, handleBackClick, selectResource } = useBreadcrumbs();

    if (!history || history?.length === 0 || history.length === 1) {
        return <h3 className="flex-grow-1 mb-0 h6">Data browser</h3>;
    }

    if (isLoading) {
        return (
            <div className="flex-grow-1">
                <Skeleton width={100} />
            </div>
        );
    }

    return (
        <div className="flex-grow-1 d-flex flex-shrink-0 col-md-10">
            <Button title="Back" color="primary" size="sm" outline className="px-2 me-2" onClick={handleBackClick}>
                <FontAwesomeIcon icon={faArrowLeft} />
            </Button>
            <ul className="list-unstyled p-0 d-flex w-75 m-0">
                <BreadcrumbItem className="text-nowrap overflow-hidden d-flex px-3 py-1" onClick={() => selectResource(history[0])}>
                    <div title={historyEntities?.[0]?.label}>{historyEntities?.[0]?.label}</div>
                </BreadcrumbItem>
                {history
                    .slice(1)
                    .filter((_, index) => index % 2 === 0)
                    .map((item, index) => {
                        const propertyIndex = history.indexOf(item);
                        const propertyLabel = historyEntities?.[propertyIndex]?.label;
                        const resourceLabel = historyEntities?.[propertyIndex + 1]?.label;
                        return (
                            <BreadcrumbItem
                                className="text-nowrap overflow-hidden d-flex px-3 py-1"
                                key={historyEntities?.[propertyIndex + 1]?.id ?? index}
                                onClick={() => selectResource(historyEntities?.[propertyIndex + 1]?.id ?? '')}
                            >
                                <div title={`${propertyLabel ? `${propertyLabel} → ` : ''}${resourceLabel}`}>
                                    {propertyLabel ? (
                                        <>
                                            <i>{propertyLabel}</i> <FontAwesomeIcon icon={faArrowRight} /> {resourceLabel}
                                        </>
                                    ) : (
                                        resourceLabel
                                    )}
                                </div>
                            </BreadcrumbItem>
                        );
                    })}
            </ul>
        </div>
    );
};

export default Breadcrumbs;

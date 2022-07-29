import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLink, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { goToResourceHistory } from 'slices/statementBrowserSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { truncate } from 'lodash';
import { getResourceLink } from 'utils';
import Tippy from '@tippyjs/react';
import { Container, BackButton, BreadcrumbList, BreadcrumbItem } from './styled';

const Breadcrumbs = () => {
    const dispatch = useDispatch();
    const resourceHistory = useSelector(state => state.statementBrowser.resourceHistory);
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const openExistingResourcesInDialog = useSelector(state => state.statementBrowser.openExistingResourcesInDialog);
    const resources = useSelector(state => state.statementBrowser.resources);

    const handleOnClick = (id, historyIndex) => {
        dispatch(
            goToResourceHistory({
                id,
                historyIndex,
            }),
        );
    };

    const handleBackClick = () => {
        const historyIndex = resourceHistory.allIds.length - 2;
        const id = resourceHistory.allIds[historyIndex];

        dispatch(
            goToResourceHistory({
                id,
                historyIndex,
            }),
        );
    };

    return (
        <Container className="ms-1">
            <BackButton className="btn btn-link border-0 align-baseline" onClick={handleBackClick}>
                <Icon icon={faArrowLeft} /> <div className="d-none d-md-inline">Back</div>
            </BackButton>
            <BreadcrumbList>
                {resourceHistory.allIds.map((history, index) => {
                    const item = resourceHistory.byId[history];
                    const existingResourceId =
                        Object.keys(resources.byId).length !== 0 && selectedResource ? resources.byId[selectedResource].existingResourceId : null;
                    const _class = Object.keys(resources.byId).length !== 0 && selectedResource ? resources.byId[selectedResource]._class : null;
                    const propertyLabel = truncate(item.propertyLabel ? item.propertyLabel : '', { length: 25 });
                    const resourceLabel = truncate(item.label ? item.label : '', { length: 30 });

                    return (
                        <BreadcrumbItem
                            key={index}
                            onClick={() => (resourceHistory.allIds.length !== index + 1 ? handleOnClick(item.id, index) : undefined)}
                        >
                            <div title={`${item.propertyLabel ? `${item.propertyLabel} → ` : ''}${item.label}`}>
                                {item.propertyLabel ? (
                                    <>
                                        <i>{propertyLabel}</i> <Icon icon={faArrowRight} /> {resourceLabel}
                                    </>
                                ) : (
                                    resourceLabel
                                )}
                            </div>
                            {resourceHistory.allIds.length === index + 1 && !openExistingResourcesInDialog && existingResourceId && (
                                <Tippy content="Go to resource page">
                                    <Link target="_blank" className="ms-2 resourceLink" to={getResourceLink(_class, selectedResource)}>
                                        <Icon icon={faLink} color="#fff" />
                                    </Link>
                                </Tippy>
                            )}
                        </BreadcrumbItem>
                    );
                })}
                <div className="clearfix" />
            </BreadcrumbList>
            <div className="clearfix" />
        </Container>
    );
};

export default Breadcrumbs;

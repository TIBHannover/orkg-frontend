import { Container, BackButton, BreadcrumbList, BreadcrumbItem } from './styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLink, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import { truncate } from 'lodash';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import Tippy from '@tippy.js/react';

export default function Breadcrumbs(props) {
    const handleOnClick = (id, historyIndex) => {
        props.goToResourceHistory({
            id,
            historyIndex
        });
    };

    const handleBackClick = () => {
        const historyIndex = props.resourceHistory.allIds.length - 2;
        const id = props.resourceHistory.allIds[historyIndex];

        props.goToResourceHistory({
            id,
            historyIndex
        });
    };

    return (
        <Container>
            <BackButton className="btn btn-link border-0 align-baseline" onClick={handleBackClick}>
                <Icon icon={faArrowLeft} /> <div className="d-none d-md-inline">Back</div>
            </BackButton>
            <BreadcrumbList>
                {props.resourceHistory.allIds.map((history, index) => {
                    const item = props.resourceHistory.byId[history];
                    const existingResourceId =
                        Object.keys(props.resources.byId).length !== 0 && props.selectedResource
                            ? props.resources.byId[props.selectedResource].existingResourceId
                            : null;

                    const propertyLabel = truncate(item.propertyLabel ? item.propertyLabel : '', { length: 25 });
                    const resourceLabel = truncate(item.label ? item.label : '', { length: 30 });

                    return (
                        <BreadcrumbItem
                            key={index}
                            onClick={() => (props.resourceHistory.allIds.length !== index + 1 ? handleOnClick(item.id, index) : undefined)}
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
                            {props.resourceHistory.allIds.length === index + 1 && !props.openExistingResourcesInDialog && existingResourceId && (
                                <Tippy content="Go to resource page">
                                    <Link className="ml-2 resourceLink" to={reverse(ROUTES.RESOURCE, { id: props.selectedResource })}>
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
}

Breadcrumbs.propTypes = {
    resourceHistory: PropTypes.object.isRequired,
    goToResourceHistory: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
    openExistingResourcesInDialog: PropTypes.bool.isRequired,
    resources: PropTypes.object.isRequired
};

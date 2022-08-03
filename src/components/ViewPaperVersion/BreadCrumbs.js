import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLink, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { goToResourceHistory } from 'slices/statementBrowserSlice';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { truncate } from 'lodash';
import { getResourceLink } from 'utils';
import Tippy from '@tippyjs/react';
import { Container, BackButton, BreadcrumbList, BreadcrumbItem } from 'components/StatementBrowser/Breadcrumbs/styled';
import PropTypes from 'prop-types';

const Breadcrumbs = props => {
    const handleOnClick = (e, v) => {
        console.log('9');
    };

    return (
        <Container className="ms-1">
            <BackButton className="btn btn-link border-0 align-baseline" onClick={props.handleBackClick}>
                <Icon icon={faArrowLeft} /> <div className="d-none d-md-inline">Back</div>
            </BackButton>
            <BreadcrumbList>
                {props.resourceHistory.map((resource, index) => (
                    <BreadcrumbItem key={index} onClick={() => (props.resourceHistory.length !== index + 1 ? handleOnClick('', index) : undefined)}>
                        <div title={`${resource.label ? `${resource.label} → ` : ''}${resource.label}`}>
                            {resource.property ? (
                                <>
                                    <i>{resource.property}</i> <Icon icon={faArrowRight} /> {resource.label}
                                </>
                            ) : (
                                resource.label
                            )}
                        </div>
                    </BreadcrumbItem>
                ))}
                <div className="clearfix" />
            </BreadcrumbList>
            <div className="clearfix" />
        </Container>
    );
};

Breadcrumbs.propTypes = {
    resourceHistory: PropTypes.array,
    handleBackClick: PropTypes.func,
};

export default Breadcrumbs;

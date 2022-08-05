import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Container, BackButton, BreadcrumbList, BreadcrumbItem } from 'components/StatementBrowser/Breadcrumbs/styled';
import PropTypes from 'prop-types';

function Breadcrumbs(props) {
    return (
        <Container className="ms-1">
            <BackButton className="btn btn-link border-0 align-baseline" onClick={props.handleBackClick}>
                <Icon icon={faArrowLeft} /> <div className="d-none d-md-inline">Back</div>
            </BackButton>
            <BreadcrumbList>
                {props.resourceHistory.map((resource, index) => (
                    <BreadcrumbItem
                        key={index}
                        onClick={() => (props.resourceHistory.length !== index + 1 ? props.handleBackClick(resource.id, index) : undefined)}
                    >
                        <div title={`${resource.property ? `${resource.property} → ` : ''}${resource.label}`}>
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
}

Breadcrumbs.propTypes = {
    resourceHistory: PropTypes.array,
    handleBackClick: PropTypes.func,
};

export default Breadcrumbs;

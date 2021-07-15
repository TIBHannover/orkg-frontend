import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faFile, faChartBar, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import moment from 'moment';
import Versions from './Versions';
import Thumbnail from './Thumbnail';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { truncate } from 'lodash';

const ComparisonCardStyled = styled.div`
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const ComparisonCard = props => {
    return (
        <ComparisonCardStyled rounded={props.rounded} className="list-group-item list-group-item-action ">
            <Row>
                <Col md={9}>
                    <Link to={reverse(ROUTES.COMPARISON, { comparisonId: props.comparison.id })}>
                        {props.comparison.label ? props.comparison.label : <em>No title</em>}
                    </Link>
                    <br />
                    {props.comparison.created_at && (
                        <div>
                            <small>
                                <Icon size="sm" icon={faFile} className="mr-1" /> {props.comparison.contributions?.length} Contributions
                                <Icon size="sm" icon={faChartBar} className="ml-2 mr-1" /> {props.comparison.visualizations?.length} Visualizations
                                {(props.comparison.resources?.length > 0 || props.comparison.figures?.length > 0) && (
                                    <>
                                        <Icon size="sm" icon={faPaperclip} className="ml-2 mr-1" />{' '}
                                        {props.comparison.resources.length + props.comparison.resources.length} attachments
                                    </>
                                )}
                                <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" /> {moment(props.comparison.created_at).format('DD-MM-YYYY')}
                            </small>
                        </div>
                    )}
                    {props.comparison.description && (
                        <div>
                            <small className="text-muted">{truncate(props.comparison.description, { length: 200 })}</small>
                        </div>
                    )}
                    <div className="d-block d-md-none mt-1">
                        <RelativeBreadcrumbs researchField={props.comparison.researchField} />
                    </div>
                    {props.showHistory && props.comparison.versions && props.comparison.versions.length > 1 && (
                        <Versions versions={props.comparison.versions} id={props.comparison.id} />
                    )}
                </Col>

                <div className="col-md-3 text-right d-flex align-items-end flex-column">
                    <div className="flex-grow-1 mb-1">
                        <div className="d-none d-md-flex align-items-end justify-content-end">
                            <RelativeBreadcrumbs researchField={props.comparison.researchField} />
                        </div>
                        <div className="d-none d-md-flex align-items-end justify-content-end mt-1">
                            <Thumbnail figures={props.comparison.figures} visualizations={props.comparison.visualizations} id={props.comparison.id} />
                        </div>
                    </div>
                    <UserAvatar userId={props.comparison.created_by} />
                </div>
            </Row>
        </ComparisonCardStyled>
    );
};

ComparisonCard.propTypes = {
    comparison: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        description: PropTypes.string,
        contributions: PropTypes.array,
        created_at: PropTypes.string,
        resources: PropTypes.array,
        figures: PropTypes.array,
        researchField: PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string
        }),
        created_by: PropTypes.string,
        versions: PropTypes.array,
        visualizations: PropTypes.array
    }).isRequired,
    rounded: PropTypes.string,
    showHistory: PropTypes.bool
};

ComparisonCard.defaultProps = {
    showHistory: true
};
export default ComparisonCard;

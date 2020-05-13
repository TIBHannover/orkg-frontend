import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faDiceD6 } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import moment from 'moment';

const PaperCardStyled = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

class ComparisonCard extends Component {
    render() {
        return (
            <PaperCardStyled className={'list-group-item list-group-item-action '}>
                <Row>
                    <Col sm={12}>
                        <Link to={reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparison.id })}>
                            {this.props.comparison.label ? this.props.comparison.label : <em>No title</em>}
                        </Link>
                        <br />
                        {this.props.comparison.created_at && (
                            <div>
                                <small>
                                    <Icon size={'sm'} icon={faDiceD6} className="mr-1" /> {this.props.comparison.nbContributions} Contributions
                                    <Icon size={'sm'} icon={faCalendar} className="ml-2 mr-1" /> Published :{' '}
                                    {moment(this.props.comparison.created_at).format('DD-MM-YYYY')}
                                </small>
                            </div>
                        )}
                        {this.props.comparison.description && (
                            <div>
                                <small>Description : {this.props.comparison.description}</small>
                            </div>
                        )}
                        {this.props.comparison.reference && (
                            <div>
                                <small>Reference : {this.props.comparison.reference}</small>
                            </div>
                        )}
                    </Col>
                </Row>
            </PaperCardStyled>
        );
    }
}

ComparisonCard.propTypes = {
    comparison: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        description: PropTypes.string,
        nbContributions: PropTypes.number,
        url: PropTypes.string,
        reference: PropTypes.string,
        created_at: PropTypes.string
    }).isRequired
};

export default ComparisonCard;

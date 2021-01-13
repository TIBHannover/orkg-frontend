import { Component } from 'react';
import { Card, CardTitle, CardText, Row, Col, CardBody, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';

const Comparison = styled(Card)`
    border-width: 1px !important; //TODO: remove once style of 1px border is applied globally
    cursor: pointer;
    background: #f7f7f7 !important;
    color: ${props => props.theme.bodyColor};
    &:hover {
        text-decoration: none !important;
    }
`;

const ComparisonBody = styled(CardBody)`
    padding: 10px !important;
`;

const ImageCol = styled(Col)`
    font-size: 50px;
    color: #80869b;
    border-right: 1px solid #d9d9d9;
`;

const ComparisonTitle = styled(CardTitle)`
    //color: #e86161;
    margin-bottom: 5px;
    font-weight: 600;
`;

const ComparisonText = styled(CardText)`
    font-size: 0.9rem;
    margin-bottom: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
`;

class FeaturedComparisonsItem extends Component {
    render() {
        const icon = require('@fortawesome/free-solid-svg-icons')[this.props.icon];
        const contributionString = queryString.parse(this.props.link).contributions;
        const contributionsLength = typeof contributionString === 'string' ? contributionString.split(',').length : 0;

        return (
            <Col sm="6" className="mb-4">
                <Link style={{ textDecoration: 'none' }} to={reverse(ROUTES.COMPARISON, { comparisonId: this.props.id })}>
                    <Comparison>
                        <ComparisonBody>
                            <Row>
                                <ImageCol sm="3" className="d-flex justify-content-center align-items-center">
                                    <Icon icon={icon} />
                                </ImageCol>
                                <Col sm="9">
                                    <ComparisonTitle tag="h5">{this.props.title}</ComparisonTitle>
                                    <ComparisonText>{this.props.description}</ComparisonText>
                                    <Badge color="lightblue">{contributionsLength} contributions</Badge>
                                </Col>
                            </Row>
                        </ComparisonBody>
                    </Comparison>
                </Link>
            </Col>
        );
    }
}

FeaturedComparisonsItem.propTypes = {
    history: PropTypes.object.isRequired,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
};

export default withRouter(FeaturedComparisonsItem);

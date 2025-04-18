import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { Badge, Card, CardBody, CardText, CardTitle, Col, Row } from 'reactstrap';
import styled from 'styled-components';

import ROUTES from '@/constants/routes';

const Comparison = styled(Card)`
    border-width: 1px !important; //TODO: remove once style of 1px border is applied globally
    cursor: pointer;
    background: #f7f7f7 !important;
    color: ${(props) => props.theme.bodyColor};
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

        const contributionsLength = this.props.contributions ? this.props.contributions.length : 0;

        return (
            <Col sm="6" className="mb-4">
                <Link style={{ textDecoration: 'none' }} href={reverse(ROUTES.COMPARISON, { comparisonId: this.props.id })}>
                    <Comparison>
                        <ComparisonBody>
                            <Row>
                                <ImageCol sm="3" className="d-flex justify-content-center align-items-center">
                                    <FontAwesomeIcon icon={icon} />
                                </ImageCol>
                                <Col sm="9">
                                    <ComparisonTitle tag="h5">{this.props.title}</ComparisonTitle>
                                    <ComparisonText>{this.props.description}</ComparisonText>
                                    <Badge color="light">{contributionsLength} contributions</Badge>
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
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    contributions: PropTypes.array.isRequired,
};

export default FeaturedComparisonsItem;

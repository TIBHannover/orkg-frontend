import React, { Component } from 'react';
import { Card, CardTitle, CardText, Row, Col, CardBody, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import queryString from 'query-string';

const Comparison = styled(Card)`
    border-width: 1px !important; //TODO: remove once style of 1px border is applied globally
    cursor: pointer;
    background: #f7f7f7 !important;
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
`;

class FeaturedComparisonsItem extends Component {
    state = {
        redirect: false
    };

    handleClick = () => {
        this.props.history.push(`/comparison/${this.props.link}`);
    };

    render() {
        const icon = require('@fortawesome/free-solid-svg-icons')[this.props.icon];
        const contributionString = queryString.parse(this.props.link).contributions;
        const contributionsLength = typeof contributionString === 'string' ? contributionString.split(',').length : 0;

        return (
            <Col sm="6">
                <Comparison onClick={this.handleClick}>
                    <ComparisonBody>
                        <Row>
                            <ImageCol sm="3" className="d-flex justify-content-center align-items-center">
                                <Icon icon={icon} />
                            </ImageCol>
                            <Col sm="9">
                                <ComparisonTitle tag="h5">{this.props.title}</ComparisonTitle>
                                <ComparisonText>{this.props.description}</ComparisonText>
                                <Badge color="lightblue">{contributionsLength} papers</Badge>
                            </Col>
                        </Row>
                    </ComparisonBody>
                </Comparison>
            </Col>
        );
    }
}

FeaturedComparisonsItem.propTypes = {
    history: PropTypes.object.isRequired,
    icon: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
};

export default withRouter(FeaturedComparisonsItem);

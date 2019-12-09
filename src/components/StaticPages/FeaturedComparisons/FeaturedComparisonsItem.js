import React, { Component } from 'react';
import { Container, Alert, Card, CardImg, CardTitle, CardText, Row, Col, CardBody, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChartArea, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { Redirect } from 'react-router-dom';
import { withRouter } from 'react-router-dom';

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
        this.props.history.push(this.props.link);
    };

    render() {
        return (
            <Col sm="6">
                <Comparison onClick={this.handleClick}>
                    <ComparisonBody>
                        <Row>
                            <ImageCol sm="3" className="d-flex justify-content-center align-items-center">
                                <Icon icon={this.props.icon} />
                            </ImageCol>
                            <Col sm="9">
                                <ComparisonTitle tag="h5">{this.props.title}</ComparisonTitle>
                                <ComparisonText>{this.props.description}</ComparisonText>
                                <Badge color="lightblue">{this.props.paperAmount} papers</Badge>
                            </Col>
                        </Row>
                    </ComparisonBody>
                </Comparison>
            </Col>
        );
    }
}

export default withRouter(FeaturedComparisonsItem);

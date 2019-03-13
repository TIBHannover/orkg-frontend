import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faStar, faPlus, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { getStatementsBySubject } from '../../network';

const Card = styled.div`
    cursor: pointer;
    background: #E86161;
    color: #fff;
    border: 0;
    border-radius:12px;
    min-height: 70px;
    transition:opacity 0.2s;

    &:hover {
        opacity: 0.8
    }
`;

const CardTitle = styled.h5`
    color: #fff;
    font-size: 16px;
    padding:0 5px
`;

const BreadcrumbLink = styled.span`
    cursor:pointer;
    margin-right:5px;

    &:hover {
        text-decoration:underline;
    }
`;

class ResearchFieldCards extends Component {
    state = {
        researchFields: [],
        breadcrumb: [],
    }

    componentDidMount() {
        this.getFields('R11', 'Main'); 
    }

    getFields(fieldId, label, addBreadcrumb = true) {
        getStatementsBySubject(fieldId).then((res) => {
            let researchFields = [];
            res.forEach((elm) => {
                researchFields.push({
                    'label': elm.object.label,
                    'id': elm.object.id,
                });
            });

            this.setState({
                researchFields
            });

            if (addBreadcrumb) {
                let breadcrumb = this.state.breadcrumb;

                breadcrumb.push({
                    'label': label,
                    'id': fieldId,
                });

                this.setState({
                    breadcrumb: breadcrumb
                });
            }
        });
    }

    handleClickBreadcrumb(fieldId, label) {
        let activeIndex = this.state.breadcrumb.findIndex(breadcrumb => breadcrumb.id === fieldId);
        let breadcrumb = this.state.breadcrumb.slice(0, activeIndex + 1); //remove the items after the clicked link

        this.setState({
            breadcrumb
        });

        this.getFields(fieldId, label, false);
    }

    render() {
        return (
            <div className="mt-5">
                {this.state.breadcrumb.map((field) => 
                    <BreadcrumbLink key={field.id} onClick={() => this.handleClickBreadcrumb(field.id, field.label)}>{field.label} <FontAwesomeIcon icon={faAngleDoubleRight} /></BreadcrumbLink>    
                )}

                <hr className="mt-3 mb-5" />
                <div id="research-field-cards" className="card-columns mt-2">
                    {this.state.researchFields.map((field) => 
                        <Card className="card" role="button" key={field.id} onClick={() => this.getFields(field.id, field.label)}>
                        <div className="card-body p-0 pt-2">
                            <CardTitle className="card-title m-0 text-center">{field.label}</CardTitle>
                        </div>
                    </Card>
                    )}
                </div>
            </div>
        );
    }
}

export default ResearchFieldCards;
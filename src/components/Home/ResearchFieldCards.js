import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import { getStatementsBySubject } from '../../network';

/* Bootstrap card column is not working correctly working with vertical alignment,
thus used custom styling here */

const Card = styled.div`
    cursor: pointer;
    background: #E86161!important;
    color: #fff!important;
    border: 0!important;
    border-radius:12px!important;
    min-height: 75px;
    flex: 0 0 calc(33% - 20px)!important;
    margin:10px;
    transition:opacity 0.2s;

    &:hover {
        opacity: 0.8
    }
`;

const CardTitle = styled.h5`
    color: #fff;
    font-size: 16px;
    padding:0 5px;
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
        error: '',
    }

    componentDidMount() {
        this.getFields(process.env.REACT_APP_RESEARCH_FIELD_MAIN, 'Main');
    }

    getFields(fieldId, label, addBreadcrumb = true) {
        try {
            getStatementsBySubject(fieldId).then((res) => {
                let researchFields = [];
                res.forEach((elm) => {
                    researchFields.push({
                        'label': elm.object.label,
                        'id': elm.object.id,
                    });
                });

                this.setState({
                    researchFields,
                    error: '',
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
            }).catch((e) => {
                this.setState({
                    error: e.message,
                });
            });
        } catch (e) {
            this.setState({
                error: e.message,
            });
        }
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
        if (this.state.error) {
            return (
                <div className="text-center mt-5 text-danger">{this.state.error}</div>
            );
        }

        return (
            <div className="mt-5">
                {this.state.breadcrumb.map((field) =>
                    <BreadcrumbLink key={field.id} onClick={() => this.handleClickBreadcrumb(field.id, field.label)}>{field.label} <FontAwesomeIcon icon={faAngleDoubleRight} /></BreadcrumbLink>
                )}

                <hr className="mt-3 mb-5" />
                <div id="research-field-cards" className="mt-2 justify-content-center d-flex flex-wrap">
                    {this.state.researchFields.map((field) => (
                        <Card className="card card-body p-0 justify-content-center" role="button" key={field.id} onClick={() => this.getFields(field.id, field.label)}>
                            <CardTitle className="card-title m-0 text-center">{field.label}</CardTitle>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
}

export default ResearchFieldCards;
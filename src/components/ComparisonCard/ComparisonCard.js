import React, { Component } from 'react';
import { Row, Col, Collapse } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faFile } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getStatementsBySubjects } from 'services/backend/statements';
import { PREDICATES } from 'constants/graphSettings';
import { getStatementsBySubject } from 'services/backend/statements';

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
    cursor: pointer;
    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const SlideItem = styled.div`
    overflow: hidden;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    padding-left: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
`;

const SlideImg = styled.img`
    height: 50px;
    max-width: 100%;
    object-fit: contain;
`;

const Content = styled.div`
    overflow: hidden;
    display: flex;
    margin-top: 20px;
`;

class ComparisonCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            relatedFigures: [],
            openBox: false,
            relatedResources: []
        };
    }

    componentDidMount() {
        this.loadFigures();
        this.loadResources();
    }

    loadFigures = () => {
        if (this.props.comparison.figures && this.props.comparison.figures.length > 0) {
            console.log(this.props.comparison.figures);

            getStatementsBySubjects({
                ids: this.props.comparison.figures.map(resource => resource.id)
            })
                .then(figuresStatements => {
                    const _figures = figuresStatements.map(figureStatements => {
                        const imageStatement = figureStatements.statements.find(statement => statement.predicate.id === PREDICATES.IMAGE);
                        const alt = figureStatements.statements.length ? figureStatements.statements[0]?.subject?.label : null;
                        return {
                            src: imageStatement ? imageStatement.object.label : '',
                            figureId: figureStatements.id,
                            alt
                        };
                    });
                    this.setState({ relatedFigures: _figures });
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

    loadResources = async () => {
        if (this.props.comparison.resources && this.props.comparison.resources.length > 0) {
            const relatedResources = [];

            for (const resource of this.props.comparison.resources) {
                if (resource._class === 'literal') {
                    relatedResources.push({
                        url: resource.label
                    });
                } else {
                    await getStatementsBySubject({ id: resource.id }).then(statements => {
                        const imageStatement = statements.find(statement => statement.predicate.id === PREDICATES.IMAGE);
                        const urlStatement = statements.find(statement => statement.predicate.id === PREDICATES.URL);
                        const descriptionStatement = statements.find(statement => statement.predicate.id === PREDICATES.DESCRIPTION);

                        relatedResources.push({
                            url: urlStatement ? urlStatement.object.label : '',
                            image: imageStatement ? imageStatement.object.label : '',
                            title: resource.label,
                            description: descriptionStatement ? descriptionStatement.object.label : '',
                            id: statements[0].subject.id
                        });
                    });
                }
            }

            this.setState({ relatedResources: relatedResources });
        }
    };

    handleChange = () => {
        this.setState({ openBox: !this.state.openBox });
    };

    render() {
        return (
            <PaperCardStyled
                {...(((this.state.relatedFigures && this.state.relatedFigures.length > 0) ||
                    (this.state.relatedResources && this.state.relatedResources.length > 0)) && { onClick: this.handleChange })}
                rounded={this.props.rounded}
                className="list-group-item list-group-item-action "
            >
                <Row>
                    <Col md={9} aria-expanded={this.state.openBox}>
                        <Link to={reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparison.id })}>
                            {this.props.comparison.label ? this.props.comparison.label : <em>No title</em>}
                        </Link>
                        <br />
                        {this.props.comparison.created_at && (
                            <div>
                                <small>
                                    <Icon size="sm" icon={faFile} className="mr-1" /> {this.props.comparison.nbContributions} Contributions
                                    <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />{' '}
                                    {moment(this.props.comparison.created_at).format('DD-MM-YYYY')}
                                </small>
                            </div>
                        )}
                        {this.props.comparison.description && (
                            <div>
                                <small className="text-muted">{this.props.comparison.description}</small>
                            </div>
                        )}
                    </Col>

                    <Col md={3} style={{ marginTop: '8px' }}>
                        {!this.state.openBox &&
                            this.state.relatedFigures.slice(0, 2).map(url => (
                                <SlideItem key={url.figureId} style={{ float: 'right', padding: '3px' }}>
                                    <div className="logoContainer">
                                        <SlideImg src={url.src} alt={url.alt} />
                                    </div>
                                </SlideItem>
                            ))}
                    </Col>
                </Row>
                <Collapse isOpen={this.state.openBox}>
                    <hr />
                    <Content>
                        {this.state.relatedFigures.length > 0 && (
                            <>
                                <small style={{ color: '#e86161' }}>Figures</small>
                                <Content style={{ marginLeft: '-45px' }}>
                                    {this.state.relatedFigures.map(url => (
                                        <SlideItem key={url.figureId}>
                                            <Link to={reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparison.id }) + '#' + url.figureId}>
                                                <div className="logoContainer" style={{ padding: '5px' }}>
                                                    <SlideImg src={url.src} alt={url.alt} style={{ height: '80px' }} />
                                                </div>
                                            </Link>
                                        </SlideItem>
                                    ))}
                                </Content>
                            </>
                        )}
                        {this.state.relatedResources.length > 0 && (
                            <>
                                <small style={{ color: '#e86161', marginLeft: '12px' }}>Resources</small>
                                <Content style={{ marginLeft: '-70px' }}>
                                    {this.state.relatedResources.map(resource => (
                                        <SlideItem key={resource.id}>
                                            <Link to={reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparison.id }) + '#' + resource.id}>
                                                <div className="logoContainer" style={{ padding: '5px' }}>
                                                    <SlideImg src={resource.image} alt={resource.alt} style={{ height: '80px' }} />
                                                </div>
                                            </Link>
                                        </SlideItem>
                                    ))}
                                </Content>
                            </>
                        )}
                    </Content>
                </Collapse>
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
        created_at: PropTypes.string,
        resources: PropTypes.array,
        figures: PropTypes.array
    }).isRequired,
    rounded: PropTypes.string
};

export default ComparisonCard;

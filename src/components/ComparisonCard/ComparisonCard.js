import { Component } from 'react';
import { Row, Col, Collapse } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faFile } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import moment from 'moment';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getRelatedFiguresData, getRelatedResourcesData } from 'utils';

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

    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const ResourceItem = styled.div`
    overflow: hidden;
    border: 1px solid #d8d8d8;
    border-radius: 5px;
    padding-left: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
`;

const Img = styled.img`
    height: 50px;
    max-width: 100%;
    object-fit: contain;
`;

const RelatedResourceWrapper = styled.div`
    overflow: hidden;
    display: flex;
    margin-top: 0px;
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
        if (this.props.loadResources) {
            this.loadFigures();
            this.loadResources();
        }
    }

    loadFigures = () => {
        if (this.props.comparison.figures && this.props.comparison.figures.length > 0) {
            getStatementsBySubjects({
                ids: this.props.comparison.figures.map(resource => resource.id)
            })
                .then(figuresStatements => {
                    this.setState({ relatedFigures: getRelatedFiguresData(figuresStatements) });
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };

    loadResources = async () => {
        if (this.props.comparison.resources && this.props.comparison.resources.length > 0) {
            /*
            let relatedResources = this.props.comparison.resources
                .filter(r => r._class === 'literal')
                .map(resource => ({
                    url: resource.label
                }));
             */
            getStatementsBySubjects({
                // No support for related resources in the format  Resource -[Url]-> "Literal url"
                ids: this.props.comparison.resources.filter(r => r._class !== 'literal').map(resource => resource.id)
            }).then(resourcesStatements => {
                this.setState({ relatedResources: getRelatedResourcesData(resourcesStatements) });
            });
        }
    };

    handleChange = () => {
        this.setState({ openBox: !this.state.openBox });
    };

    render() {
        return (
            <PaperCardStyled
                {...(((this.state.relatedFigures && this.state.relatedFigures.length > 0) ||
                    (this.state.relatedResources && this.state.relatedResources.length > 0)) && {
                    onClick: this.handleChange,
                    ...{ style: { cursor: 'pointer' } }
                })}
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

                    <div className="col-3 text-right d-flex align-items-end" style={{ flexDirection: 'column' }}>
                        <div style={{ flex: 1 }}>
                            <RelativeBreadcrumbs researchField={this.props.comparison.researchField} />
                            <div style={{ marginTop: '8px' }}>
                                {!this.state.openBox &&
                                    this.state.relatedFigures.slice(0, 2).map(url => (
                                        <ResourceItem key={url.figureId} style={{ float: 'right', padding: '3px' }}>
                                            <div>
                                                <Img src={url.src} alt={url.alt} />
                                            </div>
                                        </ResourceItem>
                                    ))}
                            </div>
                        </div>
                        <UserAvatar userId={this.props.comparison.created_by} />
                    </div>
                </Row>
                <Collapse isOpen={this.state.openBox}>
                    <hr />
                    <RelatedResourceWrapper>
                        {this.state.relatedFigures.length > 0 && (
                            <div style={{ color: '#e86161' }}>
                                Figures
                                <div style={{ display: 'flex' }}>
                                    {this.state.relatedFigures.map(url => (
                                        <ResourceItem key={url.figureId}>
                                            <Link to={reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparison.id }) + '#' + url.figureId}>
                                                <div style={{ padding: '5px' }}>
                                                    <Img src={url.src} alt={url.alt} style={{ height: '80px' }} />
                                                </div>
                                            </Link>
                                        </ResourceItem>
                                    ))}
                                </div>
                            </div>
                        )}
                        {this.state.relatedResources.length > 0 && (
                            <div style={{ color: '#e86161' }}>
                                Resources
                                <div style={{ display: 'flex' }}>
                                    {this.state.relatedResources.map(resource => (
                                        <ResourceItem key={resource.id}>
                                            <Link to={reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparison.id }) + '#' + resource.id}>
                                                <div style={{ padding: '5px' }}>
                                                    <Img src={resource.image} alt={resource.title} style={{ height: '80px' }} />
                                                </div>
                                            </Link>
                                        </ResourceItem>
                                    ))}
                                </div>
                            </div>
                        )}
                    </RelatedResourceWrapper>
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
        figures: PropTypes.array,
        researchField: PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string
        }),
        created_by: PropTypes.string
    }).isRequired,
    rounded: PropTypes.string,
    loadResources: PropTypes.bool
};

export default ComparisonCard;

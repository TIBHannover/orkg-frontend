import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withCookies } from 'react-cookie';
import { compose } from 'redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import ROUTES from '../../constants/routes.js';
import AddToComparison from './../ViewPaper/AddToComparison';
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

class PaperCard extends Component {
    render() {
        return (
            <PaperCardStyled
                className={
                    'list-group-item list-group-item-action ' +
                    (this.props.contribution && this.props.comparison.allIds.includes(this.props.contribution.id) ? 'selected' : '')
                }
            >
                <Row>
                    <Col sm={this.props.contribution ? 9 : 12}>
                        {this.props.contribution && (
                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.props.paper.id, contributionId: this.props.contribution.id })}>
                                {this.props.paper.title ? this.props.paper.title : <em>No title</em>}
                            </Link>
                        )}
                        {!this.props.contribution && (
                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.props.paper.id })}>
                                {this.props.paper.title ? this.props.paper.title : <em>No title</em>}
                            </Link>
                        )}
                        <br />

                        <small>
                            {this.props.paper.authorNames.length > 0 && (
                                <>
                                    <Icon size={'sm'} icon={faUser} /> {this.props.paper.authorNames.map(a => a.label).join(', ')} -
                                </>
                            )}
                            <i>
                                {this.props.paper.publicationMonth &&
                                    this.props.paper.publicationMonth.length > 0 &&
                                    moment(this.props.paper.publicationMonth, 'M').format('MMMM')}{' '}
                                {this.props.paper.publicationYear}
                            </i>
                        </small>
                        {this.props.contribution && this.props.contribution.title !== 'Contribution 1' && (
                            <small> - {this.props.contribution.title}</small>
                        )}
                    </Col>
                    {this.props.contribution && (
                        <Col sm="3">
                            <div className="options">
                                <AddToComparison
                                    contributionId={this.props.contribution.id}
                                    paperId={this.props.paper.id}
                                    paperTitle={this.props.paper.title}
                                    contributionTitle={this.props.contribution.title}
                                />
                            </div>
                        </Col>
                    )}
                </Row>
            </PaperCardStyled>
        );
    }
}

PaperCard.propTypes = {
    paper: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        authorNames: PropTypes.array,
        publicationMonth: PropTypes.string,
        publicationYear: PropTypes.string
    }).isRequired,
    contribution: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string
    }),
    comparison: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    comparison: state.viewPaper.comparison
});

export default compose(
    connect(mapStateToProps),
    withCookies
)(PaperCard);

import React, { Component } from 'react'
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
import moment from 'moment'


const PaperCardStyled = styled.div`
    & .options{
      display:none;
    }

    &.selected{
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options, &.selected .options{
        display:block;
    }
`;


class PaperCard extends Component {
    render() {
        return (
            <PaperCardStyled className={'list-group-item list-group-item-action ' + (this.props.comparison.allIds.includes(this.props.contribution.subject.id) ? 'selected' : '')}>
                <Row>
                    <Col sm="9">
                        <Link to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: this.props.contribution.papers[0].subject.id, contributionId: this.props.contribution.subject.id })}>
                            {this.props.contribution.papers[0].subject.label}
                        </Link>
                        <br />
                        <small>
                            <Icon size={'sm'} icon={faUser} /> {this.props.contribution.papers[0].data.authorNames.join(', ')} -
                            <i>
                                {` ${moment(this.props.contribution.papers[0].data.publicationMonth, 'M').format('MMMM')} ${this.props.contribution.papers[0].data.publicationYear} `}
                            </i>
                        </small>
                    </Col>
                    <Col sm="3">
                        <div className="options" >
                            <AddToComparison
                                contributionId={this.props.contribution.subject.id}
                                paperId={this.props.contribution.papers[0].subject.id}
                                paperTitle={this.props.contribution.papers[0].subject.label}
                                contributionTitle={this.props.contribution.subject.label}
                            />
                        </div>
                    </Col>
                </Row>
            </PaperCardStyled>
        )
    }
}

PaperCard.propTypes = {
    contribution: PropTypes.object.isRequired,
    comparison: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    comparison: state.viewPaper.comparison,
});

export default compose(
    connect(
        mapStateToProps
    ),
    withCookies
)(PaperCard);

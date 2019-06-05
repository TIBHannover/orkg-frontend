import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getStatementsBySubject, getResource } from '../../network';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars } from '@fortawesome/free-solid-svg-icons';
import Contributions from './Contributions';
import { Link } from 'react-router-dom';
import { months } from '../../utils';
import PropTypes from 'prop-types';

class ViewPaper extends Component {
    state = {
        title: '',
        authorNames: [],
        contributions: [],
    }

    componentDidMount = async () => {
        const resourceId = this.props.match.params.resourceId;
        let paperResource = await getResource(resourceId);
        let paperStatements = await getStatementsBySubject(resourceId);

        // check if type is paper
        let hasTypePaper = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_IS_A && statement.object.id === process.env.REACT_APP_RESOURCE_TYPES_PAPER);

        if (hasTypePaper.length === 0) {
            throw new Error('The requested resource is not of type "paper"');
        }

        // research field
        let researchField = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_RESEARCH_FIELD);

        if (researchField.length > 0) {
            researchField = researchField[0]
        }

        // publication year
        let publicationYear = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR);

        if (publicationYear.length > 0) {
            publicationYear = publicationYear[0].object.label
        }

        // publication month
        let publicationMonth = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH);

        if (publicationMonth.length > 0) {
            publicationMonth = publicationMonth[0].object.label
        }

        // authors
        let authors = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR);

        let authorNamesArray = [];

        if (authors.length > 0) {
            for (let author of authors) {
                let authorName = author.object.label;
                authorNamesArray.push(authorName);
            }
        }

        // contributions
        let contributions = paperStatements.filter((statement) => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION);

        let contributionArray = [];

        if (contributions.length > 0) {
            for (let contribution of contributions) {
                contributionArray.push(contribution.object.id);
            }
        }

        this.setState({
            title: paperResource.label,
            publicationYear,
            publicationMonth,
            researchField,
            authorNames: authorNamesArray.reverse(), // statements are ordered desc, so first author is last => thus reverse
            contributions: contributionArray.sort(), // sort contributions ascending, so contribution 1, is actually the first one
        });
    }

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">View paper</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">
                    <h2 className="h4 mt-4 mb-3">{this.state.title}</h2>

                    {/* TODO: change links of badges  */}
                    <span className="badge badge-lightblue mr-2">
                        <Icon icon={faCalendar} className="text-primary" /> {months[this.state.publicationMonth]} {this.state.publicationYear}
                    </span>
                    {this.state.researchField && (<Link to={`${process.env.PUBLIC_URL}/field/${encodeURIComponent(this.state.researchField.object.id)}`}>
                        <span className="badge badge-lightblue mr-2">
                            <Icon icon={faBars} className="text-primary" /> {this.state.researchField.object.label}
                        </span>
                    </Link>)}
                    {this.state.authorNames.map((author, index) => (
                        <span className="badge badge-lightblue mr-2" key={index}>
                            <Icon icon={faUser} className="text-primary" /> {author}
                        </span>
                    ))}

                    <hr className="mt-5 mb-5" />

                    <Contributions contributions={this.state.contributions} paperId={this.props.match.params.resourceId} />
                </Container>
            </div>
        );
    }
}

ViewPaper.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            resourceId: PropTypes.string,
        }).isRequired,
    }).isRequired,
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
});

const mapDispatchToProps = dispatch => ({

});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewPaper);
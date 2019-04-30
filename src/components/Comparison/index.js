import React, { Component } from 'react';
import { Container, Button, Table } from 'reactstrap';
import { getStatementsBySubject, getResource } from '../../network';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// There is a lot is styling needed for this table, this it is using a column structure,
// instead of the default HTML row structure
const Properties = styled.td`
    padding-right:10px;
    padding:0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
    width:250px;
`;

const PropertiesInner = styled.div`
    background: #80869B;
    height:100%;
    color:#fff;
    padding:10px;
    border-bottom:2px solid #8B91A5!important;

    &.first {
        border-radius:11px 11px 0 0;
    }

    &.last {
        border-radius:0 0 11px 11px;
    }
`;

const Item = styled.td`
    padding-right:10px;
    padding: 0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
`;

const ItemInner = styled.div`
    padding:10px 5px;
    border-left:2px solid #CFCBCB;
    border-right:2px solid #CFCBCB;
    border-bottom:2px solid #EDEBEB;
    text-align:center;
    height:100%;
    
    &.last {
        border-bottom:2px solid #CFCBCB;
        border-radius:0 0 11px 11px;
    }
`;

const ItemHeader = styled.td`
    padding-right:10px;
    min-height:50px;
    padding: 0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
    width:250px;
`;

const ItemHeaderInner = styled.div`
    padding:5px 10px;
    background:#E86161;
    border-radius:11px 11px 0 0;
    color:#fff;
    height:100%;
`;

const Contribution = styled.div`
    color:#FFA5A5;
    font-size:85%;
`;

class Comparison extends Component {
    state = {
        title: '',
        authorNames: [],
        contributions: [],
    }

    componentDidMount = async () => {
        const resourceId = this.props.match.params.paperId;
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
            researchField = researchField[0].object.label
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
            authorNames: authorNamesArray,
            contributions: contributionArray.sort(), // sort contributions ascending, so contribution 1, is actually the first one
        });
    }

    render() {
        return (
            <div>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Contribution comparison</h1>
                </Container>
                <Container className="box pt-4 pb-4 pl-5 pr-5 clearfix ">
                    <h2 className="h4 mt-4 mb-3 float-left">Compare: <br /><span className="h6">{this.state.title}</span></h2>

                    <Button color="darkblue" className="float-right mb-4 mt-4 " size="sm">Add to comparison</Button>
                    <div style={{overflowX:'auto', float: 'left', width:'100%'}}>
                    <Table className="mb-0" style={{borderCollapse: 'collapse', tableLayout: 'fixed', height: 'max-content', width:'100%'}}>
                        <tbody className="table-borderless">
                            <tr className="table-borderless">
                                <Properties><PropertiesInner className="first">Properties</PropertiesInner></Properties>
                                <ItemHeader><ItemHeaderInner>Algorithm and hardware for a merge sort using multiple processors<br /><Contribution>Contribution #2</Contribution></ItemHeaderInner></ItemHeader>
                                <ItemHeader><ItemHeaderInner>A variant of heapsort with almost optimal number of comparisons<br /><Contribution>Contribution #1</Contribution></ItemHeaderInner></ItemHeader>
                                <ItemHeader><ItemHeaderInner>Bubble sort: an archaeologic alalgorithmic analysis<br /><Contribution>Contribution #1</Contribution></ItemHeaderInner></ItemHeader>
                            </tr>
                            <tr>
                                <Properties><PropertiesInner>Algorithm</PropertiesInner></Properties>
                                <Item><ItemInner>Merge sort</ItemInner></Item>
                                <Item><ItemInner>Heap sort</ItemInner></Item>
                                <Item><ItemInner>Bubble sort</ItemInner></Item>
                            </tr>
                            <tr>
                                <Properties><PropertiesInner>Problem</PropertiesInner></Properties>
                                <Item><ItemInner>Efficient sorting</ItemInner></Item>
                                <Item><ItemInner>Efficient sorting</ItemInner></Item>
                                <Item><ItemInner>Sorting</ItemInner></Item>
                            </tr>
                            <tr>
                                <Properties><PropertiesInner>Programming language</PropertiesInner></Properties>
                                <Item><ItemInner>C++</ItemInner></Item>
                                <Item><ItemInner><em>Empty</em></ItemInner></Item>
                                <Item><ItemInner>Python</ItemInner></Item>
                            </tr>
                            <tr>
                                <Properties><PropertiesInner>Stable</PropertiesInner></Properties>
                                <Item><ItemInner>Y</ItemInner></Item>
                                <Item><ItemInner>N</ItemInner></Item>
                                <Item><ItemInner>N</ItemInner></Item>
                            </tr>
                            <tr>
                                <Properties><PropertiesInner>Best complexity</PropertiesInner></Properties>
                                <Item><ItemInner>n log n</ItemInner></Item>
                                <Item><ItemInner>n</ItemInner></Item>
                                <Item><ItemInner>n</ItemInner></Item>
                            </tr>
                            <tr>
                                <Properties><PropertiesInner className="last">Worst complexity</PropertiesInner></Properties>
                                <Item><ItemInner className="last">n log n</ItemInner></Item>
                                <Item><ItemInner className="last">n log n</ItemInner></Item>
                                <Item><ItemInner className="last">n log n</ItemInner></Item>
                            </tr>
                        </tbody>
                    </Table>
                    </div>
                </Container>
            </div>
        );
    }
}

Comparison.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            paperId: PropTypes.string,
            comparisonId: PropTypes.string,
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
)(Comparison);
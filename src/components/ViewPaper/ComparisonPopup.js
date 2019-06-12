import React, { Component } from 'react';
import { Navbar, Container, Button, Badge } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { compose } from 'redux';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';

const ComparisonBoxButton = styled(Button)`
    border-radius: 11px 11px 0 0 !important;
    padding: 7px 20px !important;
    font-size:95% !important;
    float: right;
    box-shadow: 0px -2px 8px 0px rgba(0,0,0,0.13);
`;

const ComparisonBox = styled.div`
    background: #E86161;
    border-radius:11px 11px 0 0;
    width:340px;
    min-height:390px;
    box-shadow: 0px -1px 8px 0px rgba(0,0,0,0.13);
    position:relative;
`;

const Header = styled.div`
    cursor:pointer;
    color:#fff;
    padding:9px 20px 9px 15px;
    border-bottom:2px solid #EF8282;
`;

const List = styled.ul`
    list-style:none;
    color:#fff;
    padding:0;
    height:300px;
    overflow-y:auto;
`;

const ContributionItem = styled.li`
    cursor:pointer;
    border-bottom:2px solid #EF8282;
    padding:8px 15px;
`;

const Title = styled.div`
    color:#fff;
    font-size:90%;
`;

const Number = styled.div`
    font-size:90%;
    opacity:0.5;
`;

const StartComparison = styled(Button)`
    bottom:0;
    font-size:95%!important;
`;

class ComparisonPopup extends Component {

    constructor(props) {
        super(props);

        const { cookies } = this.props;

        this.state = {
            showComparisonBox: false,
            //toggle: cookies.get('comparisonList') && cookies.get('comparisonList').includes(contributionId),
            //comparisonList: cookies.get('comparisonList') || [],
            //contributionAmount: cookies.get('comparisonList').length ? cookies.get('comparisonList').length : 0,
        }
    }

    toggleCompare = () => {
        //const { contributionId } = this.props;

        this.setState(prevState => ({
            toggle: !prevState.toggle,
            //comparisonList: prevState.comparisonList.includes(contributionId) ? prevState.comparisonList.filter(i => i !== contributionId) : [...prevState.comparisonList, contributionId],
        }), () => {
            this.props.cookies.set('comparisonList', this.state.comparisonList, { path: '/' });
        });
    }

    toggleComparisonBox = () => {
        this.setState(prevState => ({
            showComparisonBox: !prevState.showComparisonBox,
        }));
    }

    render() {
        //const { cookies } = this.props;
        //const contributionAmount = cookies.get('comparisonList') && cookies.get('comparisonList').length ? cookies.get('comparisonList').length : 0;
        const { allIds, byId } = this.props.comparison;

        if (allIds.length === 0) {
            return '';
        }

        const contributionAmount = allIds.length;

        //const comparisonArray = cookies.get('comparisonList') || [];
        //const comparisonContributions = cookies.get('comparisonContributions') || {};

        return (
            <Navbar fixed="bottom" className="p-0">
                <Container>
                    {!this.state.showComparisonBox ?
                        <ComparisonBoxButton color="primary" className="ml-auto" onClick={this.toggleComparisonBox}>
                            <Badge color="primaryDarker" className="pl-2 pr-2">{contributionAmount}</Badge> {' '}
                            Compare contributions <Icon icon={faChevronUp} />
                        </ComparisonBoxButton>
                        :
                        <ComparisonBox className="ml-auto">
                            <Header onClick={this.toggleComparisonBox}>
                                <Badge color="primaryDarker" className="pl-2 pr-2">{contributionAmount}</Badge> {' '}
                                Compare contributions
                                <div className="float-right">
                                    <Icon icon={faChevronDown} />
                                </div>
                            </Header>
                            <List>
                                {allIds.map((contributionId) => (
                                    <ContributionItem key={contributionId}>
                                        <div className="d-flex">
                                            <div className="pr-3"><Icon icon={faFile} /></div>
                                            <div className="flex-grow-1">
                                                <Title>{byId[contributionId].paperTitle}</Title>
                                                <Number>{byId[contributionId].contributionTitle}</Number>
                                            </div>
                                            <div>
                                                <Icon icon={faTimes} />
                                            </div>
                                        </div>
                                    </ContributionItem>
                                ))}
                            </List>
                            <div className="w-100 text-center">
                                <StartComparison color="primaryDarker" className="mb-2">
                                    Start comparison
                                </StartComparison>
                            </div>
                        </ComparisonBox>
                    }
                </Container>
            </Navbar>
        );
    }
}

ComparisonPopup.propTypes = {
    comparison: PropTypes.object.isRequired,
    cookies: PropTypes.object,
};

const mapStateToProps = state => ({
    // researchProblems: state.viewPaper.researchProblems,
    // resources: state.statementBrowser.resources,
    // selectedContribution: state.addPaper.selectedContribution,
    comparison: state.viewPaper.comparison,
});

const mapDispatchToProps = dispatch => ({
    // selectContribution: (data) => dispatch(selectContribution(data)),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withCookies
)(ComparisonPopup);
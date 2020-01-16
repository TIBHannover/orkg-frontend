import { Badge, Button, Container, Navbar } from 'reactstrap';
import React, { Component } from 'react';
import { faChevronDown, faChevronUp, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { loadComparisonFromCookie, removeFromComparison } from '../../actions/viewPaper';

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from '../../constants/routes.js';
import Tooltip from '../Utils/Tooltip';
import Confirm from 'reactstrap-confirm';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { withCookies } from 'react-cookie';

const ComparisonBoxButton = styled(Button)`
    border-radius: 11px 11px 0 0 !important;
    padding: 7px 20px !important;
    font-size: 95% !important;
    float: right;
    box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.13);
`;

const ComparisonBox = styled.div`
    background: ${props => props.theme.orkgPrimaryColor};
    border-radius: 11px 11px 0 0;
    width: 340px;
    min-height: 390px;
    box-shadow: 0px -1px 8px 0px rgba(0, 0, 0, 0.13);
    position: relative;
`;

const Header = styled.div`
    cursor: pointer;
    color: #fff;
    padding: 9px 20px 9px 15px;
    border-bottom: 2px solid #ef8282;
`;

const List = styled.ul`
    list-style: none;
    color: #fff;
    padding: 0;
    height: 300px;
    overflow-y: auto;
`;

const ContributionItem = styled.li`
    border-bottom: 2px solid #ef8282;
    padding: 8px 15px;
`;

const Title = styled(Link)`
    color: #fff;
    font-size: 90%;

    &:hover {
        color: inherit;
    }
`;

const Number = styled.div`
    font-size: 90%;
    opacity: 0.5;
`;

const StartComparison = styled(Button)`
    bottom: 0;
    font-size: 95% !important;
`;

const Remove = styled.div`
    cursor: pointer;
`;

class ComparisonPopup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showComparisonBox: false
        };
    }

    componentDidMount() {
        this.loadComparisonFromCookie();
        this.intervalComparisonFromCookie = setInterval(this.loadComparisonFromCookie, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.intervalComparisonFromCookie);
    }

    loadComparisonFromCookie = () => {
        if (
            this.props.cookies.get('comparison') &&
            JSON.stringify(this.props.comparison.allIds) !== JSON.stringify(this.props.cookies.get('comparison').allIds)
        ) {
            this.props.loadComparisonFromCookie(this.props.cookies.get('comparison'));
        }
    };

    toggleComparisonBox = () => {
        this.setState(prevState => ({
            showComparisonBox: !prevState.showComparisonBox
        }));
    };

    removeAllContributionFromComparison = async allIds => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to remove all contributions from comparison?',
            cancelColor: 'light'
        });

        if (result) {
            allIds.map(contributionId => this.removeFromComparison(contributionId));
        }
    };

    removeFromComparison = id => {
        this.props.removeFromComparison(id);
    };

    render() {
        const { allIds, byId } = this.props.comparison;

        if (allIds.length === 0) {
            return '';
        }

        const contributionAmount = allIds.length;
        const ids = allIds.join(',');
        const comparisonUrl = reverse(ROUTES.COMPARISON) + '?contributions=' + ids; // with named-urls it is not possible to use wildcard URLs, so replace the asterisk

        return (
            <Navbar fixed="bottom" className="p-0 offset-8" style={{ width: '340px' }}>
                <Container>
                    {!this.state.showComparisonBox ? (
                        <ComparisonBoxButton color="primary" className="ml-auto" onClick={this.toggleComparisonBox}>
                            <Badge color="primaryDarker" className="pl-2 pr-2">
                                {contributionAmount}
                            </Badge>{' '}
                            Compare contributions <Icon icon={faChevronUp} />
                        </ComparisonBoxButton>
                    ) : (
                        <ComparisonBox className="ml-auto">
                            <Header onClick={this.toggleComparisonBox}>
                                <Badge color="primaryDarker" className="pl-2 pr-2 mr-1">
                                    {contributionAmount}
                                </Badge>{' '}
                                Compare contributions
                                <div className="float-right">
                                    <Tooltip message="Remove all contributions from comparison" hideDefaultIcon>
                                        <Icon
                                            className="ml-2 mr-2"
                                            size="sm"
                                            onClick={() => this.removeAllContributionFromComparison(allIds)}
                                            icon={faTrash}
                                        />
                                    </Tooltip>
                                    <Icon icon={faChevronDown} />
                                </div>
                            </Header>
                            <List>
                                {allIds.map(contributionId => (
                                    <ContributionItem key={contributionId}>
                                        <div className="d-flex">
                                            <div className="pr-3">
                                                <Icon icon={faFile} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <Title
                                                    to={reverse(ROUTES.VIEW_PAPER, {
                                                        resourceId: byId[contributionId].paperId,
                                                        contributionId: contributionId
                                                    })}
                                                >
                                                    {byId[contributionId].paperTitle}
                                                </Title>
                                                <Number>{byId[contributionId].contributionTitle}</Number>
                                            </div>
                                            <Tooltip message="Remove from comparison" hideDefaultIcon>
                                                <Remove>
                                                    <Icon icon={faTimes} onClick={() => this.removeFromComparison(contributionId)} />
                                                </Remove>
                                            </Tooltip>
                                        </div>
                                    </ContributionItem>
                                ))}
                            </List>
                            <div className="w-100 text-center">
                                <Link to={comparisonUrl}>
                                    <StartComparison color="primaryDarker" className="mb-2">
                                        Start comparison
                                    </StartComparison>
                                </Link>
                            </div>
                        </ComparisonBox>
                    )}
                </Container>
            </Navbar>
        );
    }
}

ComparisonPopup.propTypes = {
    comparison: PropTypes.object.isRequired,
    removeFromComparison: PropTypes.func.isRequired,
    loadComparisonFromCookie: PropTypes.func.isRequired,
    cookies: PropTypes.object
};

const mapStateToProps = state => ({
    comparison: state.viewPaper.comparison
});

const mapDispatchToProps = dispatch => ({
    removeFromComparison: data => dispatch(removeFromComparison(data)),
    loadComparisonFromCookie: data => dispatch(loadComparisonFromCookie(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withCookies
)(ComparisonPopup);

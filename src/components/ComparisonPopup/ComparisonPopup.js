import { createRef, Component } from 'react';
import { Badge, Container, Navbar } from 'reactstrap';
import { ComparisonBoxButton, ComparisonBox, Header, List, ContributionItem, Title, Number, Remove, StartComparison } from './styled';
import { faChevronDown, faChevronUp, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { loadComparisonFromLocalStorage, removeFromComparison } from 'actions/viewPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Cookies } from 'react-cookie';
import ROUTES from 'constants/routes.js';
import Tooltip from '../Utils/Tooltip';
import Confirm from 'reactstrap-confirm';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { reverse } from 'named-urls';
const cookies = new Cookies();

const ComparisonPopupStyled = styled.div`
    &&& {
        bottom: ${props => (props.cookieInfoDismissed ? '0px' : '50px')};
    }

    @media (min-width: 481px) and (max-width: 1100px) {
        &&& {
            bottom: ${props => (props.cookieInfoDismissed ? '0px' : '70px')};
        }
    }
    @media (max-width: 480px) {
        &&& {
            bottom: ${props => (props.cookieInfoDismissed ? '0px' : '120px')};
        }
    }
`;

class ComparisonPopup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showComparisonBox: false
        };

        this.comparisionPopup = createRef();
    }

    componentDidMount() {
        this.loadComparisonFromLocalStorage();
        this.intervalComparisonFromLocalStorage = setInterval(this.loadComparisonFromLocalStorage, 1000);
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        clearInterval(this.intervalComparisonFromLocalStorage);
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    loadComparisonFromLocalStorage = () => {
        if (
            localStorage.getItem('comparison') &&
            JSON.stringify(this.props.comparison.allIds) !== JSON.stringify(JSON.parse(localStorage.getItem('comparison')).allIds)
        ) {
            this.props.loadComparisonFromLocalStorage(JSON.parse(localStorage.getItem('comparison')));
        }
    };

    toggleComparisonBox = () => {
        this.setState(prevState => ({
            showComparisonBox: !prevState.showComparisonBox
        }));
    };

    handleClickOutside = event => {
        if (this.comparisionPopup.current && !this.comparisionPopup.current.contains(event.target) && this.state.showComparisonBox) {
            this.toggleComparisonBox();
        }
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
        const cookieInfoDismissed = cookies.get('cookieInfoDismissed') ? cookies.get('cookieInfoDismissed') : null;
        const { allIds, byId } = this.props.comparison;

        if (allIds.length === 0) {
            return '';
        }

        const contributionAmount = allIds.length;
        const ids = allIds.join(',');
        const comparisonUrl = reverse(ROUTES.COMPARISON) + '?contributions=' + ids; // with named-urls it is not possible to use wildcard URLs, so replace the asterisk

        return (
            <ComparisonPopupStyled
                cookieInfoDismissed={cookieInfoDismissed}
                ref={node => (this.comparisionPopup.current = node)}
                className="fixed-bottom p-0 offset-sm-2 offset-md-8"
                style={{ width: '340px', zIndex: '1000' }}
            >
                <Navbar className="p-0">
                    <Container>
                        {!this.state.showComparisonBox ? (
                            <ComparisonBoxButton color="primary" className="ml-auto" onClick={this.toggleComparisonBox}>
                                <Badge color="primary-darker" className="pl-2 pr-2">
                                    {contributionAmount}
                                </Badge>{' '}
                                Compare contributions <Icon icon={faChevronUp} />
                            </ComparisonBoxButton>
                        ) : (
                            <ComparisonBox className="ml-auto">
                                <Header onClick={this.toggleComparisonBox}>
                                    <Badge color="primary-darker" className="pl-2 pr-2 mr-1">
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
                                                <div className="flex-grow-1 text-break">
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
                                        <StartComparison color="primary-darker" className="mb-2">
                                            Start comparison
                                        </StartComparison>
                                    </Link>
                                </div>
                            </ComparisonBox>
                        )}
                    </Container>
                </Navbar>
            </ComparisonPopupStyled>
        );
    }
}

ComparisonPopup.propTypes = {
    comparison: PropTypes.object.isRequired,
    removeFromComparison: PropTypes.func.isRequired,
    loadComparisonFromLocalStorage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    comparison: state.viewPaper.comparison
});

const mapDispatchToProps = dispatch => ({
    removeFromComparison: data => dispatch(removeFromComparison(data)),
    loadComparisonFromLocalStorage: data => dispatch(loadComparisonFromLocalStorage(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ComparisonPopup);

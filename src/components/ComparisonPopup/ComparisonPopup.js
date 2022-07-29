import { createRef, Component } from 'react';
import { Badge, Container, Navbar, Button, ButtonGroup } from 'reactstrap';
import { faChevronDown, faChevronUp, faTimes, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { loadComparisonFromLocalStorage, removeFromComparison } from 'slices/viewPaperSlice';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Cookies } from 'react-cookie';
import ROUTES from 'constants/routes.js';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { reverse } from 'named-urls';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import Tippy from '@tippyjs/react';
import { ComparisonBoxButton, ComparisonBox, Header, List, ContributionItem, Title, Number, Remove, StartComparison } from './styled';

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
            showComparisonBox: false,
        };

        this.yesButtonRef = createRef();
        this.cancelButtonRef = createRef();
        this.comparisonPopup = createRef();
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
            showComparisonBox: !prevState.showComparisonBox,
        }));
    };

    handleClickOutside = event => {
        if (this.comparisonPopup.current && !this.comparisonPopup.current.contains(event.target) && this.state.showComparisonBox) {
            this.toggleComparisonBox();
        }
    };

    removeAllContributionFromComparison = async allIds => {
        allIds.map(contributionId => this.removeFromComparison(contributionId));
    };

    removeFromComparison = id => {
        this.props.removeFromComparison(id);
    };

    onShow = () => {
        document.addEventListener('keydown', this.onKeyPressed);
    };

    onShown = () => {
        this.yesButtonRef.current.focus();
    };

    onHide = () => {
        document.removeEventListener('keydown', this.onKeyPressed);
    };

    onKeyPressed = e => {
        if (e.keyCode === 27) {
            // escape
            this.tippy.hide();
        }
        if (e.keyCode === 9) {
            // Tab
            e.preventDefault();
            e.stopPropagation();
            if (document.activeElement === this.yesButtonRef.current) {
                this.cancelButtonRef.current.focus();
            } else {
                this.yesButtonRef.current.focus();
            }
        }
    };

    closeTippy = () => {
        this.tippy.hide();
    };

    onCreate = tippy => {
        this.tippy = tippy;
    };

    render() {
        const cookieInfoDismissed = cookies.get('cookieInfoDismissed') ? cookies.get('cookieInfoDismissed') : null;
        const { allIds, byId } = this.props.comparison;

        if (allIds.length === 0) {
            return '';
        }

        const contributionAmount = allIds.length;
        const ids = allIds.join(',');
        const comparisonUrl = `${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?contributions=${ids}`; // with named-urls it is not possible to use wildcard URLs, so replace the asterisk

        return (
            <ComparisonPopupStyled
                cookieInfoDismissed={cookieInfoDismissed}
                ref={node => (this.comparisonPopup.current = node)}
                className="fixed-bottom p-0 offset-sm-2 offset-md-8"
                style={{ width: '340px', zIndex: '1000' }}
            >
                <Navbar className="p-0">
                    <Container>
                        {!this.state.showComparisonBox ? (
                            <ComparisonBoxButton color="primary" className="ms-auto" onClick={this.toggleComparisonBox}>
                                <Badge color="primary-darker" className="ps-2 pe-2">
                                    {contributionAmount}
                                </Badge>{' '}
                                Compare contributions <Icon icon={faChevronUp} />
                            </ComparisonBoxButton>
                        ) : (
                            <ComparisonBox className="ms-auto">
                                <Header onClick={this.toggleComparisonBox}>
                                    <Badge color="primary-darker" className="ps-2 pe-2 me-1">
                                        {contributionAmount}
                                    </Badge>{' '}
                                    Compare contributions
                                    <div className="float-end">
                                        <Tippy trigger="mouseenter" content="Remove all contributions from comparison" zIndex={9999}>
                                            <Tippy
                                                onShow={this.onShow}
                                                onShown={this.onShown}
                                                onHide={this.onHide}
                                                onCreate={this.onCreate}
                                                interactive={true}
                                                trigger="click"
                                                content={
                                                    <div
                                                        className="text-center p-1"
                                                        style={{ color: '#fff', fontSize: '0.95rem', wordBreak: 'normal' }}
                                                    >
                                                        <p className="mb-2">Are you sure?</p>
                                                        <ButtonGroup size="sm" className="mt-1 mb-1">
                                                            <Button
                                                                onClick={() => {
                                                                    this.removeAllContributionFromComparison(allIds);
                                                                    this.closeTippy();
                                                                }}
                                                                innerRef={this.yesButtonRef}
                                                                className="px-2"
                                                                color="danger"
                                                                style={{ paddingTop: 2, paddingBottom: 2 }}
                                                            >
                                                                <Icon icon={faCheck} className="me-1" />
                                                                Remove
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    this.closeTippy();
                                                                }}
                                                                innerRef={this.cancelButtonRef}
                                                                className="px-2"
                                                                style={{ paddingTop: 2, paddingBottom: 2 }}
                                                            >
                                                                {' '}
                                                                <Icon icon={faTimes} className="me-1" /> Cancel
                                                            </Button>
                                                        </ButtonGroup>
                                                    </div>
                                                }
                                            >
                                                <span>
                                                    <Icon className="ms-2 me-2" size="sm" onClick={e => e.stopPropagation()} icon={faTrash} />
                                                </span>
                                            </Tippy>
                                        </Tippy>
                                        <Icon icon={faChevronDown} />
                                    </div>
                                </Header>
                                <List>
                                    {allIds.map(contributionId => (
                                        <ContributionItem key={contributionId}>
                                            <div className="d-flex">
                                                <div className="pe-3">
                                                    <Icon icon={faFile} />
                                                </div>
                                                <div className="flex-grow-1 text-break">
                                                    <Title
                                                        to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                                            resourceId: byId[contributionId].paperId,
                                                            contributionId,
                                                        })}
                                                    >
                                                        {byId[contributionId].paperTitle}
                                                    </Title>
                                                    <Number>{byId[contributionId].contributionTitle}</Number>
                                                </div>
                                                <Tippy content="Remove from comparison">
                                                    <span>
                                                        <Remove>
                                                            <Icon icon={faTimes} onClick={() => this.removeFromComparison(contributionId)} />
                                                        </Remove>
                                                    </span>
                                                </Tippy>
                                            </div>
                                        </ContributionItem>
                                    ))}
                                </List>
                                <div className="w-100 text-center">
                                    <ConditionalWrapper
                                        condition={contributionAmount > 1}
                                        wrapper={children => <Link to={comparisonUrl}>{children}</Link>}
                                    >
                                        <Tippy disabled={contributionAmount > 1} content="Please select at least two contributions">
                                            <span>
                                                <StartComparison disabled={contributionAmount <= 1} color="primary-darker" className="mb-2">
                                                    Start comparison
                                                </StartComparison>
                                            </span>
                                        </Tippy>
                                    </ConditionalWrapper>
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
    loadComparisonFromLocalStorage: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    comparison: state.viewPaper.comparison,
});

const mapDispatchToProps = dispatch => ({
    removeFromComparison: data => dispatch(removeFromComparison(data)),
    loadComparisonFromLocalStorage: data => dispatch(loadComparisonFromLocalStorage(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ComparisonPopup);

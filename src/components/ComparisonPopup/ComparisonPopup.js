import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faChevronDown, faChevronUp, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    ComparisonBox,
    ComparisonBoxButton,
    ContributionItem,
    Header,
    List,
    Number,
    Remove,
    StartComparison,
    Title,
} from 'components/ComparisonPopup/styled';
import Popover from 'components/FloatingUI/Popover';
import Tooltip from 'components/FloatingUI/Tooltip';
import PaperTitle from 'components/PaperTitle/PaperTitle';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { Cookies } from 'react-cookie';
import { connect } from 'react-redux';
import { Badge, Button, ButtonGroup, Container, Navbar } from 'reactstrap';
import { loadComparisonFromLocalStorage, removeFromComparison } from 'slices/viewPaperSlice';
import styled from 'styled-components';

const cookies = new Cookies();

const ComparisonPopupStyled = styled.div`
    &&& {
        bottom: ${(props) => (props.$cookieInfoDismissed ? '0px' : '50px')};
    }

    @media (min-width: 481px) and (max-width: 1100px) {
        &&& {
            bottom: ${(props) => (props.$cookieInfoDismissed ? '0px' : '70px')};
        }
    }
    @media (max-width: 480px) {
        &&& {
            bottom: ${(props) => (props.$cookieInfoDismissed ? '0px' : '120px')};
        }
    }
`;

class ComparisonPopup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showComparisonBox: false,
            showConfirmationPopover: false,
        };

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
        this.setState((prevState) => ({
            showComparisonBox: !prevState.showComparisonBox,
        }));
    };

    handleClickOutside = (event) => {
        if (
            this.comparisonPopup.current &&
            !this.comparisonPopup.current.contains(event.target) &&
            this.state.showComparisonBox &&
            !this.state.showConfirmationPopover
        ) {
            this.toggleComparisonBox();
        }
    };

    removeAllContributionFromComparison = async (allIds) => {
        allIds.map((contributionId) => this.removeFromComparison(contributionId));
    };

    removeFromComparison = (id) => {
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
        const comparisonUrl = `${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?contributions=${ids}`; // with named-urls it is not possible to use wildcard URLs, so replace the asterisk

        return (
            <ComparisonPopupStyled
                $cookieInfoDismissed={cookieInfoDismissed}
                ref={(node) => (this.comparisonPopup.current = node)}
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
                                Compare contributions <FontAwesomeIcon icon={faChevronUp} />
                            </ComparisonBoxButton>
                        ) : (
                            <ComparisonBox className="ms-auto">
                                <Header className="d-flex">
                                    <Badge color="primary-darker" className="ps-2 pe-2 me-1" onClick={this.toggleComparisonBox}>
                                        {contributionAmount}
                                    </Badge>{' '}
                                    <Button
                                        color="link"
                                        className="flex-grow-1 text-decoration-none p-0 text-white"
                                        style={{ textAlign: 'left' }}
                                        onClick={this.toggleComparisonBox}
                                    >
                                        Compare contributions
                                    </Button>
                                    <div className="float-end">
                                        <Tooltip content="Remove all contributions from comparison" disabled={this.state.showConfirmationPopover}>
                                            <Popover
                                                modal
                                                open={this.state.showConfirmationPopover}
                                                onOpenChange={(open) => this.setState({ showConfirmationPopover: open })}
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
                                                                    this.setState({ showConfirmationPopover: false });
                                                                }}
                                                                className="px-2"
                                                                color="danger"
                                                                style={{ paddingTop: 2, paddingBottom: 2 }}
                                                            >
                                                                <FontAwesomeIcon icon={faCheck} className="me-1" />
                                                                Remove
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    this.setState({ showConfirmationPopover: false });
                                                                }}
                                                                className="px-2"
                                                                style={{ paddingTop: 2, paddingBottom: 2 }}
                                                            >
                                                                <FontAwesomeIcon icon={faTimes} className="me-1" /> Cancel
                                                            </Button>
                                                        </ButtonGroup>
                                                    </div>
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    onClick={() => this.setState({ showConfirmationPopover: true })}
                                                    className="ms-2 me-2"
                                                    size="sm"
                                                    icon={faTrash}
                                                />
                                            </Popover>
                                        </Tooltip>

                                        <FontAwesomeIcon icon={faChevronDown} onClick={this.toggleComparisonBox} />
                                    </div>
                                </Header>
                                <List>
                                    {allIds.map((contributionId) => (
                                        <ContributionItem key={contributionId}>
                                            <div className="d-flex">
                                                <div className="pe-3">
                                                    <FontAwesomeIcon icon={faFile} />
                                                </div>
                                                <div className="flex-grow-1 text-break">
                                                    <Title
                                                        href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                                            resourceId: byId[contributionId].paperId,
                                                            contributionId,
                                                        })}
                                                    >
                                                        <PaperTitle title={byId[contributionId].paperTitle} />
                                                    </Title>
                                                    <Number>{byId[contributionId].contributionTitle}</Number>
                                                </div>
                                                <Tooltip content="Remove from comparison">
                                                    <span>
                                                        <Remove>
                                                            <FontAwesomeIcon
                                                                icon={faTimes}
                                                                onClick={() => this.removeFromComparison(contributionId)}
                                                            />
                                                        </Remove>
                                                    </span>
                                                </Tooltip>
                                            </div>
                                        </ContributionItem>
                                    ))}
                                </List>
                                <div className="w-100 text-center">
                                    <ConditionalWrapper
                                        condition={contributionAmount > 1}
                                        wrapper={(children) => <Link href={comparisonUrl}>{children}</Link>}
                                    >
                                        <Tooltip disabled={contributionAmount > 1} content="Please select at least two contributions">
                                            <span>
                                                <StartComparison disabled={contributionAmount <= 1} color="primary-darker" className="mb-2">
                                                    Start comparison
                                                </StartComparison>
                                            </span>
                                        </Tooltip>
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

const mapStateToProps = (state) => ({
    comparison: state.viewPaper.comparison,
});

const mapDispatchToProps = (dispatch) => ({
    removeFromComparison: (data) => dispatch(removeFromComparison(data)),
    loadComparisonFromLocalStorage: (data) => dispatch(loadComparisonFromLocalStorage(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ComparisonPopup);

'use client';

import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faChevronDown, faChevronUp, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Cookies } from 'react-cookie';
import styled from 'styled-components';

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
} from '@/components/ComparisonPopup/styled';
import useComparisonPopup from '@/components/ComparisonPopup/useComparisonPopup';
import Popover from '@/components/FloatingUI/Popover';
import Tooltip from '@/components/FloatingUI/Tooltip';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import Badge from '@/components/Ui/Badge/Badge';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
import Navbar from '@/components/Ui/Nav/Navbar';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';

const cookies = new Cookies();

type ComparisonPopupStyledProps = {
    $cookieInfoDismissed: boolean;
};

const ComparisonPopupStyled = styled.div<ComparisonPopupStyledProps>`
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

const ComparisonPopup: FC = () => {
    const { comparison, updateComparison } = useComparisonPopup();
    const [showComparisonBox, setShowComparisonBox] = useState(false);
    const [showConfirmationPopover, setShowConfirmationPopover] = useState(false);
    const comparisonPopupRef = useRef<HTMLDivElement>(null);

    const toggleComparisonBox = useCallback(() => {
        setShowComparisonBox((prev) => !prev);
    }, []);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                comparisonPopupRef.current &&
                !comparisonPopupRef.current.contains(event.target as Node) &&
                showComparisonBox &&
                !showConfirmationPopover
            ) {
                toggleComparisonBox();
            }
        },
        [showComparisonBox, showConfirmationPopover, toggleComparisonBox],
    );

    const removeFromComparison = useCallback(
        (id: string) => {
            updateComparison((prev) => {
                const { [id]: removed, ...remainingById } = prev.byId;
                return {
                    byId: remainingById,
                    allIds: prev.allIds.filter((contributionId) => contributionId !== id),
                };
            });
        },
        [updateComparison],
    );

    const removeAllContributionsFromComparison = useCallback(() => {
        updateComparison(() => ({ byId: {}, allIds: [] }));
    }, [updateComparison]);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    const cookieInfoDismissed = cookies.get('cookieInfoDismissed') ? cookies.get('cookieInfoDismissed') : null;
    const { allIds, byId } = comparison;

    if (allIds.length === 0) {
        return null;
    }

    const contributionAmount = allIds.length;
    const ids = allIds.join(',');
    const comparisonUrl = `${reverse(ROUTES.COMPARISON_NOT_PUBLISHED)}?contributions=${ids}`;

    return (
        <ComparisonPopupStyled
            $cookieInfoDismissed={cookieInfoDismissed}
            ref={comparisonPopupRef}
            className="fixed-bottom p-0 offset-sm-2 offset-md-8"
            style={{ width: '340px', zIndex: '1000' }}
        >
            <Navbar className="p-0">
                <Container>
                    {!showComparisonBox ? (
                        <ComparisonBoxButton color="primary" className="ms-auto" onClick={toggleComparisonBox}>
                            <Badge color="primary-darker" className="ps-2 pe-2">
                                {contributionAmount}
                            </Badge>{' '}
                            Compare contributions <FontAwesomeIcon icon={faChevronUp} />
                        </ComparisonBoxButton>
                    ) : (
                        <ComparisonBox className="ms-auto">
                            <Header className="d-flex">
                                <Badge color="primary-darker" className="ps-2 pe-2 me-1" onClick={toggleComparisonBox}>
                                    {contributionAmount}
                                </Badge>{' '}
                                <Button
                                    color="link"
                                    className="flex-grow-1 text-decoration-none p-0 text-white"
                                    style={{ textAlign: 'left' }}
                                    onClick={toggleComparisonBox}
                                >
                                    Compare contributions
                                </Button>
                                <div className="float-end">
                                    <Tooltip content="Remove all contributions from comparison" disabled={showConfirmationPopover}>
                                        <Popover
                                            modal
                                            open={showConfirmationPopover}
                                            onOpenChange={(open) => setShowConfirmationPopover(open)}
                                            content={
                                                <div className="text-center p-1" style={{ color: '#fff', fontSize: '0.95rem', wordBreak: 'normal' }}>
                                                    <p className="mb-2">Are you sure?</p>
                                                    <ButtonGroup size="sm" className="mt-1 mb-1">
                                                        <Button
                                                            onClick={() => {
                                                                removeAllContributionsFromComparison();
                                                                setShowConfirmationPopover(false);
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
                                                                setShowConfirmationPopover(false);
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
                                                onClick={() => setShowConfirmationPopover(true)}
                                                className="ms-2 me-2"
                                                size="sm"
                                                icon={faTrash}
                                            />
                                        </Popover>
                                    </Tooltip>

                                    <FontAwesomeIcon icon={faChevronDown} onClick={toggleComparisonBox} />
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
                                                        <FontAwesomeIcon icon={faTimes} onClick={() => removeFromComparison(contributionId)} />
                                                    </Remove>
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </ContributionItem>
                                ))}
                            </List>
                            <div className="w-100 text-center">
                                {contributionAmount > 1 ? (
                                    <Link href={comparisonUrl}>
                                        <StartComparison disabled={false} color="primary-darker" className="mb-2">
                                            Start comparison
                                        </StartComparison>
                                    </Link>
                                ) : (
                                    <Tooltip content="Please select at least two contributions">
                                        <span>
                                            <StartComparison disabled color="primary-darker" className="mb-2">
                                                Start comparison
                                            </StartComparison>
                                        </span>
                                    </Tooltip>
                                )}
                            </div>
                        </ComparisonBox>
                    )}
                </Container>
            </Navbar>
        </ComparisonPopupStyled>
    );
};

export default ComparisonPopup;

import { faFile, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import Coins from 'components/Coins/Coins';
import useComparison from 'components/Comparison/hooks/useComparison';
import { Contribution, Delete } from 'components/Comparison/styled';
import PaperTitle from 'components/PaperTitle/PaperTitle';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import ROUTES from 'constants/routes';
import { isEqual } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { memo } from 'react';
import { useSelector } from 'react-redux';
import { getPaper, papersUrl } from 'services/backend/papers';
import useSWR from 'swr';

const ContributionCell = ({ contribution }) => {
    const { comparison, updateComparison } = useComparison();
    const isEmbeddedMode = useSelector((state) => state.comparison.isEmbeddedMode);
    const columnWidth = useSelector((state) => state.comparison.configuration.columnWidth);
    const transpose = useSelector((state) => state.comparison.configuration.transpose);
    const { isEditMode } = useIsEditMode();

    const handleDelete = () =>
        updateComparison({
            contributions: comparison.contributions.filter(({ id }) => id !== contribution.id),
            config: {
                ...comparison.config,
                contributions: comparison.config.contributions.filter((contributionId) => contributionId !== contribution.id),
            },
        });

    const { data: paper } = useSWR(contribution.paper_id ? [contribution.paper_id, papersUrl, 'getPaper'] : null, ([params]) => getPaper(params));

    return (
        <>
            {columnWidth && columnWidth < 200 && !transpose ? (
                <Tippy
                    content={
                        <div>
                            <Link
                                href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                    resourceId: contribution.paper_id,
                                    contributionId: contribution.id,
                                })}
                                className="text-white"
                            >
                                {contribution?.paper_label ?? <em>No title</em>}
                            </Link>
                            <br />
                            <Contribution style={{ borderTopColor: '#000' }}>
                                {contribution.label} {contribution.paper_year && `- ${contribution.paper_year}`}
                            </Contribution>
                        </div>
                    }
                    interactive
                    appendTo={document.body}
                >
                    <span>
                        <Link
                            href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                resourceId: contribution.paper_id,
                                contributionId: contribution.id,
                            })}
                            className="text-white"
                        >
                            <div className="d-flex justify-content-center align-items-center h-100">
                                <FontAwesomeIcon icon={faFile} />
                            </div>
                        </Link>
                    </span>
                </Tippy>
            ) : (
                <>
                    <Link
                        href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                            resourceId: contribution.paper_id,
                            contributionId: contribution.id,
                        })}
                    >
                        <PaperTitle title={contribution?.paper_label} />
                    </Link>
                    <br />
                    <Contribution>
                        {contribution.label} {contribution.paper_year && `- ${contribution.paper_year}`}
                    </Contribution>
                </>
            )}
            <Coins
                item={
                    !paper
                        ? {
                              id: contribution.paper_id,
                              title: contribution?.paper_label,
                              publication_info: {
                                  published_year: contribution?.paper_year,
                              },
                          }
                        : paper
                }
            />
            {isEditMode && !isEmbeddedMode && (
                <Delete onClick={handleDelete}>
                    <FontAwesomeIcon icon={faTimes} />
                </Delete>
            )}
        </>
    );
};

ContributionCell.propTypes = {
    contribution: PropTypes.object.isRequired,
};

export default memo(ContributionCell, isEqual);

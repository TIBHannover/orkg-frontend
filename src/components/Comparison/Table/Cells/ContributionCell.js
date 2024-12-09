import Link from 'next/link';
import { faFile, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { removeContribution } from 'slices/comparisonSlice';
import { Contribution, Delete } from 'components/Comparison/styled';
import { memo } from 'react';
import { isEqual } from 'lodash';
import Tippy from '@tippyjs/react';
import PaperTitle from 'components/PaperTitle/PaperTitle';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import useComparison from 'components/Comparison/hooks/useComparison';

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

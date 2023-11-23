import Link from 'components/NextJsMigration/Link';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { removeContribution } from 'slices/comparisonSlice';
import { Contribution, Delete } from 'components/Comparison/styled';
import { memo } from 'react';
import { isEqual } from 'lodash';

const ContributionCell = ({ contribution }) => {
    const dispatch = useDispatch();
    const contributions = useSelector(state => state.comparison.contributions);
    const isEditing = useSelector(state => state.comparison.isEditing);
    const isEmbeddedMode = useSelector(state => state.comparison.isEmbeddedMode);

    return (
        <>
            <Link
                href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                    resourceId: contribution.paper_id,
                    contributionId: contribution.id,
                })}
            >
                {contribution?.paper_label ?? <em>No title</em>}
            </Link>
            <br />
            <Contribution>
                {contribution.label} {contribution.paper_year && `- ${contribution.paper_year}`}
            </Contribution>
            {isEditing && !isEmbeddedMode && contributions.filter(_contribution => _contribution.active).length > 2 && (
                <Delete onClick={() => dispatch(removeContribution(contribution.id))}>
                    <Icon icon={faTimes} />
                </Delete>
            )}
        </>
    );
};

ContributionCell.propTypes = {
    contribution: PropTypes.object.isRequired,
};

export default memo(ContributionCell, isEqual);

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Contribution, Delete, ItemHeader, ItemHeaderInner } from 'components/Comparison/styled';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const TableColumnHeader = ({ contribution }) => {
    return (
        <ItemHeader key={contribution.id}>
            <ItemHeaderInner>
                <Link
                    to={reverse(ROUTES.VIEW_PAPER, {
                        resourceId: contribution.paperId,
                        contributionId: contribution.id
                    })}
                >
                    {contribution.title ? contribution.title : <em>No title</em>}
                </Link>
                <br />
                <Contribution>
                    {contribution.year && `${contribution.year} - `}
                    {contribution.contributionLabel}
                </Contribution>
            </ItemHeaderInner>

            <Delete>
                <Icon icon={faTimes} />
            </Delete>
        </ItemHeader>
    );
};

TableColumnHeader.propTypes = {
    contribution: PropTypes.object
};

export default TableColumnHeader;

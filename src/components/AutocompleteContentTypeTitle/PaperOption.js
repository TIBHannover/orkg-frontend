import Tippy from '@tippyjs/react';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { components } from 'react-select';
import { Badge } from 'reactstrap';

const PaperOption = ({ children, ...innerProps }) => {
    const firstAuthor = innerProps?.data?.authors?.[0]?.name;
    const shouldShowEtAl = innerProps?.data?.authors?.length > 1;
    const isOrkgResource = innerProps?.data?.isOrkgResource;

    return (
        <components.Option {...innerProps}>
            <div className="d-flex">
                <div className="text-truncate">{children}</div>
                {firstAuthor && (
                    <div className="text-muted fst-italic flex-shrink-0 ms-2">
                        {firstAuthor} {shouldShowEtAl && 'et al.'} {innerProps?.data?.year}
                    </div>
                )}
                {isOrkgResource && (
                    <Tippy content="Open existing ORKG entity">
                        <span className="ms-auto">
                            <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: innerProps?.data?.id })} target="_blank">
                                <Badge onClick={e => e.stopPropagation()} color="light" className="px-2">
                                    {innerProps?.data?.id}
                                </Badge>
                            </Link>
                        </span>
                    </Tippy>
                )}
            </div>
        </components.Option>
    );
};

PaperOption.propTypes = {
    children: PropTypes.node.isRequired
};

export default PaperOption;

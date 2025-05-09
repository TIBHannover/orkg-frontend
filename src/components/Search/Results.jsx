import Link from 'next/link';
import PropTypes from 'prop-types';
import { Button, ListGroup, ListGroupItem } from 'reactstrap';
import styled from 'styled-components';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import ItemMetadata from '@/components/Search/ItemMetadata';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { getResourceLink } from '@/utils';

const StyledLoadMoreButton = styled.div`
    padding-top: 0;
    & button {
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-top: 0;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        border-bottom-right-radius: 6px;
        border-bottom-left-radius: 6px;
    }
    &.action:hover button {
        z-index: 1;
        color: #495057;
        text-decoration: underline;
        background-color: #f8f9fa;
    }
`;

const StyledListGroupItem = styled(ListGroupItem)`
    overflow-wrap: anywhere;

    &:last-child {
        border-bottom-right-radius: ${(props) => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

const Results = (props) => (
    <div>
        {props.loading && props.currentPage === 0 && (
            <ContentLoader height="100%" width="100%" viewBox="0 0 100 25" style={{ width: '100% !important' }} speed={2}>
                <rect x="0" y="0" width="50" height="3" />
                <rect x="0" y="5" width="100%" height="3" />
                <rect x="0" y="10" width="100%" height="3" />
                <rect x="0" y="15" width="100%" height="3" />
                <rect x="0" y="20" width="100%" height="3" />
            </ContentLoader>
        )}

        {!props.loading && props.items.length === 0 && props.showNoResultsMessage && (
            <div>
                <h2 className="h5">{props.label}</h2>
                <div className="text-center mt-4 mb-4">There are no results, please try a different search term</div>
            </div>
        )}

        {props.items.length > 0 && (
            <div>
                <h2 className="h5">{props.label}</h2>
                <div className="mb-3">
                    <ListGroup>
                        {props.items.map((item, index) => (
                            <StyledListGroupItem rounded={props.hasNextPage.toString()} key={`result-${index}`} className="pt-1 pb-2">
                                <Link href={item.customRoute ?? getResourceLink(props.class, item.id)}>{item.label}</Link>
                                <ItemMetadata
                                    item={item}
                                    showClasses={props.showClasses}
                                    showCreatedAt={item.classes && item.classes.includes(CLASSES.COMPARISON)}
                                    showExtractionMethod={item._class === ENTITIES.RESOURCE}
                                />
                            </StyledListGroupItem>
                        ))}
                    </ListGroup>
                    {!props.loading && props.hasNextPage && (
                        <StyledLoadMoreButton className="text-end action">
                            <Button color="link" size="sm" onClick={props.loadMore}>
                                + Load more
                            </Button>
                        </StyledLoadMoreButton>
                    )}
                    {props.loading && props.hasNextPage && (
                        <StyledLoadMoreButton className="text-end action">
                            <Button color="link" size="sm" onClick={props.loadMore}>
                                Loading...
                            </Button>
                        </StyledLoadMoreButton>
                    )}
                </div>
            </div>
        )}
    </div>
);

Results.propTypes = {
    loading: PropTypes.bool.isRequired,
    showClasses: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    loadMore: PropTypes.func.isRequired,
    hasNextPage: PropTypes.bool.isRequired,
    showNoResultsMessage: PropTypes.bool.isRequired,
    currentPage: PropTypes.number.isRequired,
};

export default Results;

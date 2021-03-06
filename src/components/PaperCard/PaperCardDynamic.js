import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import RelativeBreadcrumbs from 'components/RelativeBreadcrumbs/RelativeBreadcrumbs';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import Authors from './Authors';
import PropTypes from 'prop-types';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';
import moment from 'moment';
import ContentLoader from 'react-content-loader';

const PaperCardStyled = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${props => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

const PaperCardDynamic = props => {
    const [isLoading, setIsLoading] = useState(true);
    const [optimizedPaperObject, setOptimizePaperObject] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        if (props.paper.paperData && props.paper.paperData.statements) {
            if (optimizedPaperObject === null) {
                setOptimizePaperObject(getPaperDataForViewAllPapers(props.paper.paperData.statements));
                setIsLoading(false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.paper.paperData]);

    /**
     * Parse paper statements and return an OPTIMIZED paper object for View all papers
     *
     * @param {Array} paperStatements
     */
    const getPaperDataForViewAllPapers = paperStatements => {
        const publicationYear = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_PUBLICATION_YEAR, true);
        const publicationMonth = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_PUBLICATION_MONTH, true);
        const authors = filterObjectOfStatementsByPredicateAndClass(paperStatements, PREDICATES.HAS_AUTHOR, false);
        const researchField = filterObjectOfStatementsByPredicateAndClass(
            paperStatements,
            PREDICATES.HAS_RESEARCH_FIELD,
            true,
            CLASSES.RESEARCH_FIELD
        );
        return {
            publicationYear,
            publicationMonth,
            authors: authors ? authors.sort((a, b) => a.created_at.localeCompare(b.created_at)) : [],
            researchField
        };
    };

    return (
        <PaperCardStyled className="list-group-item list-group-item-action">
            <div className="row">
                <div className="col-9">
                    <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: props.paper.id })}>
                        {props.paper.title ? props.paper.title : <em>No title</em>}
                    </Link>
                    <br />
                    {!isLoading && (
                        <>
                            <small>
                                <Authors authors={optimizedPaperObject.authors} />
                                {(optimizedPaperObject.publicationMonth || optimizedPaperObject.publicationYear) && (
                                    <Icon size="sm" icon={faCalendar} className="ml-2 mr-1" />
                                )}
                                {optimizedPaperObject.publicationMonth && optimizedPaperObject.publicationMonth.label > 0
                                    ? moment(optimizedPaperObject.publicationMonth.label, 'M').format('MMMM')
                                    : ''}{' '}
                                {optimizedPaperObject.publicationYear?.label && optimizedPaperObject.publicationYear.label}
                            </small>
                            <div className="d-block d-md-none">
                                <RelativeBreadcrumbs researchField={optimizedPaperObject.researchField} />
                            </div>
                        </>
                    )}

                    {/*Show Loading Dynamic data indicator if we are loading */}
                    {isLoading && (
                        <div style={{ display: 'ruby' }}>
                            <span>Loading</span>
                            <ContentLoader
                                style={{ marginTop: '-8px', width: '8% !important' }}
                                height={30}
                                width="8%"
                                viewBox="0 0 100 30"
                                speed={2}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ccc"
                            >
                                <circle cx="6" cy="18" r="4" />
                                <circle cx="16" cy="18" r="4" />
                                <circle cx="26" cy="18" r="4" />
                            </ContentLoader>
                        </div>
                    )}
                </div>
                {!isLoading && (
                    <div className="col-3 text-right d-flex align-items-end" style={{ flexDirection: 'column' }}>
                        <div style={{ flex: 1 }} className="d-none d-md-block">
                            <RelativeBreadcrumbs researchField={optimizedPaperObject.researchField} />
                        </div>
                        <UserAvatar userId={props.paper?.created_by} />
                    </div>
                )}
            </div>
        </PaperCardStyled>
    );
};

PaperCardDynamic.propTypes = {
    paper: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
        authors: PropTypes.array,
        publicationMonth: PropTypes.string,
        publicationYear: PropTypes.string,
        paperData: PropTypes.object,
        researchField: PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string
        }),
        created_by: PropTypes.string
    }).isRequired
};

export default PaperCardDynamic;

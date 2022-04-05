import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAltMetrics } from 'services/altmetric/index';
import env from '@beam-australia/react-env';

const PaperVersionHeader = props => {
    const viewPaper = useSelector(state => state.viewPaper, shallowEqual);
    const [altMetrics, setAltMetrics] = useState(null);

    useEffect(() => {
        if (!viewPaper.doi?.label) {
            return;
        }
        const loadAltMetrics = async () => {
            const altMetrics = await getAltMetrics(viewPaper.doi?.label);
            setAltMetrics(altMetrics);
        };
        loadAltMetrics();
    }, [viewPaper.doi?.label]);

    return (
        <>
            <div className="d-flex align-items-start">
                <h2 className="h4 mt-4 mb-3 flex-grow-1">{viewPaper.paperResource.label ? viewPaper.paperResource.label : <em>No title</em>} </h2>
                {altMetrics && (
                    <div className="flex-shrink-0 me-2">
                        <small>
                            <a href={altMetrics.details_url} target="_blank" rel="noopener noreferrer">
                                <img src={altMetrics.images.small} height="60px" alt="Alt metrics icon" />
                            </a>
                        </small>
                    </div>
                )}
            </div>

            <div className="clearfix" />

            {(viewPaper.publicationMonth?.label || viewPaper.publicationYear?.label) && (
                <span className="badge bg-light me-2">
                    <Icon icon={faCalendar} className="text-primary" />{' '}
                    {viewPaper.publicationMonth?.label ? moment(viewPaper.publicationMonth.label, 'M').format('MMMM') : ''}{' '}
                    {viewPaper.publicationYear?.label ? viewPaper.publicationYear.label : ''}
                </span>
            )}
            <ResearchFieldBadge researchField={viewPaper.researchField} />
            <AuthorBadges authors={viewPaper.authors} />
            <br />
            <div className="d-flex justify-content-end align-items-center">
                {viewPaper.publishedIn && viewPaper.publishedIn.id && (
                    <div className="flex-grow-1">
                        <small>
                            Published in:{' '}
                            <Link
                                style={{ color: '#60687a', fontStyle: 'italic' }}
                                to={reverse(ROUTES.VENUE_PAGE, { venueId: viewPaper.publishedIn.id })}
                            >
                                {viewPaper.publishedIn.label}
                            </Link>
                        </small>
                    </div>
                )}

                {viewPaper.doi && viewPaper.doi.label?.startsWith('10.') && (
                    <div className="flex-shrink-0">
                        <small>
                            DOI:{' '}
                            <a href={`https://doi.org/${viewPaper.doi.label}`} target="_blank" rel="noopener noreferrer">
                                {viewPaper.doi.label}
                            </a>
                        </small>
                    </div>
                )}

                {viewPaper.doi &&
                    viewPaper.doi.length &&
                    viewPaper.doi.length > 0 &&
                    viewPaper.doi.map(
                        doi =>
                            !doi.label.startsWith(env('DATACITE_DOI_PREFIX')) && (
                                <div className="flex-shrink-0">
                                    <small>
                                        DOI:
                                        {console.log(doi.label)}
                                        <a href={`https://doi.org/${doi.label}`} target="_blank" rel="noopener noreferrer">
                                            {doi.label}
                                        </a>
                                    </small>
                                </div>
                            )
                    )}
            </div>
        </>
    );
};

export default PaperVersionHeader;

import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import ROUTES from '@/constants/routes';
import { getAltMetrics } from '@/services/altmetric/index';

const PaperVersionHeader = () => {
    const viewPaper = useSelector((state) => state.viewPaper.paper, shallowEqual);
    const [altMetrics, setAltMetrics] = useState(null);

    useEffect(() => {
        if (!viewPaper.identifiers?.doi?.[0]) {
            return;
        }
        const loadAltMetrics = async () => {
            const altMetrics = await getAltMetrics(!viewPaper.identifiers?.doi?.[0]);
            setAltMetrics(altMetrics);
        };
        loadAltMetrics();
    }, [viewPaper.identifiers]);

    return (
        <>
            <div className="d-flex align-items-start">
                <h2 className="h4 mt-4 mb-3 flex-grow-1">{viewPaper.title ?? <em>No title</em>} </h2>
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
            {(viewPaper.publication_info?.published_month || viewPaper.publication_info?.published_year) && (
                <span className="badge bg-light me-2">
                    <FontAwesomeIcon icon={faCalendar} />{' '}
                    {viewPaper.publication_info?.published_month
                        ? dayjs()
                              .month(viewPaper.publication_info?.published_month - 1)
                              .format('MMMM')
                        : ''}{' '}
                    {viewPaper.publication_info?.published_year ? viewPaper.publication_info?.published_year : ''}
                </span>
            )}
            <ResearchFieldBadge researchField={viewPaper.research_fields?.[0]} />
            <AuthorBadges authors={viewPaper.authors} />
            <br />
            <div className="d-flex justify-content-end align-items-center">
                {viewPaper.publication_info.published_in && viewPaper.publication_info.published_in?.id && (
                    <div className="flex-grow-1">
                        <small>
                            Published in:{' '}
                            <Link
                                style={{ color: '#60687a', fontStyle: 'italic' }}
                                href={reverse(ROUTES.VENUE_PAGE, { venueId: viewPaper.publication_info.published_in?.id })}
                            >
                                {viewPaper.publication_info.published_in?.label}
                            </Link>
                        </small>
                    </div>
                )}

                {viewPaper.identifiers?.doi?.[0] && (
                    <div className="flex-shrink-0">
                        <small>
                            DOI:{' '}
                            <a href={`https://doi.org/${viewPaper.identifiers?.doi?.[0]}`} target="_blank" rel="noopener noreferrer">
                                https://doi.org/{viewPaper.identifiers?.doi?.[0]}
                            </a>
                        </small>
                    </div>
                )}
            </div>
        </>
    );
};

export default PaperVersionHeader;

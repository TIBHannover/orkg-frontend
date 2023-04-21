import { Alert, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import { ENTITIES } from 'constants/graphSettings';
import Video from 'components/ValuePlugins/Video/Video';
import OrganizationBanner from 'components/Comparison/ComparisonFooter/ProvenanceBox/OrganizationBanner';
import MarkFeaturedUnlistedContainer from 'components/Comparison/ComparisonHeader/MarkFeaturedUnlistedContainer';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import moment from 'moment';
import ROUTES from 'constants/routes.js';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { CONFERENCE_REVIEW_MISC } from 'constants/organizationsTypes';

const ComparisonMetaData = () => {
    const comparisonResource = useSelector(state => state.comparison.comparisonResource);
    const provenance = useSelector(state => state.comparison.provenance);

    const isLoadingMetadata = useSelector(state => state.comparison.isLoadingMetadata);
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const isFailedLoadingResult = useSelector(state => state.comparison.isFailedLoadingResult);
    const errors = useSelector(state => state.comparison.errors);
    const contributionsList = useSelector(state => state.comparison.configuration.contributionsList);
    const navigate = useNavigate();

    /**
     * Is case of an error the user can go to the previous link in history
     */
    const handleGoBack = () => {
        navigate(-1);
    };

    const isDoubleBlind =
        provenance?.metadata?.review_process === CONFERENCE_REVIEW_MISC.DOUBLE_BLIND &&
        moment().format('YYYY-MM-DD') < provenance?.metadata?.start_date;

    const ldJson = {
        mainEntity: {
            headline: comparisonResource?.label,
            description: comparisonResource?.description,
            ...(comparisonResource?.doi ? { sameAs: `https://doi.org/${comparisonResource.doi}` } : {}),
            author: comparisonResource.authors?.map(author => ({
                name: author.label,
                ...(author.orcid ? { url: `http://orcid.org/${author.orcid}` } : {}),
                '@type': 'Person',
            })),
            datePublished: comparisonResource.createdAt ? moment(comparisonResource.createdAt).format('DD MMMM YYYY') : '',
            about: comparisonResource.researchField?.label,
            '@type': 'ScholarlyArticle',
        },
        '@context': 'https://schema.org',
        '@type': 'WebPage',
    };

    return (
        <>
            <Helmet>
                <title>{`${comparisonResource?.label ?? 'Unpublished'} - Comparison - ORKG`}</title>
                <meta property="og:title" content={`${comparisonResource?.label ?? 'Unpublished'} - Comparison - ORKG`} />
                <meta property="og:type" content="article" />
                <meta property="og:description" content={comparisonResource?.description} />
                <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
            </Helmet>
            {!!comparisonResource.id && <ShareLinkMarker typeOfLink="comparison" title={comparisonResource?.label} />}
            {!isLoadingMetadata && (isFailedLoadingResult || isFailedLoadingMetadata) && (
                <div className="py-4">
                    {isFailedLoadingResult && contributionsList.length < 2 ? (
                        <>
                            <div className="clearfix" />
                            <Alert color="info">Please select a minimum of two research contributions to compare on.</Alert>
                        </>
                    ) : (
                        <Alert color="danger">
                            {errors ? (
                                <>{errors}</>
                            ) : (
                                <>
                                    <strong>Error.</strong> The comparison service is unreachable. Please come back later and try again.{' '}
                                    <span
                                        className="btn-link"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleGoBack}
                                        onKeyDown={e => (e.key === 'Enter' ? handleGoBack : undefined)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        Go back
                                    </span>{' '}
                                    or <Link to={ROUTES.HOME}>go to the homepage</Link>.
                                </>
                            )}
                        </Alert>
                    )}
                </div>
            )}

            {!!comparisonResource.id && !isFailedLoadingMetadata && !isFailedLoadingResult && (
                <div className="pt-2 pb-3">
                    <div className="p-0 d-flex align-items-start">
                        <div className="flex-grow-1">
                            {(comparisonResource.label || comparisonResource.id) && (
                                <>
                                    <h4 className="mb-2 mt-4">
                                        {comparisonResource.label}{' '}
                                        {comparisonResource.id && (
                                            <MarkFeaturedUnlistedContainer
                                                size="xs"
                                                id={comparisonResource?.id}
                                                featured={comparisonResource?.featured}
                                                unlisted={comparisonResource?.unlisted}
                                            />
                                        )}
                                    </h4>
                                    <div>
                                        <div>
                                            {comparisonResource.created_at && (
                                                <Badge color="light" className="me-2 mb-2">
                                                    <Icon icon={faCalendar} />{' '}
                                                    {comparisonResource.created_at ? moment(comparisonResource.created_at).format('MMMM') : ''}{' '}
                                                    {comparisonResource.created_at ? moment(comparisonResource.created_at).format('YYYY') : ''}
                                                </Badge>
                                            )}
                                            {comparisonResource.authors?.length > 0 && !isDoubleBlind && (
                                                <AuthorBadges authors={comparisonResource.authors} />
                                            )}
                                        </div>
                                        {comparisonResource.description && (
                                            <div style={{ lineHeight: 1.5 }} className="h6 mb-2">
                                                {comparisonResource.description}
                                            </div>
                                        )}
                                        {comparisonResource.doi && (
                                            <div className="mb-1" style={{ lineHeight: 1.5 }}>
                                                <small>
                                                    DOI:{' '}
                                                    <a href={`https://doi.org/${comparisonResource.doi}`} target="_blank" rel="noopener noreferrer">
                                                        https://doi.org/{comparisonResource.doi}
                                                    </a>
                                                </small>
                                            </div>
                                        )}
                                        {comparisonResource.video && (
                                            <small className="d-flex mb-1">
                                                <div className="me-2">Video: </div>
                                                <Video options={{ inModal: true }} type={ENTITIES.LITERAL}>
                                                    {comparisonResource.video.label}
                                                </Video>
                                            </small>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {comparisonResource.id && <OrganizationBanner />}
                    </div>
                </div>
            )}
        </>
    );
};

export default ComparisonMetaData;

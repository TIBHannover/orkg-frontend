import Link from 'components/NextJsMigration/Link';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import OrganizationBanner from 'components/Comparison/ComparisonFooter/ProvenanceBox/OrganizationBanner';
import MarkFeaturedUnlistedContainer from 'components/Comparison/ComparisonHeader/MarkFeaturedUnlistedContainer';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import LinkValuePlugins from 'components/ValuePlugins/Link/Link';
import Video from 'components/ValuePlugins/Video/Video';
import { ENTITIES } from 'constants/graphSettings';
import { CONFERENCE_REVIEW_MISC } from 'constants/organizationsTypes';
import ROUTES from 'constants/routes.js';
import moment from 'moment';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import useRouter from 'components/NextJsMigration/useRouter';
import { Alert, Badge } from 'reactstrap';
import { LICENSE_URL } from 'constants/misc';

const ComparisonMetaData = () => {
    const comparisonResource = useSelector(state => state.comparison.comparisonResource);
    const provenance = useSelector(state => state.comparison.provenance);

    const isLoadingMetadata = useSelector(state => state.comparison.isLoadingMetadata);
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const isFailedLoadingResult = useSelector(state => state.comparison.isFailedLoadingResult);
    const errors = useSelector(state => state.comparison.errors);
    const contributionsList = useSelector(state => state.comparison.configuration.contributionsList);
    const router = useRouter();

    /**
     * Is case of an error the user can go to the previous link in history
     */
    const handleGoBack = () => {
        router.push(-1);
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
            license: LICENSE_URL,
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
                                    or <Link href={ROUTES.HOME}>go to the homepage</Link>.
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
                                            {comparisonResource.authors?.length > 0 && !isDoubleBlind && !comparisonResource.anonymized && (
                                                <AuthorBadges authors={comparisonResource.authors} />
                                            )}
                                        </div>
                                        {comparisonResource.description && (
                                            <div style={{ lineHeight: 1.5 }} className="h6 mb-2">
                                                <LinkValuePlugins type={ENTITIES.LITERAL}>{comparisonResource.description}</LinkValuePlugins>
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

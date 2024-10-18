import NotFound from 'app/not-found';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import GraphViewModal from 'components/GraphView/GraphViewModal';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import TitleBar from 'components/TitleBar/TitleBar';
import Contributions from 'components/ViewPaper/Contributions/Contributions';
import PaperHeader from 'components/ViewPaper/PaperHeader';
import PaperHeaderBar from 'components/ViewPaper/PaperHeaderBar/PaperHeaderBar';
import PaperMenuBar from 'components/ViewPaper/PaperHeaderBar/PaperMenuBar';
import useViewPaper from 'components/ViewPaper/hooks/useViewPaper';
import useParams from 'components/useParams/useParams';
import { LICENSE_URL } from 'constants/misc';
import moment from 'moment';
import { env } from 'next-runtime-env';
import { Helmet } from 'react-helmet';
import { InView } from 'react-intersection-observer';
import { useSelector } from 'react-redux';
import { Container } from 'reactstrap';

const ViewPaper = () => {
    const { resourceId } = useParams();
    const viewPaper = useSelector((state) => state.viewPaper.paper);
    const { isLoading, isLoadingFailed, showHeaderBar, isEditMode, showGraphModal, toggle, handleShowHeaderBar, setShowGraphModal } = useViewPaper({
        paperId: resourceId,
    });
    const getSEODescription = () =>
        `Published: ${viewPaper.publication_info?.published_month ? moment(viewPaper.publication_info?.published_month, 'M').format('MMMM') : ''} ${
            viewPaper.publication_info?.published_year ? viewPaper.publication_info?.published_year : ''
        } • Research field: ${viewPaper?.research_fields?.[0]?.label} • Authors: ${viewPaper?.authors?.map((author) => author.name).join(', ')}`;

    const ldJson = {
        mainEntity: {
            headline: viewPaper.title,
            description: getSEODescription(),
            ...(viewPaper?.identifiers?.doi?.[0] ? { sameAs: `https://doi.org/${viewPaper?.identifiers?.doi?.[0]}` } : {}),
            author: viewPaper?.authors?.map((author) => ({
                name: author.name,
                ...(author?.identifiers?.orcid?.[0] ? { url: `http://orcid.org/${author?.identifiers?.orcid?.[0]}` } : {}),
                '@type': 'Person',
            })),
            datePublished: `${
                viewPaper.publication_info?.published_month ? moment(viewPaper.publication_info?.published_month, 'M').format('MMMM') : ''
            } ${viewPaper.publication_info?.published_year ? viewPaper.publication_info?.published_year : ''}`,
            about: viewPaper?.research_fields?.[0]?.label,
            license: LICENSE_URL,
            '@type': 'ScholarlyArticle',
        },
        '@context': 'https://schema.org',
        '@type': 'WebPage',
    };

    return (
        <div>
            {!isLoading && isLoadingFailed && <NotFound />}
            {!isLoadingFailed && (
                <>
                    {showHeaderBar && (
                        <PaperHeaderBar disableEdit={env('NEXT_PUBLIC_PWC_USER_ID') === viewPaper.createdBy} editMode={isEditMode} toggle={toggle} />
                    )}
                    <Breadcrumbs researchFieldId={viewPaper.research_fields.length > 0 ? viewPaper.research_fields?.[0]?.id : null} />

                    <Helmet>
                        <title>{`${viewPaper.title ?? 'Paper'} - ORKG`}</title>
                        <meta property="og:title" content={`${viewPaper.title} - ORKG`} />
                        <meta property="og:type" content="article" />
                        <meta property="og:description" content={getSEODescription()} />
                        <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
                    </Helmet>
                    <InView as="div" onChange={(inView) => handleShowHeaderBar(inView)}>
                        <TitleBar
                            buttonGroup={
                                <PaperMenuBar
                                    disableEdit={env('NEXT_PUBLIC_PWC_USER_ID') === viewPaper.createdBy}
                                    editMode={isEditMode}
                                    toggle={toggle}
                                />
                            }
                        >
                            Paper
                        </TitleBar>
                    </InView>

                    <EditModeHeader isVisible={isEditMode} />

                    <Container
                        className={`box pt-md-4 pb-md-4 ps-md-5 pe-md-5 pt-sm-2 pb-sm-2 ps-sm-2 pe-sm-2 clearfix position-relative 
                                ${isEditMode ? 'rounded-bottom' : 'rounded'}`}
                    >
                        {!isLoading && <ShareLinkMarker typeOfLink="paper" title={viewPaper.title} />}

                        {isLoading && (
                            <ContentLoader height="100%" width="100%" viewBox="0 0 100 10" style={{ width: '100% !important' }} speed={2}>
                                <rect x="0" y="0" width="80" height="4" />
                                <rect x="0" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="12" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="24" y="6" rx="1" ry="1" width="10" height="2" />
                                <rect x="36" y="6" rx="1" ry="1" width="10" height="2" />
                            </ContentLoader>
                        )}
                        {!isLoading && !isLoadingFailed && <PaperHeader editMode={isEditMode} />}
                        {!isLoading && (
                            <>
                                <hr className="mt-3" />

                                <Contributions enableEdit={isEditMode} />

                                <ComparisonPopup />
                            </>
                        )}
                    </Container>
                </>
            )}

            {showGraphModal && <GraphViewModal toggle={() => setShowGraphModal((v) => !v)} resourceId={resourceId} />}
        </div>
    );
};

export default ViewPaper;

import env from '@beam-australia/react-env';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';
import ShareLinkMarker from 'components/ShareLinkMarker/ShareLinkMarker';
import TitleBar from 'components/TitleBar/TitleBar';
import Contributions from 'components/ViewPaper/Contributions/Contributions';
import useViewPaper from 'components/ViewPaper/hooks/useViewPaper';
import PaperHeader from 'components/ViewPaper/PaperHeader';
import PaperHeaderBar from 'components/ViewPaper/PaperHeaderBar/PaperHeaderBar';
import PaperMenuBar from 'components/ViewPaper/PaperHeaderBar/PaperMenuBar';
import moment from 'moment';
import NotFound from 'pages/NotFound';
import ContentLoader from 'react-content-loader';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import VisibilitySensor from 'react-visibility-sensor';
import { Container } from 'reactstrap';
import GraphViewModal from 'components/GraphView/GraphViewModal';

const ViewPaper = () => {
    const { resourceId } = useParams();
    const viewPaper = useSelector(state => state.viewPaper);
    const {
        isLoading,
        isLoadingFailed,
        showHeaderBar,
        isEditMode,
        showGraphModal,
        toggle,
        handleShowHeaderBar,
        toggleIsEditMode,
        setShowGraphModal,
    } = useViewPaper({
        paperId: resourceId,
    });

    const getSEODescription = () =>
        `Published: ${viewPaper.publicationMonth ? moment(viewPaper.publicationMonth.label, 'M').format('MMMM') : ''} ${
            viewPaper.publicationYear ? viewPaper.publicationYear.label : ''
        } • Research field: ${viewPaper?.researchField?.label} • Authors: ${viewPaper?.authors?.map(author => author.label).join(', ')}`;

    const ldJson = {
        mainEntity: {
            headline: viewPaper.paperResource?.label,
            description: getSEODescription(),
            ...(viewPaper?.doi?.label ? { sameAs: `https://doi.org/${viewPaper.doi.label}` } : {}),
            author: viewPaper?.authors?.map(author => ({
                name: author.label,
                ...(author.orcid ? { url: `http://orcid.org/${author.orcid}` } : {}),
                '@type': 'Person',
            })),
            datePublished: `${viewPaper?.publicationMonth ? moment(viewPaper?.publicationMonth?.label, 'M').format('MMMM') : ''} ${
                viewPaper?.publicationYear ? viewPaper?.publicationYear?.label : ''
            }`,
            about: viewPaper?.researchField?.label,
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
                        <PaperHeaderBar
                            disableEdit={env('PWC_USER_ID') === viewPaper.paperResource.created_by}
                            editMode={isEditMode}
                            toggle={toggle}
                        />
                    )}
                    <Breadcrumbs researchFieldId={viewPaper.researchField ? viewPaper.researchField.id : null} />

                    <Helmet>
                        <title>{`${viewPaper.paperResource?.label ?? 'Paper'} - ORKG`}</title>
                        <meta property="og:title" content={`${viewPaper.paperResource?.label} - ORKG`} />
                        <meta property="og:type" content="article" />
                        <meta property="og:description" content={getSEODescription()} />
                        <script type="application/ld+json">{JSON.stringify(ldJson)}</script>
                    </Helmet>

                    <VisibilitySensor onChange={handleShowHeaderBar}>
                        <TitleBar
                            buttonGroup={
                                <PaperMenuBar
                                    disableEdit={env('PWC_USER_ID') === viewPaper.paperResource.created_by}
                                    editMode={isEditMode}
                                    toggle={toggle}
                                />
                            }
                        >
                            View paper
                        </TitleBar>
                    </VisibilitySensor>

                    <EditModeHeader isVisible={isEditMode} />

                    <Container
                        className={`box pt-md-4 pb-md-4 ps-md-5 pe-md-5 pt-sm-2 pb-sm-2 ps-sm-2 pe-sm-2 clearfix position-relative 
                                ${isEditMode ? 'rounded-bottom' : 'rounded'}`}
                    >
                        {!isLoading && <ShareLinkMarker typeOfLink="paper" title={viewPaper.paperResource.label} />}

                        {isLoading && (
                            <ContentLoader
                                height="100%"
                                width="100%"
                                viewBox="0 0 100 10"
                                style={{ width: '100% !important' }}
                                speed={2}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
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

                                <Contributions enableEdit={isEditMode} toggleEditMode={toggleIsEditMode} />

                                <ComparisonPopup />
                            </>
                        )}
                    </Container>
                </>
            )}

            {showGraphModal && <GraphViewModal toggle={() => setShowGraphModal(v => !v)} resourceId={resourceId} />}
        </div>
    );
};

export default ViewPaper;

'use client';

import { Separator, Skeleton } from '@heroui/react';
import { env } from 'next-runtime-env';
import { InView } from 'react-intersection-observer';

import NotFound from '@/app/not-found';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import EditModeHeader from '@/components/EditModeHeader/EditModeHeader';
import GraphViewModal from '@/components/GraphView/GraphViewModal';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import Contributions from '@/components/ViewPaper/Contributions/Contributions';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import PaperHeader from '@/components/ViewPaper/PaperHeader';
import PaperHeaderBar from '@/components/ViewPaper/PaperHeaderBar/PaperHeaderBar';
import PaperMenuBar from '@/components/ViewPaper/PaperHeaderBar/PaperMenuBar';

const ViewPaper = () => {
    const { resourceId } = useParams();
    const {
        paper: viewPaper,
        isLoading,
        isLoadingFailed,
        showHeaderBar,
        isEditMode,
        showGraphModal,
        toggle,
        handleShowHeaderBar,
        setShowGraphModal,
    } = useViewPaper({
        paperId: resourceId,
    });

    return (
        <div>
            {!isLoading && isLoadingFailed && <NotFound />}
            {!isLoading && !isLoadingFailed && viewPaper && (
                <>
                    {showHeaderBar && (
                        <PaperHeaderBar disableEdit={env('NEXT_PUBLIC_PWC_USER_ID') === viewPaper.created_by} editMode={isEditMode} toggle={toggle} />
                    )}
                    <Breadcrumbs
                        researchFieldId={
                            viewPaper?.research_fields && viewPaper.research_fields.length > 0 ? viewPaper.research_fields?.[0]?.id : null
                        }
                    />

                    <InView as="div" initialInView={false} onChange={(inView) => handleShowHeaderBar(inView)}>
                        <TitleBar
                            buttonGroup={
                                <PaperMenuBar
                                    disableEdit={env('NEXT_PUBLIC_PWC_USER_ID') === viewPaper.created_by}
                                    editMode={isEditMode}
                                    toggle={toggle}
                                />
                            }
                        >
                            Paper
                        </TitleBar>
                    </InView>

                    <EditModeHeader isVisible={isEditMode} />

                    <Container>
                        <div className={`box flow-root relative p-4 md:p-12 ${isEditMode ? 'rounded-b' : 'rounded'}`}>
                            {isLoading && (
                                <div className="flex flex-col gap-3">
                                    <Skeleton className="w-4/5 h-4 rounded" />
                                    <div className="flex gap-2">
                                        <Skeleton className="w-20 h-2 rounded" />
                                        <Skeleton className="w-20 h-2 rounded" />
                                        <Skeleton className="w-20 h-2 rounded" />
                                        <Skeleton className="w-20 h-2 rounded" />
                                    </div>
                                </div>
                            )}
                            {!isLoading && !isLoadingFailed && <PaperHeader editMode={isEditMode} isPublishedVersionView={false} />}
                            {!isLoading && (
                                <>
                                    <Separator className="my-3" />
                                    <Contributions enableEdit={isEditMode} />
                                </>
                            )}
                        </div>
                    </Container>
                </>
            )}
            {showGraphModal && <GraphViewModal toggle={() => setShowGraphModal((v) => !v)} resourceId={resourceId} />}
        </div>
    );
};

export default ViewPaper;

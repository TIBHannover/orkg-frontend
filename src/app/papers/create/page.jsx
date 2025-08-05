'use client';

import { reverse } from 'named-urls';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import AddPaperAdditionalButtons from '@/components/PaperForm/AddPaperAdditionalButtons';
import useAddPaper from '@/components/PaperForm/hooks/useAddPaper';
import PaperForm from '@/components/PaperForm/PaperForm';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';

const AddPaper = () => {
    const [isLoadingParsing, setIsLoadingParsing] = useState(false);
    const [isMetadataExpanded, setIsMetadataExpanded] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const onCreate = ({ paperId }) => {
        router.push(`${reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}?isEditMode=true`);
    };

    const {
        doi,
        title,
        researchField,
        authors,
        publicationMonth,
        publicationYear,
        publishedIn,
        isLoading,
        url,
        abstract,
        setDoi,
        setTitle,
        setResearchField,
        setAuthors,
        setPublicationMonth,
        setPublicationYear,
        setPublishedIn,
        setUrl,
        setAbstract,
        setExtractedContributionData,
        ExistingPaperModels,
        handleSave,
        savePaper,
    } = useAddPaper({ onCreate });

    useEffect(() => {
        document.title = 'Add paper - ORKG';
        const entry = searchParams.get('entry');
        const queryParamTitle = searchParams.get('title');
        if (entry) {
            setDoi(entry);
        }
        if (!entry && queryParamTitle) {
            setTitle(queryParamTitle);
            setIsMetadataExpanded(true);
        }
    }, [searchParams, setDoi, setTitle, setIsMetadataExpanded]);

    return (
        <div>
            <TitleBar
                buttonGroup={
                    <AddPaperAdditionalButtons
                        doi={doi}
                        title={title}
                        authors={authors}
                        publicationMonth={publicationMonth}
                        publicationYear={publicationYear}
                        publishedIn={publishedIn}
                        url={url}
                        setDoi={setDoi}
                        setTitle={setTitle}
                        setResearchField={setResearchField}
                        setAuthors={setAuthors}
                        setPublicationMonth={setPublicationMonth}
                        setPublicationYear={setPublicationYear}
                        setPublishedIn={setPublishedIn}
                        setUrl={setUrl}
                        setIsMetadataExpanded={setIsMetadataExpanded}
                        setExtractedContributionData={setExtractedContributionData}
                    />
                }
            >
                Add paper
            </TitleBar>
            <Container className="box rounded py-4 px-5">
                <PaperForm
                    isLoadingParsing={isLoadingParsing}
                    setIsLoadingParsing={setIsLoadingParsing}
                    doi={doi}
                    setDoi={setDoi}
                    title={title}
                    setTitle={setTitle}
                    researchField={researchField}
                    setResearchField={setResearchField}
                    authors={authors}
                    setAuthors={setAuthors}
                    publicationMonth={publicationMonth}
                    setPublicationMonth={setPublicationMonth}
                    publicationYear={publicationYear}
                    setPublicationYear={setPublicationYear}
                    publishedIn={publishedIn}
                    setPublishedIn={setPublishedIn}
                    url={url}
                    setUrl={setUrl}
                    abstract={abstract}
                    setAbstract={setAbstract}
                    isNewPaper
                    isMetadataExpanded={isMetadataExpanded}
                    setIsMetadataExpanded={setIsMetadataExpanded}
                />

                <hr />
                <div className="d-flex justify-content-end">
                    <span>
                        <span className="text-muted fst-italic me-4">After adding the paper, you will be able to add structured data</span>
                        <RequireAuthentication
                            component={ButtonWithLoading}
                            color="primary"
                            onClick={handleSave}
                            isDisabled={isLoadingParsing}
                            isLoading={isLoading}
                        >
                            Add paper
                        </RequireAuthentication>
                    </span>
                </div>
            </Container>
            <ExistingPaperModels onContinue={savePaper} />
        </div>
    );
};

export default AddPaper;

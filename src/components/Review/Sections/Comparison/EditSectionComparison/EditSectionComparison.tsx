import { Cite } from '@citation-js/core';
import { uniq } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import { Alert } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import { OptionType } from '@/components/Autocomplete/types';
import useReview from '@/components/Review/hooks/useReview';
import SectionComparison from '@/components/Review/Sections/Comparison/SectionComparison';
import Button from '@/components/Ui/Button/Button';
import { CLASSES, ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { getComparison } from '@/services/backend/comparisons';
import { getPaper } from '@/services/backend/papers';
import { createResourceStatement, getStatements, updateStatement } from '@/services/backend/statements';
import { ReviewSection, Statement } from '@/services/backend/types';

type EditSectionComparisonProps = {
    section: ReviewSection;
    index: number;
};

const EditSectionComparison: FC<EditSectionComparisonProps> = ({ section, index }) => {
    const [shouldShowOntologyAlert, setShouldShowOntologyAlert] = useState(false);
    const [selectedResource, setSelectedResource] = useState<OptionType | null>(null);

    const { review, createSection, parsedReferences, updateReview, mutate } = useReview();

    useEffect(() => {
        const sectionContent = section.comparison;

        // only run on mount
        if (!sectionContent || selectedResource) {
            return;
        }
        setSelectedResource({
            label: sectionContent.label,
            id: sectionContent.id,
        });
    }, [section, selectedResource]);

    if (!review) {
        return null;
    }

    // it requires quite a lot of requests to get the metadata of the papers used in a comparison
    const getPaperMetadataFromComparison = async (comparisonId: string) => {
        const comparison = await getComparison(comparisonId);
        const contributionIds = comparison.contributions.map(({ id }) => id);
        const paperStatementsPromises = contributionIds.map((contributionId) =>
            getStatements({ predicateId: PREDICATES.HAS_CONTRIBUTION, objectId: contributionId }),
        );
        const paperIds = uniq(
            (await Promise.all(paperStatementsPromises)).flatMap((statements) => statements as Statement[]).map((statement) => statement.subject.id),
        );

        const papers = await Promise.all(paperIds.map((paperId) => getPaper(paperId)));
        const references: string[] = [];
        for (const paper of papers) {
            const bibJson = {
                id: paper.id,
                title: paper.title,
                author: paper.authors?.map((author) => ({ name: author.name })),
                year: paper.publication_info.published_year,
            };
            // debugger;
            const parsedReference = await Cite.async(bibJson);
            const parsedReferenceData = parsedReference?.data?.[0];
            if (!parsedReferenceData) {
                continue;
            }
            parsedReferenceData['citation-label'] = paper.id;
            const bibtex: string = parsedReference.format('bibtex'); // use the paper ID as key, so we can identify it to add in the _usedReferences later
            parsedReferenceData.id = paper.id; // set citation-label, later used to get the citation key
            const isExistingReference = parsedReferences.find((reference) => reference?.parsedReference?.id === paper.id);
            if (!isExistingReference) {
                references.push(bibtex);
            }
        }
        updateReview({
            references: [...review.references, ...references],
        });
    };

    const handleItemSelected = async (selected: SingleValue<OptionType>) => {
        if (!selected?.id) {
            return;
        }

        const { label, id } = selected;

        setSelectedResource({ id, label });
        setShouldShowOntologyAlert(true);

        // Start: Backend issue doesn't allow setting the comparison currently, so for now manually creating the statement
        // see issue: https://gitlab.com/TIBHannover/orkg/orkg-backend/-/issues/602

        const sectionStatements = await getStatements({ subjectId: section.id, predicateId: PREDICATES.HAS_LINK });

        if (sectionStatements.length > 0) {
            await updateStatement(sectionStatements?.[0].id, {
                subject_id: section.id,
                predicate_id: PREDICATES.HAS_LINK,
                object_id: id,
            });
        } else {
            await createResourceStatement(section.id, PREDICATES.HAS_LINK, id);
        }
        mutate();

        // updateSection(section.id, {
        //     heading: section.heading,
        //     comparison: id,
        // });

        // End: creating comparison statement

        // paper metadata is needed to add it automatically to the reference list
        getPaperMetadataFromComparison(id);
    };

    const handleAddOntologySection = () => {
        setShouldShowOntologyAlert(false);
        createSection({
            atIndex: index,
            sectionType: 'ontology',
        });
        toast.success('Ontology section has been added successfully below the comparison');
    };

    const hasValue = selectedResource && selectedResource?.id;

    return (
        <div>
            <SelectGlobalStyle />
            <Autocomplete
                entityType={ENTITIES.RESOURCE}
                includeClasses={[CLASSES.COMPARISON_PUBLISHED]}
                placeholder="Select a comparison"
                onChange={handleItemSelected}
                value={selectedResource}
                openMenuOnFocus={false}
                allowCreate={false}
            />

            {hasValue && (
                <>
                    <Alert color="info" className="my-3" isOpen={shouldShowOntologyAlert} toggle={() => setShouldShowOntologyAlert(false)}>
                        Do you want to add an ontology section for this comparison?{' '}
                        <Button color="link" className="p-0" onClick={handleAddOntologySection}>
                            Add section
                        </Button>
                    </Alert>
                    <SectionComparison section={section} />
                </>
            )}
        </div>
    );
};

export default EditSectionComparison;

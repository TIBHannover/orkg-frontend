import { FC, useEffect, useState } from 'react';
import { ActionMeta, SingleValue } from 'react-select';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import DataBrowser from '@/components/DataBrowser/DataBrowser';
import useReview from '@/components/Review/hooks/useReview';
import SectionVisualization from '@/components/Review/Sections/Visualization/SectionVisualization';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { createResource } from '@/services/backend/resources';
import { ReviewSectionContentLink } from '@/services/backend/types';

type ContentLinkProps = {
    section: ReviewSectionContentLink;
};

export type SectionContentLinkTypes = 'resource' | 'predicate' | 'visualization';

const ContentLink: FC<ContentLinkProps> = ({ section }) => {
    const { review, updateSection } = useReview();
    const [selectedResource, setSelectedResource] = useState<OptionType | null>(null);

    useEffect(() => {
        let sectionContent;
        if (section.type === 'resource') {
            sectionContent = section.resource;
        } else if (section.type === 'property') {
            sectionContent = section.predicate;
        } else {
            sectionContent = section.visualization;
        }

        // only run on mount
        if (!sectionContent || selectedResource) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedResource({
            label: sectionContent.label,
            id: sectionContent.id,
        });
    }, [section, selectedResource]);

    // by updating the key of the statement browser, we can force a destroying the component and recreating it
    const [statementBrowserKey, setStatementBrowserKey] = useState(0);

    if (!review) {
        return null;
    }

    const handleItemSelected = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
        if (!selected) {
            return;
        }
        const { label } = selected;
        let { id } = selected;

        if (action === 'create-option') {
            const newResourceId = await createResource({ label, classes: [] });
            id = newResourceId;
        }

        if (!id) {
            return;
        }

        setSelectedResource({ id, label });
        setStatementBrowserKey((current) => current + 1);

        // each variant must carry its reference field — an incomplete payload matches no
        // request-union variant and would serialize as {}
        if (section.type === 'resource') {
            updateSection(section.id, { heading: section.heading, resource: id });
        } else if (section.type === 'property') {
            updateSection(section.id, { heading: section.heading, predicate: id });
        } else {
            updateSection(section.id, { heading: section.heading, visualization: id });
        }
    };

    const entityType = section.type === 'property' ? ENTITIES.PREDICATE : ENTITIES.RESOURCE;
    const hasValue = selectedResource && selectedResource?.id;
    let optionsClasses: string[] = [];

    if (section.type === 'visualization') {
        optionsClasses = [CLASSES.VISUALIZATION];
    }

    return (
        <div>
            <Autocomplete
                excludeClasses={
                    section.type === 'resource'
                        ? [
                              CLASSES.PAPER,
                              CLASSES.CONTRIBUTION,
                              CLASSES.NODE_SHAPE,
                              CLASSES.RESEARCH_FIELD,
                              CLASSES.PROPERTY_SHAPE,
                              CLASSES.PAPER_DELETED,
                              CLASSES.CONTRIBUTION_DELETED,
                          ]
                        : []
                }
                entityType={entityType}
                includeClasses={optionsClasses}
                placeholder={`Select a ${section.type}`}
                onChange={handleItemSelected}
                value={selectedResource}
                openMenuOnFocus={false}
                allowCreate={section.type === 'resource'} // only allow create for resources
            />
            {(section.type === 'resource' || section.type === 'property') && hasValue && (
                <DataBrowser isEditMode id={selectedResource.id} key={statementBrowserKey} />
            )}
            {section.type === 'visualization' && hasValue && <SectionVisualization id={selectedResource.id} label={selectedResource.label} />}
        </div>
    );
};

export default ContentLink;

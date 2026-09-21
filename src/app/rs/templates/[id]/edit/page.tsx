'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import useAuthentication from '@/components/hooks/useAuthentication';
import RosettaTemplateEditor from '@/components/RosettaStone/RosettaTemplateEditor/RosettaTemplateEditor';
import RosettaTemplateEditorProvider from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getStatusCode } from '@/services/backend/problemDetails';
import { getRSStatements, getRSTemplate, rosettaStoneUrl } from '@/services/backend/rosettaStone';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { RosettaStoneTemplate, RSPropertyShape } from '@/services/backend/types';
import { guid } from '@/utils';

const RSTemplateEditPage = () => {
    const { id } = useParams<{ id: string; activeTab: string }>();
    const { user } = useAuthentication();

    const { data: template, isLoading, error } = useSWR(id ? [id, rosettaStoneUrl, 'getRSTemplate'] : null, ([params]) => getRSTemplate(params));
    const { data: rsStatements, isLoading: isLoadingRSStatements } = useSWR(id ? [id, rosettaStoneUrl, 'getRSStatements'] : null, ([params]) =>
        getRSStatements({ size: 1, templateId: params }),
    );
    const { data: statements, isLoading: isLoadingStatements } = useSWR(id ? [id, statementsUrl, 'getStatements'] : null, ([params]) =>
        getStatements({ objectId: params, size: 1, returnContent: false }),
    );
    const router = useRouter();

    useEffect(() => {
        document.title = `${template?.label ?? ''} - Edit Statement template - ORKG`;
    }, [template]);

    const extractPositions = (formatted_label: string) => {
        // Regular expression to match the pattern within square brackets
        const regex = /\[(.*?)\]/g;
        // Extract all matches using the regex
        const matches = formatted_label.match(regex);
        // If there are matches, extract the content within brackets
        if (matches) {
            return matches.map((match) => match.slice(1, -1)); // Remove the brackets
        }
        return [];
    };

    const getPostposition = (position: string) => {
        return position && position?.indexOf('}') !== -1 ? position.substring(position.indexOf('}') + 1).trim() : '';
    };

    const getPreposition = (position: string) => {
        return position && position?.indexOf('{') !== -1 ? position.substring(0, position.indexOf('{')).trim() : '';
    };

    if (isLoading || isLoadingRSStatements || isLoadingStatements) {
        return <Container>Loading...</Container>;
    }

    if (!template) {
        return null;
    }

    const { page: rsPage } = rsStatements ?? { page: { totalElements: 0 } };
    const { page: statementsPage } = statements ?? { page: { totalElements: 0 } };

    const canEditTemplate = !!user;

    const canFullyUpdate = !!(
        user &&
        !isLoadingRSStatements &&
        !isLoadingStatements &&
        rsPage.totalElements === 0 &&
        statementsPage.totalElements === 0
    );

    if (!canEditTemplate) {
        return (
            <Container>
                <div className="box flow-root pt-6 pb-6 pl-12 pr-12 rounded">
                    You cannot edit this statement template because it has some instances or you are not the creator
                </div>
            </Container>
        );
    }

    const positions: string[] = extractPositions(template?.formattedLabel || '');

    // the editor drafts properties in the wire format its ky-based save endpoint expects,
    // so the camelCase representation is mapped back to that shape when seeding it
    const toEditorPropertyShape = (p: RosettaStoneTemplate['properties'][number]): RSPropertyShape => ({
        id: p.id,
        label: p.label,
        placeholder: p.placeholder ?? '',
        description: p.description ?? '',
        min_count: p.minCount,
        max_count: p.maxCount,
        path: p.path,
        ...(p.type === 'string_literal' || p.type === 'number_literal' || p.type === 'other_literal' ? { datatype: p.datatype } : {}),
        ...(p.type === 'string_literal' ? { pattern: p.pattern ?? '' } : {}),
        ...(p.type === 'number_literal' ? { min_inclusive: p.minInclusive, max_inclusive: p.maxInclusive } : {}),
        // the generated client escapes the wire field 'class' as '_class'
        ...(p.type === 'resource' ? { class: p._class } : {}),
    });

    const initializeRosettaTemplateEditor = {
        id,
        numberLockedProperties: canFullyUpdate ? 0 : template.properties.length + 1, // +1 because of the verb position that is not in the template.properties
        step: 1,
        examples: template.exampleUsage,
        lockedExamples: template.exampleUsage,
        label: template.label,
        description: template.description,
        properties: [
            ...template.properties.slice(0, 1).map((p) => {
                return { ...toEditorPropertyShape(p), preposition: getPreposition(positions[0]), postposition: getPostposition(positions[0]) };
            }),
            { id: guid(), placeholder: positions[1].trim(), description: '' },
            ...template.properties.slice(1).map((p, index) => {
                return {
                    ...toEditorPropertyShape(p),
                    preposition: getPreposition(positions[index + 2]),
                    postposition: getPostposition(positions[index + 2]),
                };
            }),
        ],
        isSaving: false,
    };

    return (
        <>
            {isLoading && (
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12 flow-root">Loading ...</div>
                </Container>
            )}
            {!isLoading && error && getStatusCode(error) === 404 && <NotFound />}
            {!isLoading && error && getStatusCode(error) !== 404 && <InternalServerError error={error} />}
            {!isLoading && !error && template && (
                <>
                    <TitleBar>Edit Statement template: {template?.label}</TitleBar>
                    <Container>
                        <div className="box flow-root pt-6 pb-6 pl-12 pr-12 rounded">
                            <RosettaTemplateEditorProvider initialState={initializeRosettaTemplateEditor}>
                                <RosettaTemplateEditor
                                    saveButtonText="Update statement template"
                                    onCancel={() =>
                                        router.push(
                                            reverse(ROUTES.RS_TEMPLATE, {
                                                id,
                                            }),
                                        )
                                    }
                                    onCreate={async (templateId) => {
                                        router.push(
                                            reverse(ROUTES.RS_TEMPLATE, {
                                                id: templateId,
                                            }),
                                        );
                                    }}
                                />
                            </RosettaTemplateEditorProvider>
                        </div>
                    </Container>
                </>
            )}
        </>
    );
};

export default RSTemplateEditPage;

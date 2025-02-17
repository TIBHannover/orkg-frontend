'use client';

import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import useAuthentication from 'components/hooks/useAuthentication';
import RosettaTemplateEditor from 'components/RosettaStone/RosettaTemplateEditor/RosettaTemplateEditor';
import RosettaTemplateEditorProvider from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import TitleBar from 'components/TitleBar/TitleBar';
import useParams from 'components/useParams/useParams';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Container } from 'reactstrap';
import { getRSStatements, getRSTemplate, rosettaStoneUrl } from 'services/backend/rosettaStone';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { PaginatedResponse, Statement } from 'services/backend/types';
import useSWR from 'swr';
import { guid } from 'utils';

const RSTemplateEditPage = () => {
    const { id } = useParams<{ id: string; activeTab: string }>();
    const { user } = useAuthentication();

    const { data: template, isLoading, error } = useSWR(id ? [id, rosettaStoneUrl, 'getRSTemplate'] : null, ([params]) => getRSTemplate(params));
    const { data: rsStatements, isLoading: isLoadingRSStatements } = useSWR(id ? [id, rosettaStoneUrl, 'getRSStatements'] : null, ([params]) =>
        getRSStatements({ size: 1, template_id: params }),
    );
    const { data: statements, isLoading: isLoadingStatements } = useSWR(
        id ? [id, statementsUrl, 'getStatements'] : null,
        ([params]) => getStatements({ objectId: params, size: 1, returnContent: false }) as Promise<PaginatedResponse<Statement>>,
    );
    const router = useRouter();

    useEffect(() => {
        document.title = `${template?.label ?? ''} - Edit Statement type - ORKG`;
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

    const { totalElements: rsTotalElements } = rsStatements ?? { totalElements: 0 };
    const { totalElements } = statements ?? { totalElements: 0 };

    const canEditTemplate = !!user;

    const canFullyUpdate = !!(user && !isLoadingRSStatements && !isLoadingStatements && rsTotalElements === 0 && totalElements === 0);

    if (!canEditTemplate) {
        return (
            <Container className="box clearfix pt-4 pb-4 ps-5 pe-5 rounded">
                You cannot edit this statement type because it has some instances or you are not the creator
            </Container>
        );
    }

    const positions: string[] = extractPositions(template?.formatted_label || '');

    const initializeRosettaTemplateEditor = {
        id,
        numberLockedProperties: canFullyUpdate ? 0 : template.properties.length + 1, // +1 because of the verb position that is not in the template.properties
        step: 1,
        examples: template.example_usage,
        lockedExamples: template.example_usage,
        label: template.label,
        description: template.description,
        properties: [
            ...template.properties.slice(0, 1).map((p) => {
                return { id: guid(), ...p, preposition: getPreposition(positions[0]), postposition: getPostposition(positions[0]) };
            }),
            { id: guid(), placeholder: positions[1].trim(), description: '' },
            ...template.properties.slice(1).map((p, index) => {
                return { id: guid(), ...p, preposition: getPreposition(positions[index + 2]), postposition: getPostposition(positions[index + 2]) };
            }),
        ],
        isSaving: false,
    };

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            {!isLoading && !error && template && (
                <>
                    <TitleBar>Edit Statement type: {template?.label}</TitleBar>
                    <Container className="box clearfix pt-4 pb-4 ps-5 pe-5 rounded">
                        <RosettaTemplateEditorProvider initialState={initializeRosettaTemplateEditor}>
                            <RosettaTemplateEditor
                                saveButtonText="Update statement type"
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
                    </Container>
                </>
            )}
        </>
    );
};

export default RSTemplateEditPage;

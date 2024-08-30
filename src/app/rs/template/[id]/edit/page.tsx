'use client';

import InternalServerError from 'app/error';
import NotFound from 'app/not-found';
import { useRouter, useParams } from 'next/navigation';
import RosettaTemplateEditor from 'components/RosettaStone/RosettaTemplateEditor/RosettaTemplateEditor';
import RosettaTemplateEditorProvider from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import TitleBar from 'components/TitleBar/TitleBar';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Container } from 'reactstrap';
import { deleteTemplate, getStatements, getTemplate, rosettaStoneUrl } from 'services/backend/rosettaStone';
import { isCurationAllowed } from 'slices/authSlice';
import { RootStore } from 'slices/types';
import useSWR from 'swr';
import { guid } from 'utils';

const RSTemplateEditPage = () => {
    const { id } = useParams<{ id: string; activeTab: string }>();
    const user = useSelector((state: RootStore) => state.auth.user);
    const isCurator = useSelector((state: RootStore) => isCurationAllowed(state));

    const { data: template, isLoading, error } = useSWR(id ? [id, rosettaStoneUrl, 'getTemplate'] : null, ([params]) => getTemplate(params));
    const { data: statements, isLoading: isLoadingStatements } = useSWR(id ? [id, rosettaStoneUrl, 'getStatements'] : null, ([params]) =>
        getStatements({ template_id: params }),
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

    if (isLoading) {
        return <Container>Loading...</Container>;
    }

    if (!template) {
        return null;
    }

    const { totalElements } = statements ?? { totalElements: 0 };

    const canEditTemplate = !!(user && !isLoadingStatements && totalElements === 0 && (isCurator || user?.id === template?.created_by));

    if (!canEditTemplate) {
        return (
            <Container className="box clearfix pt-4 pb-4 ps-5 pe-5 rounded">
                You cannot edit this statement type because it has some instances or you are not the creator
            </Container>
        );
    }

    const positions: string[] = extractPositions(template?.formatted_label || '');

    const initializeRosettaTemplateEditor = {
        step: 1,
        examples: template.example_usage,
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
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError />}
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
                                    await deleteTemplate(id);
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

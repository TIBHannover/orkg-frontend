'use client';

import RosettaTemplateEditor from 'components/RosettaStone/RosettaTemplateEditor/RosettaTemplateEditor';
import RosettaTemplateEditorProvider from 'components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import TitleBar from 'components/TitleBar/TitleBar';
import { useEffect } from 'react';
import { Container } from 'reactstrap';
import useRouter from 'components/NextJsMigration/useRouter';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import requireAuthentication from 'requireAuthentication';

const NewRSTemplatePage = () => {
    useEffect(() => {
        document.title = `New statement type - ORKG`;
    }, []);
    const router = useRouter();

    const infoContainerText = (
        <>
            Statement types allows to define data schema patterns, and they can be used when describing research contributions.{' '}
            <a href="https://orkg.org/help-center/article/58/Statement_types" rel="noreferrer" target="_blank">
                Learn more in the help center
            </a>
            .
        </>
    );

    return (
        <>
            <TitleBar>New statement type</TitleBar>
            {infoContainerText && (
                <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                    {infoContainerText}
                </Container>
            )}
            <Container className="box clearfix pt-4 pb-4 ps-4 pe-4 rounded">
                <RosettaTemplateEditorProvider>
                    <RosettaTemplateEditor
                        saveButtonText="Create statement type"
                        onCancel={() => router.push(reverse(ROUTES.RS_TEMPLATES))}
                        onCreate={(templateId) =>
                            router.push(
                                reverse(ROUTES.RS_TEMPLATE, {
                                    id: templateId,
                                }),
                            )
                        }
                    />
                </RosettaTemplateEditorProvider>
            </Container>
        </>
    );
};

export default requireAuthentication(NewRSTemplatePage);

'use client';

import { Separator } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import RosettaTemplateEditor from '@/components/RosettaStone/RosettaTemplateEditor/RosettaTemplateEditor';
import RosettaTemplateEditorProvider from '@/components/RosettaStone/RosettaTemplateEditorContext/RosettaTemplateEditorContext';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import requireAuthentication from '@/requireAuthentication';

const NewRSTemplatePage = () => {
    useEffect(() => {
        document.title = `New statement template - ORKG`;
    }, []);
    const router = useRouter();

    return (
        <>
            <TitleBar>New statement template</TitleBar>
            <Container>
                <div className="box rounded p-6">
                    <p className="text-foreground">
                        Statement templates allows to define data schema patterns, and they can be used when describing research contributions.{' '}
                        <a href="https://orkg.org/help-center/article/58/Statement_types" rel="noreferrer" target="_blank">
                            Learn more in the help center
                        </a>
                        .
                    </p>
                    <Separator className="my-4" />
                    <RosettaTemplateEditorProvider>
                        <RosettaTemplateEditor
                            saveButtonText="Create statement template"
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
                </div>
            </Container>
        </>
    );
};

export default requireAuthentication(NewRSTemplatePage);

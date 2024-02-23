'use client';

import Link from 'components/NextJsMigration/Link';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import TitleBar from 'components/TitleBar/TitleBar';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Unauthorized from 'components/Unauthorized/Unauthorized';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Container, FormGroup, Input, Label } from 'reactstrap';
import { getClassById } from 'services/backend/classes';
import { createResource } from 'services/backend/resources';
import { createResourceStatement, getTemplatesByClass } from 'services/backend/statements';
import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import { MAX_LENGTH_INPUT } from 'constants/misc';

const TemplateNew = () => {
    const [title, setTitle] = useState('');
    const [targetClass, setTargetClass] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        document.title = 'Create new template - ORKG';
    });

    useEffect(() => {
        const getDefaultClass = () => {
            const targetClassID = searchParams.get('classID');
            if (targetClassID) {
                getClassById(targetClassID).then(classesData => {
                    setTargetClass(classesData);
                });
            }
        };
        getDefaultClass();
    }, [searchParams]);

    const handleCreate = async () => {
        if (!title) {
            toast.error('Enter a template name');
            return;
        }
        if (targetClass) {
            //  Check if the template of the class if already defined
            const templates = await getTemplatesByClass(targetClass.id);
            if (templates.length > 0) {
                toast.error('The template of this class is already defined');
                return;
            }
        }
        setIsLoading(true);
        let templateResource = null;
        try {
            templateResource = await createResource(title, [CLASSES.NODE_SHAPE]);
            if (targetClass) {
                await createResourceStatement(templateResource.id, PREDICATES.SHACL_TARGET_CLASS, targetClass.id);
            }
        } catch {
            setIsLoading(false);
        }
        setIsLoading(false);
        if (templateResource) {
            router.push(`${reverse(ROUTES.TEMPLATE, { id: templateResource.id })}?isEditMode=true`);
        }
    };

    if (!user) {
        return <Unauthorized />;
    }

    return (
        <>
            <TitleBar>Create template</TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <p>
                    Templates allows to specify the structure of content types, and they can be used when describing research contributions.{' '}
                    <a href="https://orkg.org/about/19/Templates" rel="noreferrer" target="_blank">
                        Learn more in the help center
                    </a>
                    .
                </p>
                <hr className="mt-3 mb-3" />
                {targetClass?.id && (
                    <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                        You are creating a template for the class{' '}
                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: targetClass.id })}>
                            {targetClass.label}
                        </Link>
                    </Container>
                )}
                <FormGroup>
                    <Tippy content="Choose the name of your template. You can always update this name later">
                        <span>
                            <Label for="articleName">Name</Label> <Icon icon={faQuestionCircle} className="text-secondary" />
                        </span>
                    </Tippy>

                    <Input type="text" maxLength={MAX_LENGTH_INPUT} id="articleName" value={title} onChange={e => setTitle(e.target.value)} />
                </FormGroup>
                <div className="text-end">
                    <ButtonWithLoading color="primary" onClick={handleCreate} isLoading={isLoading}>
                        Create
                    </ButtonWithLoading>
                </div>
            </Container>
        </>
    );
};

export default TemplateNew;

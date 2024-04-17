'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import Link from 'components/NextJsMigration/Link';
import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import TitleBar from 'components/TitleBar/TitleBar';
import Unauthorized from 'components/Unauthorized/Unauthorized';
import { ENTITIES } from 'constants/graphSettings';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { SelectInstance } from 'react-select';
import { toast } from 'react-toastify';
import { Container, FormGroup, FormText, Input, Label } from 'reactstrap';
import { createClass, getClassById } from 'services/backend/classes';
import { createTemplate } from 'services/backend/templates';
import { Class } from 'services/backend/types';

const TemplateNew = () => {
    const [label, setLabel] = useState('');
    const [targetClass, setTargetClass] = useState<Class | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const organizationId = useSelector((state: any) => state.auth.user?.organization_id);
    const observatoryId = useSelector((state: any) => state.auth.user?.observatory_id);

    const user = useSelector((state: any) => state.auth.user);

    const classAutocompleteRef = useRef<SelectInstance<Class> | null>(null);

    useEffect(() => {
        document.title = 'Create new template - ORKG';
    });

    useEffect(() => {
        const getDefaultClass = () => {
            const targetClassID = searchParams.get('classID');
            if (targetClassID) {
                getClassById(targetClassID).then((classesData) => {
                    setTargetClass(classesData);
                });
            }
        };
        getDefaultClass();
    }, [searchParams]);

    const handleCreate = async () => {
        if (!label) {
            toast.error('Enter a template name');
            return;
        }
        let targetClassId = targetClass?.id;
        if (!targetClassId) {
            const newClass = await createClass(`${label} [C]`);
            targetClassId = newClass.id;
        }
        const data = {
            label,
            target_class: targetClassId,
            relations: { research_fields: [], research_problems: [] },
            properties: [],
            observatories: observatoryId ? [observatoryId] : [],
            organizations: organizationId ? [organizationId] : [],
        };
        try {
            const templateResource = await createTemplate(data);
            if (templateResource) {
                router.push(`${reverse(ROUTES.TEMPLATE, { id: templateResource })}?isEditMode=true`);
            }
        } catch (e: any) {
            toast.error(e.message);
            setIsLoading(false);
        }
        setIsLoading(false);
    };

    const handleClassSelect = async (selected: Class | null, { action }: any) => {
        if (action === 'select-option') {
            setTargetClass(selected);
        } else if (action === 'create-option' && selected) {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                selected.id = newClass.id;
                setTargetClass(selected);
            }
            // blur the field allows to focus and open the menu again
            if (classAutocompleteRef.current) {
                classAutocompleteRef.current.blur();
            }
        } else if (action === 'clear') {
            setTargetClass(null);
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
                {searchParams.get('classID') && targetClass?.id && (
                    <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                        You are creating a template for the class {/* @ts-expect-error */}
                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: targetClass.id })}>
                            {targetClass.label}
                        </Link>
                    </Container>
                )}
                <FormGroup>
                    <Tippy content="Choose the name of your template. You can always update this name later">
                        <span>
                            <Label for="templateName">Name</Label> <Icon icon={faQuestionCircle} className="text-secondary" />
                        </span>
                    </Tippy>

                    <Input type="text" maxLength={MAX_LENGTH_INPUT} id="templateName" value={label} onChange={(e) => setLabel(e.target.value)} />
                </FormGroup>
                {!searchParams.get('classID') && (
                    <FormGroup className="mb-4">
                        <Label for="target-class">
                            Target class <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <AutoComplete
                            entityType={ENTITIES.CLASS}
                            placeholder="Select or type to enter a class"
                            onChange={handleClassSelect}
                            value={targetClass}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={true}
                            copyValueButton={true}
                            isClearable
                            innerRef={classAutocompleteRef}
                            autoFocus={false}
                            linkButton={targetClass && targetClass.id ? reverse(ROUTES.CLASS, { id: targetClass.id }) : ''}
                            linkButtonTippy="Go to class page"
                            inputId="target-class"
                        />
                        <FormText>Specify the class of this template. If not specified, a class is generated automatically.</FormText>
                    </FormGroup>
                )}

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

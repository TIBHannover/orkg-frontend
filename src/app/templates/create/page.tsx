'use client';

import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ActionMeta, SelectInstance, SingleValue } from 'react-select';
import { toast } from 'react-toastify';
import { Container } from 'reactstrap';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import CopyIdButton from '@/components/Autocomplete/ValueButtons/CopyIdButton';
import LinkButton from '@/components/Autocomplete/ValueButtons/LinkButton';
import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import Tooltip from '@/components/FloatingUI/Tooltip';
import useAuthentication from '@/components/hooks/useAuthentication';
import useMembership from '@/components/hooks/useMembership';
import TitleBar from '@/components/TitleBar/TitleBar';
import FormGroup from '@/components/Ui/Form/FormGroup';
import FormText from '@/components/Ui/Form/FormText';
import Input from '@/components/Ui/Input/Input';
import InputGroup from '@/components/Ui/Input/InputGroup';
import Label from '@/components/Ui/Label/Label';
import Unauthorized from '@/components/Unauthorized/Unauthorized';
import { ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { createClass, getClassById } from '@/services/backend/classes';
import { createTemplate } from '@/services/backend/templates';

const TemplateNew = () => {
    const [label, setLabel] = useState('');
    const [targetClass, setTargetClass] = useState<SingleValue<OptionType> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuthentication();
    const { organizationId, observatoryId } = useMembership();

    const classAutocompleteRef = useRef<SelectInstance<OptionType | null>>(null);

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
        setIsSaving(true);
        try {
            let targetClassId = targetClass?.id;
            if (!targetClassId) {
                try {
                    const newClassId = await createClass(`${label} [C]`);
                    targetClassId = newClassId;
                } catch (e: any) {
                    toast.error(e.message);
                    setIsSaving(false);
                    return;
                }
            }
            const data = {
                label,
                target_class: targetClassId,
                relations: { research_fields: [], research_problems: [] },
                properties: [],
                observatories: observatoryId ? [observatoryId] : [],
                organizations: organizationId ? [organizationId] : [],
            };
            const templateResource = await createTemplate(data);
            if (templateResource) {
                router.push(`${reverse(ROUTES.TEMPLATE, { id: templateResource })}?isEditMode=true`);
            } else {
                throw new Error('Failed to create template');
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed to create template');
            setIsSaving(false);
        }
    };

    const handleClassSelect = async (selected: SingleValue<OptionType>, { action }: ActionMeta<OptionType>) => {
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
                        You are creating a template for the class{' '}
                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: targetClass.id })}>
                            {targetClass.label}
                        </Link>
                    </Container>
                )}
                <FormGroup>
                    <Tooltip content="Choose the name of your template. You can always update this name later">
                        <span>
                            <Label for="templateName">Name</Label> <FontAwesomeIcon icon={faQuestionCircle} className="text-secondary" />
                        </span>
                    </Tooltip>

                    <Input type="text" maxLength={MAX_LENGTH_INPUT} id="templateName" value={label} onChange={(e) => setLabel(e.target.value)} />
                </FormGroup>
                {!searchParams.get('classID') && (
                    <FormGroup className="mb-4">
                        <Label for="target-class">
                            Target class <span className="text-muted fst-italic">(optional)</span>
                        </Label>
                        <InputGroup>
                            <Autocomplete
                                entityType={ENTITIES.CLASS}
                                placeholder="Select or type to enter a class"
                                onChange={handleClassSelect}
                                value={targetClass}
                                openMenuOnFocus
                                allowCreate
                                isClearable
                                inputId="target-class"
                            />
                            <CopyIdButton value={targetClass} />
                            <LinkButton value={targetClass} />
                        </InputGroup>
                        <FormText>Specify the class of this template. If not specified, a class is generated automatically.</FormText>
                    </FormGroup>
                )}

                <div className="text-end">
                    <ButtonWithLoading color="primary" onClick={handleCreate} isLoading={isSaving}>
                        Create
                    </ButtonWithLoading>
                </div>
            </Container>
        </>
    );
};

export default TemplateNew;

import { faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { FC, Fragment, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import { OptionType } from '@/components/Autocomplete/types';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import StatementTypeModal from '@/components/RosettaStone/AddStatement/StatementTypeModal';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import { RosettaStoneTemplate, RSPropertyShape } from '@/services/backend/types';
import { getLinkByEntityType } from '@/utils';

type StatementValueProps = {
    template: RosettaStoneTemplate;
    value: OptionType[];
    propertyShape: RSPropertyShape;
    isEditMode?: boolean;
    showQuickActionButtons?: boolean;
    handleAddStatement?: (templateId: string, subjects: OptionType[]) => void;
    context: string;
};

const StatementValue: FC<StatementValueProps> = ({
    template,
    value,
    propertyShape,
    showQuickActionButtons = true,
    isEditMode = false,
    handleAddStatement,
    context,
}) => {
    const [showStatementTypeModal, setShowStatementTypeModal] = useState(false);
    const [reuseSubject, setReuseSubject] = useState<OptionType | null>(null);

    if (!value || value?.length === 0) {
        return <u>{propertyShape.placeholder}</u>;
    }

    const subjectPropertyShape = template?.properties[0];

    const canBeUsedAsSubject =
        subjectPropertyShape &&
        (('class' in propertyShape && 'class' in subjectPropertyShape && subjectPropertyShape.class?.id === propertyShape.class?.id) ||
            !('class' in subjectPropertyShape));

    return (
        <span>
            {value.map((v, i) => (
                <Fragment key={v.id}>
                    {'datatype' in v && (
                        <ValuePlugins type={ENTITIES.LITERAL} datatype={v.datatype as string}>
                            {v.label}
                        </ValuePlugins>
                    )}
                    {!('datatype' in v) && (
                        <Fragment key={`v${v.id}`}>
                            <DescriptionTooltip id={v.id} _class={v._class ?? ENTITIES.RESOURCE} classes={'classes' in v ? v.classes : undefined}>
                                <Link href={getLinkByEntityType(ENTITIES.RESOURCE, v.id)} target="_blank">
                                    {v?.label}
                                </Link>
                            </DescriptionTooltip>
                            {showQuickActionButtons && isEditMode && (
                                <div className="ms-1 d-inline-block">
                                    <ActionButton
                                        title="Reuse as subject"
                                        icon={faRotateLeft}
                                        iconSize="xs"
                                        action={() => {
                                            setReuseSubject(v);
                                            setShowStatementTypeModal(true);
                                        }}
                                    />
                                </div>
                            )}
                        </Fragment>
                    )}
                    {i + 1 < value.length - 1 && ', '}
                    {i + 2 === value.length && ' and '}
                </Fragment>
            ))}
            {showStatementTypeModal && (
                <StatementTypeModal
                    isOpen={showStatementTypeModal}
                    toggle={() => setShowStatementTypeModal(false)}
                    handleAddStatement={handleAddStatement}
                    subject={reuseSubject}
                    context={context}
                    template={canBeUsedAsSubject ? template : null}
                />
            )}
        </span>
    );
};

export default StatementValue;

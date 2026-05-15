import { faCheck, faClock, faClose, faInfo, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Popover, Slider, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import { findKey, toInteger } from 'lodash';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import useSWR from 'swr';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import CopyId from '@/components/CopyId/CopyId';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import VersionsModal from '@/components/RosettaStone/SingleStatement/VersionsModal';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { CERTAINTY } from '@/constants/contentTypes';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { classesUrl, getClassById } from '@/services/backend/classes';
import { getRSStatementVersions, rosettaStoneUrl } from '@/services/backend/rosettaStone';
import { Certainty, RosettaStoneStatement, RosettaStoneTemplate } from '@/services/backend/types';

type InfoBoxProps = {
    statement: RosettaStoneStatement;
    template: RosettaStoneTemplate;
    isEditing: boolean;
    certainty: Certainty;
    setCertainty: Dispatch<SetStateAction<Certainty>>;
};

const InfoBox: FC<InfoBoxProps> = ({ statement, template, certainty, setCertainty, isEditing }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const { data: _versions, isLoading } = useSWR(
        isOpen && statement.latest_version_id ? [{ id: statement.latest_version_id }, rosettaStoneUrl, 'getRSStatementVersions'] : null,
        ([params]) => getRSStatementVersions(params),
    );

    const { data: statementClass } = useSWR(template.target_class ? [template.target_class, classesUrl, 'getClassById'] : null, ([params]) =>
        getClassById(params),
    );

    const versions = _versions ?? [];

    const CertaintyVALUES: { [key: number]: Certainty } = {
        0: CERTAINTY.LOW,
        1: CERTAINTY.MODERATE,
        2: CERTAINTY.HIGH,
    };

    const certaintyNumber = toInteger(findKey(CertaintyVALUES, (cert) => cert === certainty) ?? 0);

    const showVersionsModal = () => {
        setIsHistoryModalOpen((v) => !v);
        setIsOpen(false);
    };

    return (
        <>
            <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
                <ActionButtonView title="Show information about this statement" icon={faInfo} />
                <Popover.Content className="max-w-[400px]">
                    <Popover.Dialog>
                        <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                            {statement.latest_version_id && statement.id && (
                                <div className="flex items-center gap-2 my-1 min-w-0">
                                    <div className="flex-1 min-w-0">
                                        <CopyId text="Statement ID" id={statement.id} fullWidth />
                                    </div>
                                    <Tooltip>
                                        <Link href={reverse(ROUTES.RS_STATEMENT, { id: statement.id })} className="shrink-0" target="_blank">
                                            <FontAwesomeIcon icon={faLink} />
                                        </Link>
                                        <Tooltip.Content>Go to statement page</Tooltip.Content>
                                    </Tooltip>
                                </div>
                            )}
                            <li className="mb-1">
                                Statement template:{' '}
                                <Link target="_blank" href={reverse(ROUTES.RS_TEMPLATE, { id: template.id })}>
                                    {template.label ? template.label : <em>No title</em>}
                                </Link>
                            </li>
                            <li className="mb-1">
                                Statement type:{' '}
                                <DescriptionTooltip id={statementClass?.id} _class={ENTITIES.CLASS}>
                                    <Link target="_blank" href={reverse(ROUTES.CLASS, { id: template.target_class })}>
                                        {statementClass?.label}
                                    </Link>
                                </DescriptionTooltip>
                            </li>
                            <li className="mb-1">
                                Created:{' '}
                                <span title={statement.created_at}>
                                    <FontAwesomeIcon icon={faClock} /> {dayjs(statement.created_at).fromNow()}
                                </span>
                            </li>
                            {statement.created_by && (
                                <li className="mb-1">
                                    {versions && versions?.length > 1 ? 'Updated by:' : 'Created by:'}{' '}
                                    {statement.created_by !== MISC.UNKNOWN_ID ? (
                                        <UserAvatar linkTarget="_blank" size={18} showDisplayName userId={statement.created_by} />
                                    ) : (
                                        'Unknown'
                                    )}
                                </li>
                            )}
                            {statement.latest_version_id && (
                                <li className="mb-1">
                                    Versions:{' '}
                                    <span
                                        className="bg-transparent p-0 text-accent focus:ring-0 hover:underline"
                                        onClick={showVersionsModal}
                                        style={{ cursor: 'pointer' }}
                                        onKeyDown={(e) => (e.key === 'Enter' ? showVersionsModal() : undefined)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        {!isLoading ? versions?.length : 'loading...'}
                                    </span>
                                </li>
                            )}
                            <li className="mb-1">
                                Is editable:{' '}
                                {statement.modifiable && (
                                    <span title="This statement can be edited">
                                        <FontAwesomeIcon icon={faCheck} />
                                    </span>
                                )}
                                {!statement.modifiable && (
                                    <span title="This statement can not be edited">
                                        <FontAwesomeIcon icon={faClose} />
                                    </span>
                                )}
                            </li>
                            <li className="mb-1">
                                {!isEditing && `Degree of certainty: ${statement.certainty}`}
                                {isEditing && (
                                    <>
                                        Degree of certainty: {certainty}
                                        <Slider
                                            aria-label="Degree of certainty"
                                            className="mt-2 w-full"
                                            minValue={0}
                                            maxValue={2}
                                            step={1}
                                            value={certaintyNumber}
                                            onChange={(value) => setCertainty(CertaintyVALUES[value as number])}
                                        >
                                            <Slider.Track>
                                                <Slider.Fill />
                                                <Slider.Thumb />
                                            </Slider.Track>
                                        </Slider>
                                    </>
                                )}
                            </li>
                        </ul>
                    </Popover.Dialog>
                </Popover.Content>
            </Popover>
            <VersionsModal show={isHistoryModalOpen} id={statement.version_id ?? statement.id} toggle={() => setIsHistoryModalOpen((v) => !v)} />
        </>
    );
};

export default InfoBox;

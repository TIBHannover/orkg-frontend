import { faCheck, faClock, faClose, faInfo, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { findKey, toInteger } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { getTrackBackground, Range } from 'react-range';
import { ThemeContext } from 'styled-components';
import useSWR from 'swr';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import CopyId from '@/components/CopyId/CopyId';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Popover from '@/components/FloatingUI/Popover';
import Tooltip from '@/components/FloatingUI/Tooltip';
import VersionsModal from '@/components/RosettaStone/SingleStatement/VersionsModal';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { CERTAINTY } from '@/constants/contentTypes';
import { ENTITIES, MISC } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
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
    const theme = useContext(ThemeContext);

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

    const certaintyNumber = [toInteger(findKey(CertaintyVALUES, (cert) => cert === certainty) ?? 0)];

    const showVersionsModal = () => {
        setIsHistoryModalOpen((v) => !v);
        setIsOpen(false);
    };

    return (
        <Popover
            open={isOpen}
            onOpenChange={setIsOpen}
            contentStyle={{ maxWidth: '400px' }}
            content={
                <div className="p-1">
                    <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                        {statement.latest_version_id && statement.id && (
                            <div className="clearfix d-flex align-items-center justify-content-end">
                                <div className="float-end f-d my-1">
                                    <CopyId text="Statement ID" id={statement.id} />
                                </div>
                                <Tooltip content="Go to statement page">
                                    <Link href={reverse(ROUTES.RS_STATEMENT, { id: statement.id })} className="ms-2" target="_blank">
                                        <FontAwesomeIcon icon={faLink} />
                                    </Link>
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
                                    className="btn-link"
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
                                    <div className="mt-2">
                                        <Range
                                            step={1}
                                            min={0}
                                            max={2}
                                            values={certaintyNumber}
                                            onChange={(values) => setCertainty(CertaintyVALUES[values[0]])}
                                            renderTrack={({ props: innerProps, children }) => (
                                                <div
                                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                                    {...innerProps}
                                                    style={{
                                                        ...innerProps.style,
                                                        height: '6px',
                                                        width: '100%',
                                                        background: getTrackBackground({
                                                            values: certaintyNumber,
                                                            colors: [theme?.smart ?? '', theme?.lightDarker ?? ''],
                                                            min: 0,
                                                            max: 2,
                                                        }),
                                                    }}
                                                >
                                                    {children}
                                                </div>
                                            )}
                                            renderThumb={({ props: innerProps }) => (
                                                <div
                                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                                    {...innerProps}
                                                    style={{
                                                        ...innerProps.style,
                                                        height: '15px',
                                                        width: '15px',
                                                        borderRadius: '4px',
                                                        backgroundColor: '#FFF',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        boxShadow: '0px 2px 6px #AAA',
                                                    }}
                                                />
                                            )}
                                        />
                                    </div>
                                </>
                            )}
                        </li>
                    </ul>
                </div>
            }
        >
            <span>
                <ActionButtonView action={() => setIsOpen((v) => !v)} title="Show information about this statement" icon={faInfo} />
                <VersionsModal show={isHistoryModalOpen} id={statement.version_id ?? statement.id} toggle={() => setIsHistoryModalOpen((v) => !v)} />
            </span>
        </Popover>
    );
};

export default InfoBox;

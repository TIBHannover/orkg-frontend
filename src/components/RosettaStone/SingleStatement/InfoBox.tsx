import { faCheck, faClock, faClose, faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import CopyId from 'components/CopyId/CopyId';
import Link from 'next/link';
import VersionsModal from 'components/RosettaStone/SingleStatement/VersionsModal';
import ActionButtonView from 'components/StatementBrowser/StatementActionButton/ActionButtonView';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { CERTAINTY } from 'constants/contentTypes';
import { MISC } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { findKey, toInteger } from 'lodash';
import moment from 'moment';
import { reverse } from 'named-urls';
import { Dispatch, FC, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Range, getTrackBackground } from 'react-range';
import { getRSStatementVersions } from 'services/backend/rosettaStone';
import { Certainty, RosettaStoneStatement, RosettaStoneTemplate } from 'services/backend/types';
import { ThemeContext } from 'styled-components';
import type { Instance } from 'tippy.js';

type InfoBoxProps = {
    statement: RosettaStoneStatement;
    template: RosettaStoneTemplate;
    isEditing: boolean;
    certainty: Certainty;
    setCertainty: Dispatch<SetStateAction<Certainty>>;
};

const InfoBox: FC<InfoBoxProps> = ({ statement, template, certainty, setCertainty, isEditing }) => {
    const [versions, setVersions] = useState<RosettaStoneStatement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const theme = useContext(ThemeContext);
    const tippy = useRef<Instance | null>(null);

    const onTrigger = () => {
        if (!isLoaded && statement.latest_version_id) {
            setIsLoading(true);
            getRSStatementVersions({ id: statement.id })
                .then((_versions) => {
                    if (_versions.length) {
                        setVersions(_versions.reverse());
                    }
                    setIsLoading(false);
                    setIsLoaded(true);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                });
        }
    };

    useEffect(() => {
        setIsLoaded(false);
    }, [statement.id, statement.latest_version_id, statement.version_id]);

    const CertaintyVALUES: { [key: number]: Certainty } = {
        0: CERTAINTY.LOW,
        1: CERTAINTY.MODERATE,
        2: CERTAINTY.HIGH,
    };

    const certaintyNumber = [toInteger(findKey(CertaintyVALUES, (cert) => cert === certainty) ?? 0)];

    const closeTippy = () => {
        tippy.current?.hide();
    };

    const showVersionsModal = () => {
        setIsHistoryModalOpen((v) => !v);
        closeTippy();
    };

    return (
        <Tippy
            onCreate={(tippyInst) => {
                tippy.current = tippyInst;
            }}
            onTrigger={onTrigger}
            interactive
            content={
                <div className="p-1">
                    <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                        {statement.latest_version_id && statement.id && (
                            <div className="clearfix">
                                <div className="float-end f-d my-1">
                                    <CopyId text="Statement ID" id={statement.id} />
                                </div>
                            </div>
                        )}
                        <li className="mb-1">
                            Template:
                            <Link target="_blank" href={reverse(ROUTES.RS_TEMPLATE, { id: template.id })}>
                                {template.label ? template.label : <em>No title</em>}
                            </Link>
                        </li>
                        <li className="mb-1">
                            Created:{' '}
                            <span title={statement.created_at}>
                                <Icon icon={faClock} /> {moment(statement.created_at).fromNow()}
                            </span>
                        </li>
                        {statement.created_by && (
                            <li className="mb-1">
                                {versions.length > 1 ? 'Updated by:' : 'Created by:'}{' '}
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
                                    onKeyDown={(e) => (e.keyCode === 13 ? showVersionsModal() : undefined)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    {!isLoading ? versions.length : 'loading...'}
                                </span>
                            </li>
                        )}
                        <li className="mb-1">
                            Is editable:{' '}
                            {statement.modifiable && (
                                <span title="This statement can be edited">
                                    <Icon icon={faCheck} />
                                </span>
                            )}
                            {!statement.modifiable && (
                                <span title="This statement can not be edited">
                                    <Icon icon={faClose} />
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
                                                            colors: [theme?.smart, theme?.lightDarker],
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
            appendTo={document.body}
            trigger="click"
        >
            <span>
                {/* @ts-expect-error awaiting TS migration */}
                <ActionButtonView action={(e) => e.stopPropagation()} title="Show information about this statement" icon={faInfo} />
                <VersionsModal
                    versions={versions}
                    show={isHistoryModalOpen}
                    id={statement.version_id ?? statement.id}
                    toggle={() => setIsHistoryModalOpen((v) => !v)}
                />
            </span>
        </Tippy>
    );
};

export default InfoBox;

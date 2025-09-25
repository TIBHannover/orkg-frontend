import { faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { truncate } from 'lodash';
import { FC, useContext, useState } from 'react';
import { ThemeContext } from 'styled-components';
import useSWR from 'swr';

import { OptionType } from '@/components/Autocomplete/types';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { getStatements, statementsUrl } from '@/services/backend/statements';

type InfoBoxProps = {
    data: OptionType;
    isFocused: boolean;
};

const MAXIMUM_DESCRIPTION_LENGTH = 120;

const InfoBox: FC<InfoBoxProps> = ({ data, isFocused }) => {
    const theme = useContext(ThemeContext);

    const [isOpen, setIsOpen] = useState(false);

    const { data: statements, isLoading } = useSWR(data.id && isOpen ? [{ subjectId: data.id }, statementsUrl, 'getStatements'] : null, ([params]) =>
        getStatements(params),
    );

    const iconColor = !isFocused ? theme?.lightDarker : theme?.secondary;

    return (
        <Tooltip
            onTrigger={() => setIsOpen(true)}
            key="c"
            contentStyle={{ zIndex: 99999, position: 'absolute' }}
            content={
                <div className="text-start">
                    {!isLoading ? (
                        <>
                            {!data.external && statements && statements.length > 0 && (
                                <>
                                    Statements:
                                    <ul className="px-3 mb-0">
                                        {statements.slice(0, 5).map((s) => (
                                            <li key={s.id}>
                                                {s.predicate.label}:{' '}
                                                {truncate(s.object.label ? s.object.label : '', {
                                                    length: MAXIMUM_DESCRIPTION_LENGTH,
                                                })}
                                            </li>
                                        ))}
                                    </ul>
                                    {statements?.length > 5 && <div className="px-2">+ {statements?.length - 5} more</div>}
                                </>
                            )}
                            {data.tooltipData &&
                                data.tooltipData.length > 0 &&
                                data.tooltipData.map((info, index) => (
                                    <div key={`s${index}`}>
                                        <b>{info.property} : </b> {info.value}
                                    </div>
                                ))}
                            {((data.external && data.tooltipData?.length === 0) || (statements?.length === 0 && !data.external)) && (
                                <small>
                                    <i>No information for this option</i>
                                </small>
                            )}
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSpinner} spin /> Preview of statements
                        </>
                    )}
                </div>
            }
        >
            <span>
                <FontAwesomeIcon icon={faInfoCircle} color={iconColor} />
            </span>
        </Tooltip>
    );
};

export default InfoBox;

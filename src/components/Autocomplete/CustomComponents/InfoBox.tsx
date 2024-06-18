import { faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { OptionType } from 'components/Autocomplete/types';
import { truncate } from 'lodash';
import { FC, useContext, useState } from 'react';
import { getStatementsBySubject } from 'services/backend/statements';
import { Statement } from 'services/backend/types';
import { ThemeContext } from 'styled-components';

type InfoBoxProps = {
    data: OptionType;
    isFocused: boolean;
};

const MAXIMUM_DESCRIPTION_LENGTH = 120;

const InfoBox: FC<InfoBoxProps> = ({ data, isFocused }) => {
    const [statements, setStatements] = useState<Statement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const theme = useContext(ThemeContext);

    const onTrigger = () => {
        if (!isLoaded && data.id && !data.external) {
            setIsLoading(true);
            getStatementsBySubject({ id: data.id })
                .then((result) => {
                    setStatements(result);
                    setIsLoading(false);
                    setIsLoaded(true);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                });
        }
    };

    const iconColor = !isFocused ? theme?.lightDarker : theme?.secondary;

    return (
        <Tippy
            appendTo={document.body}
            onTrigger={onTrigger}
            interactive
            key="c"
            content={
                <div className="text-start">
                    {!isLoading ? (
                        <>
                            {!data.external && statements?.length > 0 && (
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
                            <Icon icon={faSpinner} spin /> Preview of statements
                        </>
                    )}
                </div>
            }
        >
            <span>
                <Icon icon={faInfoCircle} color={iconColor} />
            </span>
        </Tippy>
    );
};

export default InfoBox;

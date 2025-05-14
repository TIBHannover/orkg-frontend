import { reverse } from 'named-urls';
import Link from 'next/link';

import { isDefaultHeader, MappedColumn, parseCellString } from '@/app/csv-import/steps/helpers';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

type HeaderProps = {
    debugMode: boolean;
    data: string[][];
    i: number;
    column: MappedColumn;
};

const Header = ({ debugMode, data, i, column }: HeaderProps) => {
    return (
        <div className="d-flex justify-content-between align-items-center">
            {debugMode && (
                <div className="d-flex justify-content-between align-items-center">
                    <div>{data[0][i]}</div>
                </div>
            )}
            {!debugMode && (
                <>
                    {column.predicate?.id ? (
                        <DescriptionTooltip
                            id={column.predicate?.id}
                            _class={column.predicate?._class ?? ENTITIES.PREDICATE}
                            disabled={column.predicate?.hideLink}
                        >
                            {column.predicate?.hideLink ? (
                                <span>{column.predicate?.label}</span>
                            ) : (
                                <Link href={reverse(ROUTES.PROPERTY, { id: column.predicate?.id })} target="_blank">
                                    {column.predicate?.label}
                                </Link>
                            )}
                        </DescriptionTooltip>
                    ) : (
                        <Tooltip content="This property will be mapped automatically based on the column name">
                            <span>{column.inputValue}</span>
                        </Tooltip>
                    )}
                    {parseCellString(data[0][i]).hasTypeInfo && (
                        <div className="tw:inline-block tw:bg-white tw:text-[color:var(--bodyColor)] tw:px-[5px] tw:py-[1px] tw:mr-[6px] tw:text-[70%] tw:cursor-default tw:rounded-[4px] tw:border tw:border-[color:var(--bodyColor)] tw:whitespace-nowrap tw:h-fit">
                            {column.type?.name}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
export default Header;

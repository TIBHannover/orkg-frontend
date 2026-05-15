import Link from 'next/link';

import { isDefaultHeader, MappedColumn, parseCellString } from '@/app/csv-import/steps/helpers';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type HeaderProps = {
    debugMode: boolean;
    data: string[][];
    i: number;
    column: MappedColumn;
};

const Header = ({ debugMode, data, i, column }: HeaderProps) => {
    return (
        <div className="flex justify-between items-center">
            {debugMode && (
                <div className="flex justify-between items-center">
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
                        <div className="inline-block bg-white text-[color:var(--bodyColor)] px-[5px] py-[1px] mr-[6px] text-[70%] cursor-default rounded-[4px] border border-[color:var(--bodyColor)] whitespace-nowrap h-fit">
                            {column.type?.name}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
export default Header;

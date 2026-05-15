import { Chip, Tooltip } from '@heroui/react';
import Link from 'next/link';
import { components, GroupBase, OptionProps } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type PaperOptionData = OptionType & {
    authors?: { name: string }[];
    year?: number | string;
    isOrkgResource?: boolean;
};

const PaperOption = <IsMulti extends boolean = false>(props: OptionProps<PaperOptionData, IsMulti, GroupBase<PaperOptionData>>) => {
    const { children, data } = props;
    const firstAuthor = data?.authors?.[0]?.name;
    const shouldShowEtAl = (data?.authors?.length ?? 0) > 1;
    const { isOrkgResource } = data;

    return (
        <components.Option {...props}>
            <div className="flex items-center gap-2">
                <div className="truncate">{children}</div>
                {firstAuthor && (
                    <div className="shrink-0 text-xs italic text-default-500">
                        {firstAuthor} {shouldShowEtAl && 'et al.'} {data?.year}
                    </div>
                )}
                {isOrkgResource && data?.id && (
                    <span className="ms-auto">
                        <Tooltip>
                            <Tooltip.Trigger aria-label="Open existing ORKG entity">
                                <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: data.id })} target="_blank" onClick={(e) => e.stopPropagation()}>
                                    <Chip size="sm" variant="soft">
                                        <Chip.Label>{data.id}</Chip.Label>
                                    </Chip>
                                </Link>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                                <Tooltip.Arrow />
                                Open existing ORKG entity
                            </Tooltip.Content>
                        </Tooltip>
                    </span>
                )}
            </div>
        </components.Option>
    );
};

export default PaperOption;

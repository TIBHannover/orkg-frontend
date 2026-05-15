import { Skeleton } from '@heroui/react';
import { times } from 'lodash';

const TableLoadingIndicator = ({ contributionAmount }: { contributionAmount: number }) => (
    <div className="overflow-hidden max-w-full mb-4 w-fit">
        <div className="flow-root" />
        <table className="mb-0 mt-4 table">
            <tbody className="table-borderless">
                <tr className="table-borderless">
                    <td className="p-0">
                        <div className="w-[230px] rounded-t-xl overflow-hidden mx-2.5">
                            <Skeleton className="w-[230px] h-[50px] bg-secondary" />
                        </div>
                    </td>
                    {times(contributionAmount, (i) => (
                        <td className="p-0" key={i} data-testid="contentLoader">
                            <div className="w-[230px] rounded-t-xl overflow-hidden mx-2.5">
                                <Skeleton className="w-[230px] h-[50px] bg-surface-secondary" />
                            </div>
                        </td>
                    ))}
                </tr>
                <tr className="table-borderless">
                    <td className="p-0">
                        <div className="w-[230px] rounded-b-xl overflow-hidden mx-2.5">
                            <Skeleton className="w-[230px] h-[150px] bg-secondary" />
                        </div>
                    </td>
                    {times(contributionAmount, (i) => (
                        <td className="p-0" key={i}>
                            <div className="w-[230px] rounded-b-xl overflow-hidden mx-2.5">
                                <Skeleton className="w-[230px] h-[150px]" />
                            </div>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    </div>
);
export default TableLoadingIndicator;

import { Skeleton } from '@heroui/react';
import { times } from 'lodash';

const COLUMN_AMOUNT = 30;

const ComparisonLoading = () => (
    <div className="overflow-hidden rounded-md">
        <table className="mb-0 table" style={{ maxWidth: 1044 }}>
            <tbody className="table-borderless">
                <tr className="table-borderless" style={{ borderStyle: 'hidden' }}>
                    <td className="p-0">
                        <Skeleton className="w-[250px] h-[50px] bg-secondary" />
                    </td>
                    {times(COLUMN_AMOUNT, (i) => (
                        <td className="p-0" key={i}>
                            <Skeleton className="w-[250px] h-[50px] bg-accent" />
                        </td>
                    ))}
                </tr>
                <tr className="table-borderless" style={{ borderStyle: 'hidden' }}>
                    <td className="p-0">
                        <Skeleton className="w-[250px] h-[250px] bg-secondary" />
                    </td>
                    {times(COLUMN_AMOUNT, (i) => (
                        <td className="p-0" key={i}>
                            <Skeleton className="w-[250px] h-[250px]" />
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    </div>
);

export default ComparisonLoading;

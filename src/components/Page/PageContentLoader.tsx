import { Skeleton } from '@heroui/react';

const PageContentLoader = () => (
    <div className="flex flex-col gap-4">
        <Skeleton className="w-full h-9 rounded" />
        <Skeleton className="w-[65%] h-14 rounded" />
        <Skeleton className="w-[45%] h-14 rounded" />
        <Skeleton className="w-[55%] h-14 rounded" />
    </div>
);

export default PageContentLoader;

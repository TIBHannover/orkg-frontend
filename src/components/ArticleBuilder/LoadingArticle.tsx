import { Skeleton } from '@heroui/react';

import Container from '@/components/Ui/Structure/Container';

const LoadingArticle = () => (
    <Container>
        <div className="box rounded px-12 pt-12 pb-12 flex flex-col gap-6">
            {/* title */}
            <Skeleton className="w-full h-5 rounded" />
            {/* authors */}
            <div className="flex gap-2">
                <Skeleton className="w-[15%] h-3 rounded" />
                <Skeleton className="w-[15%] h-3 rounded" />
                <Skeleton className="w-[15%] h-3 rounded" />
            </div>
            {/* sections */}
            {[0, 1].map((i) => (
                <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="w-full h-4 rounded" />
                    <Skeleton className="w-[30%] h-1 rounded" />
                    <Skeleton className="w-[45%] h-1 rounded" />
                    <Skeleton className="w-[35%] h-1 rounded" />
                    <Skeleton className="w-[45%] h-1 rounded" />
                </div>
            ))}
        </div>
    </Container>
);

export default LoadingArticle;

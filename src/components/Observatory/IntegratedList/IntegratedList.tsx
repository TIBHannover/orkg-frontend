import CardFactory from 'components/Cards/CardFactory/CardFactory';
import useRetrievingContentPage from 'components/Observatory/hooks/useRetrievingContentPage';
import { FC } from 'react';
import ContentLoader from 'react-content-loader';
import { Resource } from 'services/backend/types';

type IntegratedListProps = {
    content: Resource[];
};

const IntegratedList: FC<IntegratedListProps> = ({ content }) => {
    const { items, isLoading } = useRetrievingContentPage({ content });

    return (
        <>
            {!isLoading &&
                items?.map((item: Resource) => (
                    <CardFactory showBadge={true} showCurationFlags={true} showAddToComparison={true} key={`item${item.id}`} item={item} />
                ))}
            {isLoading && (
                <div className="list-group-item text-start p-5">
                    <ContentLoader
                        speed={2}
                        width={400}
                        height={50}
                        viewBox="0 0 400 50"
                        style={{ width: '100% !important' }}
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                    >
                        <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                        <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                    </ContentLoader>
                </div>
            )}
        </>
    );
};

export default IntegratedList;

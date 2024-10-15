import CardFactory from 'components/Cards/CardFactory/CardFactoryOldFormat';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import useRetrievingContentPage from 'components/ContentTypeList/hooks/useRetrievingContentPage';
import { FC } from 'react';
import { Resource } from 'services/backend/types';

type ContentTypeAsResourceListProps = {
    content: Resource[];
};

const ContentTypeAsResourceList: FC<ContentTypeAsResourceListProps> = ({ content }) => {
    const { items, isLoading } = useRetrievingContentPage({ content });

    return (
        <>
            {!isLoading &&
                items?.map((item: Resource) => <CardFactory showBadge showCurationFlags showAddToComparison key={`item${item.id}`} item={item} />)}
            {isLoading && (
                <div className="list-group-item text-start p-5">
                    <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
                        <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                        <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                    </ContentLoader>
                </div>
            )}
        </>
    );
};

export default ContentTypeAsResourceList;

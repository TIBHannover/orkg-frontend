import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ContentTypeSubFieldsFilter from '@/components/ContentTypeList/ContentTypeSubFieldsFilter';
import ContentTypeVisibilityFilter from '@/components/ContentTypeList/ContentTypeVisibilityFilter';
import { SubTitle, SubtitleSeparator } from '@/components/styled';

type ContentTypeListHeaderProps = {
    label?: string;
    isLoading: boolean;
    totalElements: number | undefined;
    showVisibilityFilter?: boolean;
    showSubFieldsFilter?: boolean;
};

const ContentTypeListHeader = ({
    label = 'Content',
    isLoading,
    totalElements,
    showVisibilityFilter = true,
    showSubFieldsFilter = false,
}: ContentTypeListHeaderProps) => {
    return (
        <div className="flex flex-col gap-3 mt-4 mb-4 md:flex-row md:items-center md:gap-2">
            <div className="flex grow items-center min-w-0">
                <h1 className="text-lg md:text-xl mb-0 mr-2 truncate">{label}</h1>
                <SubtitleSeparator />
                <SubTitle>
                    <small className="text-gray-500 text-small mt-1 whitespace-nowrap">
                        {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : `${totalElements} items`}
                    </small>
                </SubTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2 max-md:[&>*]:mr-0 max-md:[&>*>*]:w-full">
                {showSubFieldsFilter && <ContentTypeSubFieldsFilter isLoading={isLoading} />}
                {showVisibilityFilter && <ContentTypeVisibilityFilter isLoading={isLoading} />}
            </div>
        </div>
    );
};

export default ContentTypeListHeader;

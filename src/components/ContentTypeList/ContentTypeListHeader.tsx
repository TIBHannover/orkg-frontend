import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ContentTypeVisibilityFilter from 'components/ContentTypeList/ContentTypeVisibilityFilter';
import ContentTypeSubFieldsFilter from 'components/ContentTypeList/ContentTypeSubFieldsFilter';
import { SubTitle, SubtitleSeparator } from 'components/styled';

type ContentTypeListHeaderProps = {
    label?: string;
    isLoading: boolean;
    totalElements: number | undefined;
    page: number;
    showVisibilityFilter?: boolean;
    showSubFieldsFilter?: boolean;
};

const ContentTypeListHeader = ({
    label = 'Content',
    isLoading,
    totalElements,
    page,
    showVisibilityFilter = true,
    showSubFieldsFilter = false,
}: ContentTypeListHeaderProps) => {
    return (
        <div className="d-md-flex align-items-center mt-3 mb-3">
            <div className="d-flex flex-md-grow-1 align-items-center">
                <h1 className="h5 mb-0 me-2">{label}</h1>
                <SubtitleSeparator />
                <SubTitle>
                    <small className="text-muted text-small mt-1">
                        {page === 1 && isLoading ? <Icon icon={faSpinner} spin /> : `${totalElements} items`}
                    </small>
                </SubTitle>
            </div>

            {showSubFieldsFilter && <ContentTypeSubFieldsFilter isLoading={isLoading} />}
            {showVisibilityFilter && <ContentTypeVisibilityFilter isLoading={isLoading} />}
        </div>
    );
};

export default ContentTypeListHeader;

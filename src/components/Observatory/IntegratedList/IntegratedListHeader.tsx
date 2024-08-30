import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useRouter, useSearchParams } from 'next/navigation';
import Filters from 'components/Filters/Filters';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { ChangeEvent, FC } from 'react';
import { toast } from 'react-toastify';
import { Container, FormGroup, Input, Label } from 'reactstrap';

export const DEFAULT_CLASSES_FILTER = [
    { id: CLASSES.PAPER, label: 'Paper' },
    { id: CLASSES.COMPARISON, label: 'Comparison' },
    { id: CLASSES.VISUALIZATION, label: 'Visualization' },
];

type IntegratedListHeaderProps = {
    id: string;
    page: number;
    isLoading: boolean;
    totalElements?: number;
};

const IntegratedListHeader: FC<IntegratedListHeaderProps> = ({ id, page, isLoading, totalElements }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const classesFilter = searchParams.get('classesFilter')?.split(',');

    const handleChangeClassesFilterSelect = (_id: string) => {
        if (classesFilter?.includes(_id) && classesFilter.length === 1) {
            toast.dismiss();
            toast.info('At least one type should be selected');
        } else {
            const params = new URLSearchParams(searchParams.toString());
            params.set(
                'classesFilter',
                (classesFilter?.includes(_id) ? classesFilter.filter((v) => v !== _id) : [...(classesFilter ?? []), _id]).join(','),
            );
            router.push(`?${params.toString()}`, { scroll: false });
        }
    };

    const handleChangeVisibility = (e: ChangeEvent<HTMLInputElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', e.target.value);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <Container className="d-md-flex mt-4 mb-3 flex-md-column">
            <div className="d-md-flex align-items-center">
                <div className="d-flex flex-md-grow-1 align-items-center">
                    <h1 className="h5 mb-0 me-2">Content</h1>
                    <SubtitleSeparator />
                    <SubTitle>
                        <small className="text-muted text-small mt-1">
                            {page === 1 && isLoading ? <Icon icon={faSpinner} spin /> : <>{`${totalElements} items`}</>}
                        </small>
                    </SubTitle>
                </div>
                <div
                    className="d-md-flex mt-sm-2  me-md-2 rounded"
                    style={{ fontSize: '0.875rem', padding: '0.25rem 1.25rem', color: '#646464', backgroundColor: '#dcdee6' }}
                >
                    <div className="me-1"> Show:</div>
                    {DEFAULT_CLASSES_FILTER.map(({ id: _id, label }) => (
                        <FormGroup check key={_id} className="mb-0">
                            <Label check className="mb-0 ms-2" style={{ fontSize: '0.875rem' }}>
                                <Input
                                    onChange={() => handleChangeClassesFilterSelect(_id)}
                                    checked={classesFilter?.includes(_id)}
                                    type="checkbox"
                                    disabled={isLoading}
                                />
                                {label}
                            </Label>
                        </FormGroup>
                    ))}
                </div>
                <div className="mt-sm-2">
                    <div className="mb-0">
                        <Input
                            defaultValue={searchParams.get('sort') || VISIBILITY_FILTERS.TOP_RECENT}
                            onChange={handleChangeVisibility}
                            bsSize="sm"
                            type="select"
                            name="sort"
                            id="sortComparisons"
                            disabled={isLoading}
                        >
                            <option value={VISIBILITY_FILTERS.TOP_RECENT}>Top recent</option>
                            <option value={VISIBILITY_FILTERS.ALL_LISTED}>Recently added</option>
                            <option value={VISIBILITY_FILTERS.FEATURED}>Featured</option>
                            <option value={VISIBILITY_FILTERS.UNLISTED}>Unlisted</option>
                        </Input>
                    </div>
                </div>
            </div>
            <Filters id={id} />
        </Container>
    );
};

export default IntegratedListHeader;

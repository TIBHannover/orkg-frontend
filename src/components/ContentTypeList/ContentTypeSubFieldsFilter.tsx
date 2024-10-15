import { useQueryState } from 'nuqs';
import { ChangeEvent, FC } from 'react';
import { FormGroup, Input, Label } from 'reactstrap';

type ContentTypeSubFieldsFilterProps = {
    isLoading: boolean;
};

const ContentTypeSubFieldsFilter: FC<ContentTypeSubFieldsFilterProps> = ({ isLoading }) => {
    const [includeSubFields, setIncludeSubFields] = useQueryState('include_subfields', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const handleChangeIncludeSubFields = (e: ChangeEvent<HTMLInputElement>) => {
        setIncludeSubFields(e.target.checked, { scroll: false, history: 'push' });
    };

    return (
        <div className="d-flex justify-content-end align-items-center me-2">
            <div className="d-flex me-2 rounded">
                <FormGroup check className="mb-0">
                    <Label check className="mb-0">
                        <Input
                            name="include_subfields"
                            onChange={handleChangeIncludeSubFields}
                            type="checkbox"
                            disabled={isLoading}
                            {...(includeSubFields && { checked: true })}
                        />
                        Include subfields
                    </Label>
                </FormGroup>
            </div>
        </div>
    );
};

export default ContentTypeSubFieldsFilter;

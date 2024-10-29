import DataBrowserDialog from 'components/DataBrowser/DataBrowserDialog';
import { uniq } from 'lodash';
import { env } from 'next-runtime-env';
import PropTypes from 'prop-types';
import { memo, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { generatedFormattedLabel, updateResourceStatementsAction } from 'slices/contributionEditorSlice';

const TableCellValueResource = ({ value }) => {
    const [isModelOpen, setIsModalOpen] = useState(false);

    const dispatch = useDispatch();

    const { hasLabelFormat, labelFormat } = useSelector((state) => {
        // get all template ids
        let templateIds = [];
        const filter_classes = value?.classes?.filter((c) => c) ?? [];
        for (const c of filter_classes) {
            if (state.contributionEditor?.classes?.[c]) {
                templateIds = templateIds.concat(state.contributionEditor?.classes[c]?.templateIds);
            }
        }
        templateIds = uniq(templateIds);
        // check if it formatted label
        let hasLabelFormat = false;
        let labelFormat = '';
        for (const templateId of templateIds) {
            const template = state.contributionEditor.templates[templateId];
            if (template && !!template.formatted_label) {
                hasLabelFormat = true;
                labelFormat = template.formatted_label;
            }
        }
        return { hasLabelFormat, labelFormat };
    });

    const formattedLabel = useMemo(() => {
        if (value.classes) {
            if (!hasLabelFormat) {
                return value.label;
            }
            return generatedFormattedLabel(value, labelFormat);
        }
        return value.label;
    }, [hasLabelFormat, labelFormat, value]);

    return (
        <>
            <Button color="link" className="p-0 text-wrap user-select-auto" style={{ maxWidth: '100%' }} onClick={() => setIsModalOpen(true)}>
                {formattedLabel !== '' ? formattedLabel.toString() : <i>No label</i>}
            </Button>
            {isModelOpen && (
                <DataBrowserDialog
                    show
                    toggleModal={(v) => setIsModalOpen(!v)}
                    onCloseModal={() => dispatch(updateResourceStatementsAction(value.id))}
                    id={value.id}
                    label={value.label}
                    isEditMode={env('NEXT_PUBLIC_PWC_USER_ID') !== value.created_by ? true : undefined}
                    canEditSharedRootLevel={false}
                />
            )}
        </>
    );
};

TableCellValueResource.propTypes = {
    value: PropTypes.object.isRequired,
};

export default memo(TableCellValueResource);

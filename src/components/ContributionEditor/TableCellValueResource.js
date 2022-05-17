import { useState, useMemo, memo } from 'react';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import { generatedFormattedLabel, updateResourceStatementsAction } from 'slices/contributionEditorSlice';
import PropTypes from 'prop-types';
import { uniq } from 'lodash';
import env from '@beam-australia/react-env';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';

const TableCellValueResource = ({ value }) => {
    const [isModelOpen, setIsModalOpen] = useState(false);

    const dispatch = useDispatch();

    const { hasLabelFormat, labelFormat } = useSelector(state => {
        // get all template ids
        let templateIds = [];
        const filter_classes = value?.classes?.filter(c => c) ?? [];
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
            if (template && template.hasLabelFormat) {
                hasLabelFormat = true;
                labelFormat = template.labelFormat;
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
        } else {
            return value.label;
        }
    }, [hasLabelFormat, labelFormat, value]);

    return (
        <>
            <Button color="link" className="p-0 text-wrap user-select-auto" style={{ maxWidth: '100%' }} onClick={() => setIsModalOpen(true)}>
                {formattedLabel !== '' ? formattedLabel.toString() : <i>No label</i>}
            </Button>
            {isModelOpen && (
                <StatementBrowserDialog
                    toggleModal={v => setIsModalOpen(!v)}
                    id={value.id}
                    label={value.label}
                    show
                    enableEdit={env('PWC_USER_ID') !== value.created_by ? true : undefined}
                    syncBackend
                    canEditSharedRootLevel={false}
                    onCloseModal={() => dispatch(updateResourceStatementsAction(value.id))}
                />
            )}
        </>
    );
};

TableCellValueResource.propTypes = {
    value: PropTypes.object.isRequired
};

export default memo(TableCellValueResource);

import { deleteStatement } from 'slices/contributionEditorSlice';
import { ItemInnerSeparator } from 'components/Comparison/TableCell';
import TableCellButtons from 'components/ContributionEditor/TableCellButtons';
import TableCellValueResource from 'components/ContributionEditor/TableCellValueResource';
import TableCellForm from 'components/ContributionEditor/TableCellForm/TableCellForm';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { forwardRef, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import env from '@beam-australia/react-env';
import styled from 'styled-components';

const Value = styled.div`
    &:hover .cell-buttons {
        display: block;
    }
`;

const TableCellValue = forwardRef(({ value, index, setDisableCreate }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const dispatch = useDispatch();

    const handleStartEdit = () => {
        setIsEditing(true);
        setDisableCreate(true);
    };
    const handleStopEdit = () => {
        setIsEditing(false);
        setDisableCreate(false);
    };

    const handleDelete = () => {
        dispatch(deleteStatement(value.statementId));
    };

    return (
        <div ref={ref}>
            {!isEditing ? (
                <>
                    {index > 0 && <ItemInnerSeparator className="my-0" />}
                    <Value className="position-relative">
                        {value._class === ENTITIES.RESOURCE && <TableCellValueResource value={value} />}
                        {value._class === ENTITIES.LITERAL && (
                            <div role="textbox" tabIndex="0" onDoubleClick={env('PWC_USER_ID') !== value.created_by ? handleStartEdit : undefined}>
                                <ValuePlugins type={value._class} options={{ inModal: true }}>
                                    {value.label || <i>No label</i>}
                                </ValuePlugins>
                            </div>
                        )}

                        <TableCellButtons value={value} onEdit={handleStartEdit} onDelete={handleDelete} backgroundColor="rgba(240, 242, 247, 0.8)" />
                    </Value>
                </>
            ) : (
                <TableCellForm value={value} closeForm={handleStopEdit} />
            )}
        </div>
    );
});

TableCellValue.propTypes = {
    value: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    setDisableCreate: PropTypes.func.isRequired,
    propertyId: PropTypes.string.isRequired
};

export default memo(TableCellValue);

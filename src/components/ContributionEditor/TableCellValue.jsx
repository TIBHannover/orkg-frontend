import { env } from 'next-runtime-env';
import PropTypes from 'prop-types';
import { forwardRef, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { ItemInnerSeparator } from '@/components/Comparison/Table/Cells/TableCell';
import TableCellButtons from '@/components/ContributionEditor/TableCellButtons';
import TableCellForm from '@/components/ContributionEditor/TableCellForm/TableCellForm';
import TableCellValueResource from '@/components/ContributionEditor/TableCellValueResource';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import { deleteStatement } from '@/slices/contributionEditorSlice';

const Value = styled.div`
    &:hover .cell-buttons {
        display: block;
    }
`;

// eslint-disable-next-line react/display-name
const TableCellValue = forwardRef(({ value, index, setDisableCreate, contributionId, propertyId }, ref) => {
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
                            <div
                                role="textbox"
                                tabIndex="0"
                                onDoubleClick={env('NEXT_PUBLIC_PWC_USER_ID') !== value.created_by ? handleStartEdit : undefined}
                            >
                                {value.label ? (
                                    <ValuePlugins type={value._class} options={{ inModal: true }} datatype={value.datatype}>
                                        {value.label}
                                    </ValuePlugins>
                                ) : (
                                    <i>No label</i>
                                )}
                            </div>
                        )}

                        <TableCellButtons
                            contributionId={contributionId}
                            propertyId={propertyId}
                            value={value}
                            onEdit={handleStartEdit}
                            onDelete={handleDelete}
                            backgroundColor="rgba(240, 242, 247, 0.8)"
                        />
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
    propertyId: PropTypes.string.isRequired,
    contributionId: PropTypes.string,
};

export default memo(TableCellValue);

import TableCellValue from 'components/ContributionEditor/TableCellValue';
import TableCellValueCreate from 'components/ContributionEditor/TableCellValueCreate';
import { Item, ItemInner } from 'components/Comparison/TableCell';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import env from '@beam-australia/react-env';
import { useSelector } from 'react-redux';
import FlipMove from 'react-flip-move';

const TableCell = ({ values, contributionId, propertyId }) => {
    const [disableCreate, setDisableCreate] = useState(false);
    const contribution = useSelector(state => state.contributionEditor.contributions[contributionId] || '');

    return (
        <Item className="position-relative">
            <ItemInner cellPadding={10}>
                <FlipMove duration={700} enterAnimation="accordionVertical" leaveAnimation="accordionVertical">
                    {values.map((value, index) => {
                        if (Object.keys(value).length === 0) {
                            return null;
                        }
                        return (
                            <TableCellValue
                                propertyId={propertyId}
                                key={`value-${value.statementId}`}
                                value={value}
                                index={index}
                                setDisableCreate={setDisableCreate}
                            />
                        );
                    })}
                </FlipMove>
                {env('PWC_USER_ID') !== contribution?.created_by && (
                    <TableCellValueCreate
                        isVisible={!disableCreate}
                        contributionId={contributionId}
                        propertyId={propertyId}
                        isEmptyCell={values.length === 0}
                    />
                )}
            </ItemInner>
        </Item>
    );
};

TableCell.propTypes = {
    values: PropTypes.array,
    contributionId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired
};

const propsAreEqual = (prevProps, nextProps) => isEqual(prevProps, nextProps);

export default memo(TableCell, propsAreEqual);

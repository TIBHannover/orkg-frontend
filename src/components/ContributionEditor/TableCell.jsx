import { isEqual } from 'lodash';
import { env } from 'next-runtime-env';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import FlipMove from 'react-flip-move';
import { useSelector } from 'react-redux';

import { Item, ItemInner } from '@/components/Comparison/Table/Cells/TableCell';
import TableCellValue from '@/components/ContributionEditor/TableCellValue';
import TableCellValueCreate from '@/components/ContributionEditor/TableCellValueCreate';
import { EXTRACTION_METHODS } from '@/constants/misc';

const TableCell = ({ values, contributionId, propertyId }) => {
    const [disableCreate, setDisableCreate] = useState(false);
    const contribution = useSelector((state) => state.contributionEditor.contributions[contributionId] || '');
    const backgroundColor = contribution.extraction_method === EXTRACTION_METHODS.AUTOMATIC ? '#ecf6f8' : '';
    return (
        <Item className="position-relative">
            <ItemInner cellPadding={10} $backgroundColor={backgroundColor}>
                <FlipMove duration={700} enterAnimation="accordionVertical" leaveAnimation="accordionVertical">
                    {values.map((value, index) => {
                        if (Object.keys(value).length === 0) {
                            return null;
                        }
                        return (
                            <TableCellValue
                                propertyId={propertyId}
                                contributionId={contributionId}
                                key={`value-${value.statementId}`}
                                value={value}
                                index={index}
                                setDisableCreate={setDisableCreate}
                            />
                        );
                    })}
                </FlipMove>
                {env('NEXT_PUBLIC_PWC_USER_ID') !== contribution?.created_by && (
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
    propertyId: PropTypes.string.isRequired,
};

const propsAreEqual = (prevProps, nextProps) => isEqual(prevProps, nextProps);

export default memo(TableCell, propsAreEqual);

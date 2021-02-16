import { updateContribution } from 'actions/bulkContributionEditor';
import useBulkContributionEditor from 'components/BulkContributionEditor/hooks/useBulkContributionEditor';
import TableCellValueButtons from 'components/BulkContributionEditor/TableCellButtons';
import { Contribution, ItemHeader, ItemHeaderInner } from 'components/Comparison/styled';
import EditPaperDialog from 'components/ViewPaper/EditDialog/EditPaperDialog';
import useEditPaper from 'components/ViewPaper/EditDialog/hooks/useEditPaper';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

const TableHeaderColumn = ({ contribution }) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [data, setData] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const { handleRemoveContribution } = useBulkContributionEditor();
    const { loadPaperData } = useEditPaper();
    const dispatch = useDispatch();

    const handleEditPaper = async () => {
        setIsOpenEditModal(true);

        // load the paper data if it isn't fetched already
        if (!data) {
            const paper = await loadPaperData(contribution.paperId);
            setData(paper);
        }
    };

    const handleUpdatePaper = newData => {
        setData(newData);
        setIsOpenEditModal(false);
        dispatch(
            updateContribution({
                id: contribution.id,
                title: newData.paper?.label,
                year: newData.year?.label || null
            })
        );
    };

    return (
        <ItemHeader key={contribution.id} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <ItemHeaderInner className="position-relative">
                {contribution.title ? contribution.title : <em>No title</em>}
                <br />
                <Contribution>
                    {contribution.year && `${contribution.year} - `}
                    {contribution.contributionLabel}
                </Contribution>
                <TableCellValueButtons
                    isHovering={isHovering}
                    onEdit={handleEditPaper}
                    onDelete={() => handleRemoveContribution(contribution.id)}
                    backgroundColor="rgba(232, 97, 97, 0.8)"
                    style={{ top: 0, borderTopRightRadius: 10 }}
                />
            </ItemHeaderInner>

            {data && isOpenEditModal && (
                <EditPaperDialog paperData={data} afterUpdate={handleUpdatePaper} toggle={v => setIsOpenEditModal(!v)} isOpen />
            )}
        </ItemHeader>
    );
};

TableHeaderColumn.propTypes = {
    contribution: PropTypes.object
};

export default TableHeaderColumn;

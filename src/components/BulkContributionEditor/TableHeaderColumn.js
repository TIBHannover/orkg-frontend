import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { updateContribution } from 'actions/bulkContributionEditor';
import useBulkContributionEditor from 'components/BulkContributionEditor/hooks/useBulkContributionEditor';
import { Contribution, Delete, ItemHeader, ItemHeaderInner } from 'components/Comparison/styled';
import EditPaperDialog from 'components/ViewPaper/EditDialog/EditPaperDialog';
import useEditPaper from 'components/ViewPaper/EditDialog/hooks/useEditPaper';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import 'react-table-hoc-fixed-columns/lib/styles.css'; // important: this line must be placed after react-table css import
import { Button } from 'reactstrap';

const TableHeaderColumn = ({ contribution }) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [data, setData] = useState(null);
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
        <ItemHeader key={contribution.id}>
            <ItemHeaderInner className="position-relative">
                <Tippy content="Edit paper's metadata">
                    <div>
                        <Button color="link" className="text-white p-0 text-left" onClick={handleEditPaper}>
                            {contribution.title ? contribution.title : <em>No title</em>}
                        </Button>
                    </div>
                </Tippy>
                <Contribution>
                    {contribution.year && `${contribution.year} - `}
                    {contribution.contributionLabel}
                </Contribution>

                <Delete style={{ right: -5 }} onClick={() => handleRemoveContribution(contribution.id)}>
                    <Tippy content="Remove contribution from bulk editor">
                        <span>
                            <Icon icon={faTimes} />
                        </span>
                    </Tippy>
                </Delete>
            </ItemHeaderInner>

            {isOpenEditModal && (
                <EditPaperDialog paperData={data} afterUpdate={handleUpdatePaper} toggle={v => setIsOpenEditModal(!v)} isOpen showPaperLink />
            )}
        </ItemHeader>
    );
};

TableHeaderColumn.propTypes = {
    contribution: PropTypes.object
};

export default TableHeaderColumn;

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { updatePaper } from 'actions/bulkContributionEditor';
import useBulkContributionEditor from 'components/BulkContributionEditor/hooks/useBulkContributionEditor';
import { Contribution, Delete, ItemHeader, ItemHeaderInner } from 'components/Comparison/styled';
import EditPaperDialog from 'components/ViewPaper/EditDialog/EditPaperDialog';
import useEditPaper from 'components/ViewPaper/EditDialog/hooks/useEditPaper';
import PropTypes from 'prop-types';
import { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';

const TableHeaderColumn = ({ contribution, paper }) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [data, setData] = useState(null);
    const { handleRemoveContribution } = useBulkContributionEditor();
    const { loadPaperData } = useEditPaper();
    const dispatch = useDispatch();

    const handleEditPaper = async () => {
        setIsOpenEditModal(true);

        // load the paper data if it isn't fetched already
        if (!data) {
            const paperData = await loadPaperData(paper.id);
            setData(paperData);
        }
    };

    const handleUpdatePaper = newData => {
        setData(newData);
        setIsOpenEditModal(false);
        dispatch(
            updatePaper({
                id: paper.id,
                title: newData.paper?.label
            })
        );
    };

    return (
        <ItemHeader key={contribution.id}>
            <ItemHeaderInner className="position-relative bulk-editor">
                <Tippy content="Edit paper's metadata">
                    <span>
                        <Button color="link" className="text-darkblueDarker p-0 text-left" onClick={handleEditPaper}>
                            {paper.label || <em>No title</em>}
                        </Button>
                    </span>
                </Tippy>
                <Contribution className="bulk-editor">{contribution.label}</Contribution>

                <Delete className="bulk-editor" onClick={() => handleRemoveContribution(contribution.id)}>
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
    contribution: PropTypes.object.isRequired,
    paper: PropTypes.object.isRequired
};

export default memo(TableHeaderColumn);

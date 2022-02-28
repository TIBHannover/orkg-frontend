import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { paperUpdated, contributionUpdated, fetchTemplatesOfClassIfNeeded } from 'slices/contributionEditorSlice';
import useContributionEditor from 'components/ContributionEditor/hooks/useContributionEditor';
import { Contribution, Delete, ItemHeader, ItemHeaderInner, ContributionButton } from 'components/Comparison/styled';
import EditPaperDialog from 'components/ViewPaper/EditDialog/EditPaperDialog';
import EditResourceDialog from 'components/EditResourceDialog/EditResourceDialog';
import useEditPaper from 'components/ViewPaper/EditDialog/hooks/useEditPaper';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import env from '@beam-australia/react-env';
import { toast } from 'react-toastify';
import { memo, useState, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'reactstrap';
import { CLASSES } from 'constants/graphSettings';

const TableHeaderColumn = ({ contribution, paper }) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [isOpenContributionModal, setIsOpenContributionModal] = useState(false);
    const [data, setData] = useState(null);
    const { handleRemoveContribution } = useContributionEditor();
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
            paperUpdated({
                id: paper.id,
                title: newData.paper?.label,
                researchField: newData.researchField
            })
        );
    };

    const handleUpdateContribution = newContribution => {
        setIsOpenEditModal(false);
        dispatch(contributionUpdated(newContribution));
        // Fetch templates of the classes
        newContribution?.classes?.filter(c => c).map(classID => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
        toast.success('Contribution updated successfully');
    };

    return (
        <ItemHeader key={contribution.id}>
            <ItemHeaderInner className="position-relative contribution-editor">
                <Tippy content="Edit paper's metadata" disabled={env('PWC_USER_ID') === contribution.created_by}>
                    <span>
                        <Button
                            color="link"
                            className="text-secondary-darker p-0 text-start text-decoration-none"
                            onClick={env('PWC_USER_ID') !== contribution.created_by ? handleEditPaper : undefined}
                        >
                            {paper.label || <em>No title</em>}
                        </Button>
                    </span>
                </Tippy>
                <Contribution className="contribution-editor">
                    <ContributionButton color="link" onClick={() => setIsOpenContributionModal(true)}>
                        <Tippy
                            interactive={true}
                            appendTo={document.body}
                            content={
                                <>
                                    Instance of:{' '}
                                    {contribution.classes?.map((c, index) => (
                                        <Fragment key={c}>
                                            <Link target="_blank" to={reverse(ROUTES.CLASS, { id: c })}>
                                                {c}
                                            </Link>
                                            {index + 1 !== contribution.classes.length && ', '}
                                        </Fragment>
                                    ))}
                                    {contribution.classes?.length === 0 && <i className="text-secondary">No classes</i>}
                                </>
                            }
                        >
                            <span>{contribution.label}</span>
                        </Tippy>
                    </ContributionButton>
                </Contribution>

                <Delete className="contribution-editor" onClick={() => handleRemoveContribution(contribution.id)}>
                    <Tippy content="Remove contribution from contribution editor">
                        <span>
                            <Icon icon={faTimes} />
                        </span>
                    </Tippy>
                </Delete>
            </ItemHeaderInner>

            {isOpenContributionModal && (
                <EditResourceDialog
                    resource={contribution}
                    afterUpdate={handleUpdateContribution}
                    toggle={v => setIsOpenContributionModal(!v)}
                    isOpen
                    showResourceLink
                    fixedClasses={[CLASSES.CONTRIBUTION]}
                />
            )}

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

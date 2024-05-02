import Link from 'components/NextJsMigration/Link';
import env from 'components/NextJsMigration/env';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { Contribution, ContributionButton, Delete, ItemHeader, ItemHeaderInner } from 'components/Comparison/styled';
import useContributionEditor from 'components/ContributionEditor/hooks/useContributionEditor';
import EditResourceDialog from 'components/EditResourceDialog/EditResourceDialog';
import EditPaperModal from 'components/PaperForm/EditPaperModal';
import useUsedTemplates from 'components/StatementBrowser/TemplatesModal/hooks/useUsedTemplates';
import TemplateTooltip from 'components/TemplateTooltip/TemplateTooltip';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Fragment, memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from 'reactstrap';
import { contributionUpdated, fetchTemplatesOfClassIfNeeded, paperUpdated } from 'slices/contributionEditorSlice';
import { getPaper } from 'services/backend/papers';

const TableHeaderColumn = ({ contribution, paper }) => {
    const [isOpenEditModal, setIsOpenEditModal] = useState(false);
    const [isOpenContributionModal, setIsOpenContributionModal] = useState(false);
    const [data, setData] = useState(null);
    const { handleRemoveContribution } = useContributionEditor();
    const dispatch = useDispatch();
    const { usedTemplates, isLoadingUsedTemplates } = useUsedTemplates({ resourceObject: contribution });

    const handleEditPaper = async () => {
        setIsOpenEditModal(true);

        // load the paper data if it isn't fetched already
        if (!data) {
            setData(await getPaper(paper.id));
        }
    };

    const handleUpdatePaper = (newData) => {
        setData(newData);
        setIsOpenEditModal(false);
        dispatch(
            paperUpdated({
                id: paper.id,
                title: newData.title,
                researchField: newData.researchFields?.[0],
            }),
        );
    };

    const handleUpdateContribution = (newContribution) => {
        setIsOpenEditModal(false);
        dispatch(contributionUpdated(newContribution));
        // Fetch templates of the classes
        newContribution?.classes?.filter((c) => c).map((classID) => dispatch(fetchTemplatesOfClassIfNeeded(classID)));
        toast.success('Contribution updated successfully');
    };

    return (
        <ItemHeader key={contribution.id}>
            <ItemHeaderInner className="position-relative contribution-editor">
                <Tippy content="Edit paper's metadata" disabled={env('NEXT_PUBLIC_PWC_USER_ID') === contribution.created_by}>
                    <span>
                        <Button
                            color="link"
                            className="text-secondary-darker p-0 text-start text-decoration-none user-select-auto"
                            onClick={env('NEXT_PUBLIC_PWC_USER_ID') !== contribution.created_by ? handleEditPaper : undefined}
                        >
                            {paper.label || <em>No title</em>}
                        </Button>
                    </span>
                </Tippy>
                <Contribution className="contribution-editor">
                    <ContributionButton color="link" className="user-select-auto" onClick={() => setIsOpenContributionModal(true)}>
                        <Tippy
                            interactive
                            appendTo={document.body}
                            content={
                                <>
                                    Instance of:{' '}
                                    {contribution.classes?.map((c, index) => (
                                        <Fragment key={c}>
                                            <Link target="_blank" href={reverse(ROUTES.CLASS, { id: c })}>
                                                {c}
                                            </Link>
                                            {index + 1 !== contribution.classes.length && ', '}
                                        </Fragment>
                                    ))}
                                    {contribution.classes?.length === 0 && <i className="text-secondary">No classes</i>}
                                    <br />
                                    Applied {pluralize('template', usedTemplates?.length ?? 0, false)}:{' '}
                                    {!isLoadingUsedTemplates && (
                                        <>
                                            {usedTemplates?.map((t, index) => (
                                                <Fragment key={t.id}>
                                                    <TemplateTooltip id={t.id}>
                                                        <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id: t.id })}>
                                                            {t.label}
                                                        </Link>
                                                    </TemplateTooltip>
                                                    {index + 1 !== usedTemplates.length && ', '}
                                                </Fragment>
                                            ))}
                                            {usedTemplates?.length === 0 && <i>No templates applied</i>}
                                        </>
                                    )}
                                    {isLoadingUsedTemplates && (
                                        <div style={{ padding: '3.5px 0' }}>
                                            <i>Loading ...</i>
                                        </div>
                                    )}
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
                    toggle={(v) => setIsOpenContributionModal(!v)}
                    isOpen
                    showResourceLink
                    fixedClasses={[CLASSES.CONTRIBUTION]}
                />
            )}
            {isOpenEditModal && (
                <EditPaperModal paperData={data} afterUpdate={handleUpdatePaper} toggle={(v) => setIsOpenEditModal(!v)} isPaperLinkVisible />
            )}
        </ItemHeader>
    );
};

TableHeaderColumn.propTypes = {
    contribution: PropTypes.object.isRequired,
    paper: PropTypes.object.isRequired,
};

export default memo(TableHeaderColumn);

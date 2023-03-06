import { useState } from 'react';
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faPen, faTimes, faEllipsisV, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { useSelector } from 'react-redux';
import Publish from 'components/ViewPaper/Publish/Publish';
import ViewPaperButton from 'components/ViewPaper/PaperHeaderBar/ViewPaperButton';
import { getPaperLink } from 'slices/viewPaperSlice';
import PreventModal from 'components/Resource/PreventModal/PreventModal';

function PaperMenuBar(props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOpenPWCModal, setIsOpenPWCModal] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const id = useSelector(state => state.viewPaper.paperResource?.id);
    const label = useSelector(state => state.viewPaper.paperResource?.label);
    const doi = useSelector(state => state.viewPaper.doi?.label);
    const paperLink = useSelector(getPaperLink);

    return (
        <>
            <ViewPaperButton paperLink={paperLink} doi={doi} title={label} />
            <Button className="flex-shrink-0" color="secondary" size="sm" style={{ marginRight: 2 }} onClick={() => props.toggle('showGraphModal')}>
                <Icon icon={faProjectDiagram} style={{ margin: '2px 4px 0 0' }} /> Graph view
            </Button>
            {!props.editMode && (
                <RequireAuthentication
                    component={Button}
                    className="flex-shrink-0"
                    style={{ marginRight: 2 }}
                    color="secondary"
                    size="sm"
                    onClick={() => (!props.disableEdit ? props.toggle('editMode') : setIsOpenPWCModal(true))}
                >
                    <Icon icon={faPen} /> Edit
                </RequireAuthentication>
            )}

            {props.editMode && (
                <Button
                    className="flex-shrink-0"
                    style={{ marginRight: 2 }}
                    color="secondary-darker"
                    size="sm"
                    disabled={props.disableEdit}
                    onClick={() => props.toggle('editMode')}
                >
                    <Icon icon={faTimes} /> Stop editing
                </Button>
            )}

            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)}>
                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end">
                    <Icon icon={faEllipsisV} />
                </DropdownToggle>
                <DropdownMenu end>
                    <RequireAuthentication component={DropdownItem} onClick={() => setShowPublishDialog(v => !v)}>
                        Publish
                    </RequireAuthentication>
                    <DropdownItem divider />
                    <DropdownItem tag={NavLink} end to={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                        View resource
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>

            <PreventModal
                isOpen={isOpenPWCModal}
                toggle={() => setIsOpenPWCModal(v => !v)}
                header="We are working on it!"
                content={
                    <>
                        This resource was imported from an external source and our provenance feature is in active development, and due to that, this
                        resource cannot be edited. <br />
                        Meanwhile, you can visit{' '}
                        <a
                            href={label ? `https://paperswithcode.com/search?q_meta=&q_type=&q=${label}` : 'https://paperswithcode.com/'}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            paperswithcode <Icon icon={faExternalLinkAlt} className="me-1" />
                        </a>{' '}
                        website to suggest changes.
                    </>
                }
            />

            <Publish showDialog={showPublishDialog} toggle={() => setShowPublishDialog(v => !v)} />
        </>
    );
}

PaperMenuBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    disableEdit: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default PaperMenuBar;

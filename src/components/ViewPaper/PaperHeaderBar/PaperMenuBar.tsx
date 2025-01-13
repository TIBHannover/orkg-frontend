import { faEllipsisV, faExternalLinkAlt, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import PreventModal from 'components/Resource/PreventModal/PreventModal';
import AccessPaperButton from 'components/ViewPaper/PaperHeaderBar/AccessPaperButton';
import Publish from 'components/ViewPaper/Publish/Publish';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { RootStore } from 'slices/types';
import { getPaperLink } from 'slices/viewPaperSlice';

type PaperMenuBarProps = {
    editMode: boolean;
    disableEdit: boolean;
    toggle: (key: string) => void;
};

const PaperMenuBar: FC<PaperMenuBarProps> = ({ editMode, disableEdit, toggle }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOpenPWCModal, setIsOpenPWCModal] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const id = useSelector((state: RootStore) => state.viewPaper.paper.id);
    const title = useSelector((state: RootStore) => state.viewPaper.paper.title);
    const doi = useSelector((state: RootStore) => state.viewPaper.paper.identifiers?.doi?.[0]);
    const paperLink = useSelector(getPaperLink);

    return (
        <>
            <AccessPaperButton paperLink={paperLink} doi={doi} title={title} />
            {!editMode && (
                <RequireAuthentication
                    component={Button}
                    className="flex-shrink-0"
                    style={{ marginRight: 2 }}
                    color="secondary"
                    size="sm"
                    onClick={() => (!disableEdit ? toggle('editMode') : setIsOpenPWCModal(true))}
                >
                    <FontAwesomeIcon icon={faPen} /> Edit
                </RequireAuthentication>
            )}
            {editMode && (
                <Button
                    className="flex-shrink-0"
                    style={{ marginRight: 2 }}
                    color="secondary-darker"
                    size="sm"
                    disabled={disableEdit}
                    onClick={() => toggle('editMode')}
                >
                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                </Button>
            )}
            <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen((v) => !v)}>
                <DropdownToggle size="sm" color="secondary" className="px-3 rounded-end">
                    <FontAwesomeIcon icon={faEllipsisV} />
                </DropdownToggle>
                <DropdownMenu>
                    <RequireAuthentication component={DropdownItem} onClick={() => setShowPublishDialog((v) => !v)}>
                        Publish
                    </RequireAuthentication>
                    <DropdownItem divider />
                    <DropdownItem onClick={() => toggle('showGraphModal')}>View graph</DropdownItem>
                    <DropdownItem tag={Link} href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                        View resource
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
            <PreventModal
                isOpen={isOpenPWCModal}
                toggle={() => setIsOpenPWCModal((v) => !v)}
                header="We are working on it!"
                content={
                    <>
                        This resource was imported from an external source and our provenance feature is in active development, and due to that, this
                        resource cannot be edited. <br />
                        Meanwhile, you can visit{' '}
                        <a
                            href={title ? `https://paperswithcode.com/search?q_meta=&q_type=&q=${title}` : 'https://paperswithcode.com/'}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            paperswithcode <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                        </a>{' '}
                        website to suggest changes.
                    </>
                }
            />
            <Publish showDialog={showPublishDialog} toggle={() => setShowPublishDialog((v) => !v)} />
        </>
    );
};

export default PaperMenuBar;

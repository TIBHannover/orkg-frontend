import { faEllipsisV, faExternalLinkAlt, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';

import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import PreventModal from '@/components/Resource/PreventModal/PreventModal';
import Button from '@/components/Ui/Button/Button';
import ButtonDropdown from '@/components/Ui/Button/ButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import AccessPaperButton from '@/components/ViewPaper/PaperHeaderBar/AccessPaperButton';
import Publish from '@/components/ViewPaper/Publish/Publish';
import ROUTES from '@/constants/routes';
import { Paper } from '@/services/backend/types';

type PaperMenuBarProps = {
    editMode: boolean;
    disableEdit: boolean;
    toggle: (key: string) => void;
};

const getPaperLink = (paper?: Paper) => {
    if (paper?.publication_info?.url) {
        return paper.publication_info?.url;
    }
    if (paper?.identifiers?.doi?.[0] && paper?.identifiers?.doi?.[0].startsWith('10.')) {
        return `https://doi.org/${paper?.identifiers?.doi?.[0]}`;
    }
    return '';
};

const PaperMenuBar: FC<PaperMenuBarProps> = ({ editMode, disableEdit, toggle }) => {
    const { resourceId } = useParams();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOpenPWCModal, setIsOpenPWCModal] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const { paper } = useViewPaper({ paperId: resourceId });
    const id = paper?.id;
    const title = paper?.title;
    const doi = paper?.identifiers?.doi?.[0];
    const paperLink = getPaperLink(paper);

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

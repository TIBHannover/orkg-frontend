import { faEllipsisV, faExternalLinkAlt, faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Separator } from '@heroui/react';
import { FC, useState } from 'react';

import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import PreventModal from '@/components/Resource/PreventModal/PreventModal';
import ShareLinkMarker from '@/components/ShareLinkMarker/ShareLinkMarker';
import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import AccessPaperButton from '@/components/ViewPaper/PaperHeaderBar/AccessPaperButton';
import Publish from '@/components/ViewPaper/Publish/Publish';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
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
                    className="button--orkg-secondary shrink-0"
                    size="sm"
                    onClick={() => (!disableEdit ? toggle('editMode') : setIsOpenPWCModal(true))}
                >
                    <FontAwesomeIcon icon={faPen} /> Edit
                </RequireAuthentication>
            )}
            {editMode && (
                <Button className="button--orkg-secondary-darker shrink-0" size="sm" isDisabled={disableEdit} onPress={() => toggle('editMode')}>
                    <FontAwesomeIcon icon={faTimes} /> Stop editing
                </Button>
            )}
            <ShareLinkMarker typeOfLink="paper" title={title ?? ''} buttonProps={{ className: 'button--orkg-secondary shrink-0' }} />
            <Dropdown>
                <Button size="sm" className="button--orkg-secondary shrink-0" isIconOnly aria-label="More options">
                    <FontAwesomeIcon icon={faEllipsisV} />
                </Button>
                <Dropdown.Popover placement="bottom end">
                    <Dropdown.Menu>
                        <RequireAuthentication component={Dropdown.Item} textValue="Publish" onAction={() => setShowPublishDialog((v) => !v)}>
                            Publish
                        </RequireAuthentication>
                        <Separator className="my-1" />
                        <Dropdown.Item textValue="View graph" onAction={() => toggle('showGraphModal')}>
                            View graph
                        </Dropdown.Item>
                        <Dropdown.Item href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`} textValue="View resource">
                            View resource
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown.Popover>
            </Dropdown>
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
                            paperswithcode <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
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

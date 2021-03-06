import { useState } from 'react';
import { Button, ButtonGroup, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faPen, faTimes, faFile, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import PapersWithCodeModal from 'components/PapersWithCodeModal/PapersWithCodeModal';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';

function PaperMenuBar(props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOpenPWCModal, setIsOpenPWCModal] = useState(false);

    return (
        <>
            <ButtonGroup className="flex-shrink-0">
                {props.paperLink && (
                    <a href={props.paperLink} className="btn btn-secondary flex-shrink-0 btn-sm" target="_blank" rel="noopener noreferrer">
                        <Icon icon={faFile} style={{ margin: '2px 4px 0 0' }} /> View paper
                    </a>
                )}
                <Button
                    className="flex-shrink-0"
                    color="secondary"
                    size="sm"
                    style={{ marginLeft: 1 }}
                    onClick={() => props.toggle('showGraphModal')}
                >
                    <Icon icon={faProjectDiagram} style={{ margin: '2px 4px 0 0' }} /> Graph view
                </Button>

                {!props.editMode && (
                    <RequireAuthentication
                        component={Button}
                        className="flex-shrink-0"
                        style={{ marginLeft: 1 }}
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
                        style={{ marginLeft: 1 }}
                        color="secondary-darker"
                        size="sm"
                        disabled={props.disableEdit}
                        onClick={() => props.toggle('editMode')}
                    >
                        <Icon icon={faTimes} /> Stop editing
                    </Button>
                )}

                <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                    <DropdownToggle size="sm" color="secondary" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                        <Icon icon={faEllipsisV} />
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: props.id })}>
                            View resource
                        </DropdownItem>
                    </DropdownMenu>
                </ButtonDropdown>
            </ButtonGroup>
            <PapersWithCodeModal isOpen={isOpenPWCModal} toggle={() => setIsOpenPWCModal(v => !v)} label={props.label} />
        </>
    );
}

PaperMenuBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    disableEdit: PropTypes.bool.isRequired,
    paperLink: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    toggle: PropTypes.func.isRequired
};

export default PaperMenuBar;

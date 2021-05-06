import { useState } from 'react';
import { Button, ButtonGroup, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faPen, faTimes, faFile, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';

function PaperMenuBar(props) {
    const [menuOpen, setMenuOpen] = useState(false);

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

                {!props.editMode && !props.disableEdit && (
                    <RequireAuthentication
                        component={Button}
                        className="flex-shrink-0"
                        style={{ marginLeft: 1 }}
                        color="secondary"
                        size="sm"
                        onClick={() => props.toggle('editMode')}
                    >
                        <Icon icon={faPen} /> Edit
                    </RequireAuthentication>
                )}

                {props.editMode && !props.disableEdit && (
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

                {props.disableEdit && (
                    <Tippy content="This paper cannot be edited because it is from an external source. Our provenance feature is in active development.">
                        <span className="btn btn-secondary btn-sm disabled">
                            <Icon icon={faPen} /> <span>Edit</span>
                        </span>
                    </Tippy>
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
        </>
    );
}

PaperMenuBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    disableEdit: PropTypes.bool.isRequired,
    paperLink: PropTypes.string,
    id: PropTypes.string,
    toggle: PropTypes.func.isRequired
};

export default PaperMenuBar;

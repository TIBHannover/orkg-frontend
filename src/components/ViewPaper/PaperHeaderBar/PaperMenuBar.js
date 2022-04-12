import { useState } from 'react';
import { Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faPen, faTimes, faFile, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import PapersWithCodeModal from 'components/PapersWithCodeModal/PapersWithCodeModal';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import { connect } from 'react-redux';
import { openAuthDialog } from 'slices/authSlice';
import Publish from 'components/ViewPaper/Publish/Publish';

function PaperMenuBar(props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOpenPWCModal, setIsOpenPWCModal] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);

    return (
        <>
            {props.paperLink && (
                <a
                    href={props.paperLink}
                    className="btn btn-secondary flex-shrink-0 btn-sm"
                    style={{ marginRight: 2 }}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Icon icon={faFile} style={{ margin: '2px 4px 0 0' }} /> View paper
                </a>
            )}
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
                    <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: props.id })}>
                        View resource
                    </DropdownItem>
                    <DropdownItem
                        onClick={e => {
                            if (!props.user) {
                                props.openAuthDialog({ action: 'signin', signInRequired: true });
                            } else {
                                setShowPublishDialog(v => !v);
                            }
                        }}
                    >
                        Publish
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>

            <PapersWithCodeModal isOpen={isOpenPWCModal} toggle={() => setIsOpenPWCModal(v => !v)} label={props.label} />
            <Publish showDialog={showPublishDialog} toggle={() => setShowPublishDialog(v => !v)} paperId={props.id} label={props.label} />
        </>
    );
}

const mapStateToProps = state => ({
    user: state.auth.user
});

const mapDispatchToProps = dispatch => ({
    openAuthDialog: payload => dispatch(openAuthDialog(payload))
});

PaperMenuBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    disableEdit: PropTypes.bool.isRequired,
    paperLink: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.string,
    toggle: PropTypes.func.isRequired,
    openAuthDialog: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    dataCiteDoi: PropTypes.string
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PaperMenuBar);

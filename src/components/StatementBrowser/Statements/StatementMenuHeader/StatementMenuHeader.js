import { useRef } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import SBEditorHelpModal from 'components/StatementBrowser/SBEditorHelpModal/SBEditorHelpModal';
import TemplatesModal from 'components/StatementBrowser/TemplatesModal/TemplatesModal';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faPuzzlePiece, faSlidersH, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { setIsHelpModalOpen, setIsTemplateModalOpen, setIsPreferencesOpen } from 'actions/statementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import Preferences from 'components/StatementBrowser/Preferences/Preferences';

export default function StatementMenuHeader(props) {
    const isPreferencesOpen = useSelector(state => state.statementBrowser.isPreferencesOpen);
    const dispatch = useDispatch();
    const preferencesTippy = useRef(null);

    return (
        <>
            <div className="mb-2 text-right">
                <ButtonGroup>
                    {/* We have custom templates for predicates and classes*/}
                    {props.enableEdit && props.resource._class === ENTITIES.RESOURCE && (
                        <Button
                            className="p-0"
                            outline
                            color="secondary"
                            size="sm"
                            onClick={() => dispatch(setIsTemplateModalOpen({ isOpen: true }))}
                        >
                            <Tippy content="Select a template to use it in your data">
                                <div className="px-3 py-1">
                                    <Icon className="mr-1" icon={faPuzzlePiece} /> Templates
                                </div>
                            </Tippy>
                            <TemplatesModal syncBackend={props.syncBackend} />
                        </Button>
                    )}
                    {props.enableEdit && (
                        <Button outline color="secondary" size="sm" onClick={() => dispatch(setIsHelpModalOpen({ isOpen: true }))}>
                            <Icon className="mr-1" icon={faQuestionCircle} /> Help
                        </Button>
                    )}

                    <Button className="p-0" outline color={!props.enableEdit ? 'link' : 'secondary'} size="sm" onClick={() => null}>
                        <Tippy
                            onCreate={instance => (preferencesTippy.current = instance)}
                            onShow={() => dispatch(setIsPreferencesOpen(true))}
                            onHide={() => dispatch(setIsPreferencesOpen(false))}
                            trigger="click"
                            content={<Preferences closeTippy={() => preferencesTippy.current.hide()} />}
                            interactive
                            appendTo={document.body}
                        >
                            <div className={`${props.enableEdit ? 'px-3' : 'text-muted'} py-1`}>
                                <Icon fixedWidth={true} className="mr-1" icon={!isPreferencesOpen ? faSlidersH : faTimes} /> Preferences
                            </div>
                        </Tippy>
                    </Button>
                </ButtonGroup>
            </div>

            <SBEditorHelpModal />
        </>
    );
}

StatementMenuHeader.propTypes = {
    resource: PropTypes.object.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired
};

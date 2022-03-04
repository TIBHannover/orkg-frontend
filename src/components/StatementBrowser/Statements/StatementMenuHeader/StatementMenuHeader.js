import { useRef } from 'react';
import { Button, ButtonGroup, UncontrolledAlert } from 'reactstrap';
import SBEditorHelpModal from 'components/StatementBrowser/SBEditorHelpModal/SBEditorHelpModal';
import TemplatesModal from 'components/StatementBrowser/TemplatesModal/TemplatesModal';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faPuzzlePiece, faSlidersH, faTimes } from '@fortawesome/free-solid-svg-icons';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import { useDispatch, useSelector } from 'react-redux';
import { setIsHelpModalOpen, setIsTemplateModalOpen, setIsPreferencesOpen } from 'actions/statementBrowser';
import { ENTITIES } from 'constants/graphSettings';
import Preferences from 'components/StatementBrowser/Preferences/Preferences';
import PropTypes from 'prop-types';
export default function StatementMenuHeader(props) {
    const isPreferencesOpen = useSelector(state => state.statementBrowser.isPreferencesOpen);
    const isHelpModalOpen = useSelector(state => state.statementBrowser.isHelpModalOpen);
    const isTemplatesModalOpen = useSelector(state => state.statementBrowser.isTemplatesModalOpen);
    const dispatch = useDispatch();
    const preferencesTippy = useRef(null);

    return (
        <>
            <div className="mb-2 text-end">
                <ButtonGroup>
                    {/* We have custom templates for predicates and classes*/}
                    {props.canEdit && props.enableEdit && props.resource._class === ENTITIES.RESOURCE && (
                        <Button
                            className="p-0"
                            outline
                            color="secondary"
                            size="sm"
                            onClick={() => dispatch(setIsTemplateModalOpen({ isOpen: true }))}
                        >
                            <Tippy content="Select a template to use in your data">
                                <div className="px-3 py-1">
                                    <Icon className="me-1" icon={faPuzzlePiece} /> Templates
                                </div>
                            </Tippy>
                            {isTemplatesModalOpen && <TemplatesModal syncBackend={props.syncBackend} />}
                        </Button>
                    )}
                    {props.canEdit && props.enableEdit && (
                        <Button outline color="secondary" size="sm" onClick={() => dispatch(setIsHelpModalOpen({ isOpen: true }))}>
                            <Icon className="me-1" icon={faQuestionCircle} /> Help
                        </Button>
                    )}

                    <Button className="p-0" outline color={!props.enableEdit || !props.canEdit ? 'link' : 'secondary'} size="sm" onClick={() => null}>
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
                                <Icon fixedWidth={true} className="me-1" icon={!isPreferencesOpen ? faSlidersH : faTimes} /> Preferences
                            </div>
                        </Tippy>
                    </Button>
                </ButtonGroup>
            </div>

            {!props.canEdit && props.enableEdit && (
                <UncontrolledAlert color="info">
                    A shared resource cannot be edited directly{' '}
                    <Button
                        color="link"
                        className="p-0"
                        onClick={() => dispatch(setIsHelpModalOpen({ isOpen: true, articleId: HELP_CENTER_ARTICLES.RESOURCE_SHARED }))}
                    >
                        <Icon icon={faQuestionCircle} />
                    </Button>
                </UncontrolledAlert>
            )}

            {isHelpModalOpen && <SBEditorHelpModal />}
        </>
    );
}

StatementMenuHeader.propTypes = {
    resource: PropTypes.object.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    canEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired
};

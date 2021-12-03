import { CustomInput, Button } from 'reactstrap';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { updatePreferences, setIsHelpModalOpen } from 'actions/statementBrowser';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Cookies } from 'react-cookie';
import PropTypes from 'prop-types';
import env from '@beam-australia/react-env';

const cookies = new Cookies();

export const PreferencesStyle = styled.div`
    overflow-wrap: break-word;
    padding: 8px;
    .header {
        border-bottom: 1px solid #fff;
    }
`;

export default function Preferences({ closeTippy }) {
    const preferences = useSelector(state => state.statementBrowser.preferences);
    const dispatch = useDispatch();

    const settingsInputSwitched = e => {
        cookies.set(`preferences.${e.target.name}`, e.target.checked.toString(), { path: env('PUBLIC_URL'), maxAge: 604800 });
        dispatch(updatePreferences({ [e.target.name]: e.target.checked }));
    };

    return (
        <PreferencesStyle className="p-3">
            <h5 className="text-white pb-2 mb-3 header">
                Preferences
                <Button
                    color="link"
                    className="p-0 float-right"
                    onClick={() => {
                        closeTippy();
                        dispatch(setIsHelpModalOpen({ isOpen: true, articleId: HELP_CENTER_ARTICLES.PREFERENCES }));
                    }}
                >
                    <Icon size="sm" icon={faQuestionCircle} />
                </Button>
            </h5>
            <div className="mb-2">
                <CustomInput
                    type="switch"
                    id="showClasses"
                    name="showClasses"
                    label="Show classes of resources"
                    onChange={settingsInputSwitched}
                    checked={preferences['showClasses']}
                />
            </div>
            <div className="mb-2">
                <CustomInput
                    type="switch"
                    id="showStatementInfo"
                    name="showStatementInfo"
                    label="Show information about the statement"
                    onChange={settingsInputSwitched}
                    checked={preferences['showStatementInfo']}
                />
            </div>
            <div className="mb-2">
                <CustomInput
                    type="switch"
                    id="showValueInfo"
                    name="showValueInfo"
                    label="Show information tooltip of values"
                    onChange={settingsInputSwitched}
                    checked={preferences['showValueInfo']}
                />
            </div>
            <div className="mb-2">
                <CustomInput
                    type="switch"
                    id="showLiteralDataTypes"
                    name="showLiteralDataTypes"
                    label="Show data type of literals"
                    onChange={settingsInputSwitched}
                    checked={preferences['showLiteralDataTypes']}
                />
            </div>
        </PreferencesStyle>
    );
}

Preferences.propTypes = {
    closeTippy: PropTypes.func.isRequired
};

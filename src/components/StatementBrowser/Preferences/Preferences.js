import { CustomInput } from 'reactstrap';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { updatePreferences } from 'actions/statementBrowser';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';

const cookies = new Cookies();

export const PreferencesStyle = styled.div`
    background-color: ${props => props.theme.lightLighter};
    overflow-wrap: break-word;
    margin-top: -2px;
    margin-right: -2px;
    margin-bottom: -2px;
    border-radius: 4px;
    padding: 8px;
    border: 1px solid rgba(0, 0, 0, 0.125) !important;
`;

export default function Preferences() {
    const preferences = useSelector(state => state.statementBrowser.preferences);
    const dispatch = useDispatch();

    const settingsInputSwitched = e => {
        cookies.set(`preferences.${e.target.name}`, e.target.checked.toString(), { path: env('PUBLIC_URL'), maxAge: 604800 });
        dispatch(updatePreferences({ [e.target.name]: e.target.checked }));
    };

    return (
        <PreferencesStyle className="p-4">
            <h5 className="mb-3">Preferences</h5>
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
                    label="Show information about values"
                    onChange={settingsInputSwitched}
                    checked={preferences['showStatementInfo']}
                />
            </div>
            <div className="mb-2">
                <CustomInput
                    type="switch"
                    id="showLiteralDataTypes"
                    name="showLiteralDataTypes"
                    label="Show datatype of literals"
                    onChange={settingsInputSwitched}
                    checked={preferences['showLiteralDataTypes']}
                />
            </div>
        </PreferencesStyle>
    );
}

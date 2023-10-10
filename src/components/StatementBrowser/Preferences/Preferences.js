import { Input, Button, Label } from 'reactstrap';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { setIsHelpModalOpen, updatePreferences } from 'slices/statementBrowserSlice';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { Cookies } from 'react-cookie';
import PropTypes from 'prop-types';
import env from 'components/NextJsMigration/env';

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
                    className="p-0 float-end"
                    onClick={() => {
                        closeTippy();
                        dispatch(setIsHelpModalOpen({ isOpen: true, articleId: HELP_CENTER_ARTICLES.PREFERENCES }));
                    }}
                >
                    <Icon size="sm" icon={faQuestionCircle} />
                </Button>
            </h5>
            <div className="mb-2">
                <Input type="switch" id="showClasses" name="showClasses" onChange={settingsInputSwitched} checked={preferences.showClasses} />{' '}
                <Label for="showClasses" className="mb-0">
                    Show classes of resources
                </Label>
            </div>
            <div className="mb-2">
                <Input
                    type="switch"
                    id="showDescriptionTooltips"
                    name="showDescriptionTooltips"
                    onChange={settingsInputSwitched}
                    checked={preferences.showDescriptionTooltips}
                />{' '}
                <Label for="showDescriptionTooltips" className="mb-0">
                    Show description tooltips
                </Label>
            </div>
            <div className="mb-2">
                <Input
                    type="switch"
                    id="showInlineDataTypes"
                    name="showInlineDataTypes"
                    onChange={settingsInputSwitched}
                    checked={preferences.showInlineDataTypes}
                />{' '}
                <Label for="showInlineDataTypes" className="mb-0">
                    Show inline data types of values
                </Label>
            </div>
        </PreferencesStyle>
    );
}

Preferences.propTypes = {
    closeTippy: PropTypes.func.isRequired,
};

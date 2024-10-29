import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useDataBrowserDispatch, useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import { env } from 'next-runtime-env';
import { FC, useId } from 'react';
import { useCookies } from 'react-cookie';
import { Button, Input, Label } from 'reactstrap';
import styled from 'styled-components';

export const PreferencesStyle = styled.div`
    overflow-wrap: break-word;
    padding: 8px;
    .header {
        border-bottom: 1px solid #fff;
    }
`;

type PreferencesProps = {
    closeTippy: () => void;
};

const Preferences: FC<PreferencesProps> = ({ closeTippy }) => {
    const [, setCookie] = useCookies(['preferences.showInlineDataTypes', 'preferences.expandValuesByDefault']);

    const { preferences } = useDataBrowserState();
    const dispatch = useDataBrowserDispatch();

    const settingsInputSwitched = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCookie(`preferences.${e.target.name as 'showInlineDataTypes' | 'expandValuesByDefault'}`, e.target.checked, {
            path: env('NEXT_PUBLIC_PUBLIC_URL'),
            maxAge: 315360000,
        }); // << TEN YEARS
        dispatch({ type: 'UPDATE_PREFERENCES', payload: { [e.target.name]: e.target.checked } });
    };

    const id = useId();

    return (
        <PreferencesStyle className="p-3">
            <h5 className="text-white pb-2 mb-3 header">
                Preferences
                <Button
                    color="link"
                    className="p-0 float-end"
                    onClick={() => {
                        closeTippy();
                        dispatch({ type: 'SET_IS_HELP_MODAL_OPEN', payload: { isOpen: true, articleId: HELP_CENTER_ARTICLES.PREFERENCES } });
                    }}
                >
                    <Icon size="sm" icon={faQuestionCircle} />
                </Button>
            </h5>

            <div className="mb-2">
                <Input
                    type="checkbox"
                    id={`${id}-showInlineDataTypes`}
                    name="showInlineDataTypes"
                    onChange={settingsInputSwitched}
                    checked={preferences.showInlineDataTypes ?? false}
                />{' '}
                <Label for={`${id}-showInlineDataTypes`} className="mb-0">
                    Show inline data types of values
                </Label>
            </div>
            <div className="mb-2">
                <Input
                    type="checkbox"
                    id={`${id}-expandValuesByDefault`}
                    name="expandValuesByDefault"
                    onChange={settingsInputSwitched}
                    checked={preferences.expandValuesByDefault ?? false}
                />{' '}
                <Label for={`${id}-expandValuesByDefault`} className="mb-0">
                    Expand all values by default
                </Label>
            </div>
        </PreferencesStyle>
    );
};

export default Preferences;

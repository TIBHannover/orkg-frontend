import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Switch } from '@heroui/react';
import { useCookies } from 'next-client-cookies';
import { env } from 'next-runtime-env';
import { FC } from 'react';

import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';

type PreferencesProps = {
    closeTippy: () => void;
};

type PreferenceKey = 'showInlineDataTypes' | 'expandValuesByDefault';

type PreferenceItem = {
    key: PreferenceKey;
    label: string;
    description: string;
};

const PREFERENCE_ITEMS: PreferenceItem[] = [
    {
        key: 'showInlineDataTypes',
        label: 'Show inline data types',
        description: 'Display the data type next to each value.',
    },
    {
        key: 'expandValuesByDefault',
        label: 'Expand values by default',
        description: 'Automatically expand all values when loading.',
    },
];

const Preferences: FC<PreferencesProps> = ({ closeTippy }) => {
    const cookies = useCookies();

    const { preferences } = useDataBrowserState();
    const dispatch = useDataBrowserDispatch();

    const handleToggle = (name: PreferenceKey) => (isSelected: boolean) => {
        cookies.set(`preferences.${name}`, String(isSelected), {
            path: env('NEXT_PUBLIC_PUBLIC_URL'),
            expires: 3650,
        });
        dispatch({ type: 'UPDATE_PREFERENCES', payload: { [name]: isSelected } });
    };

    return (
        <div className="w-72 p-1">
            <div className="flex items-center justify-between border-b border-default/60 pb-2 mb-3">
                <h5 className="m-0 text-sm font-semibold">Preferences</h5>
                <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    aria-label="Open help center"
                    onPress={() => {
                        window.open('https://orkg.org/help-center/article/28/Statement_browser_preferences', '_blank', 'noopener,noreferrer');
                        closeTippy();
                    }}
                >
                    <FontAwesomeIcon icon={faQuestionCircle} />
                </Button>
            </div>
            <div className="flex flex-col gap-3">
                {PREFERENCE_ITEMS.map(({ key, label, description }) => (
                    <Switch key={key} isSelected={preferences[key] ?? false} onChange={handleToggle(key)} className="flex items-center gap-3">
                        <Switch.Content>
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                            <span className="flex flex-col">
                                <span className="text-sm font-medium leading-tight">{label}</span>
                                <span className="text-xs text-foreground-500 leading-tight">{description}</span>
                            </span>
                        </Switch.Content>
                    </Switch>
                ))}
            </div>
        </div>
    );
};

export default Preferences;

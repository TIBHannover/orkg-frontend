import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import type { GroupBase } from 'react-select';
import { components, MenuProps } from 'react-select';

import { useAutocompleteDispatch, useAutocompleteState } from '@/components/Autocomplete/AutocompleteContext';
import Tooltip from '@/components/FloatingUI/Tooltip';

const Menu = <OptionType, Group extends GroupBase<OptionType>, IsMulti extends boolean = false>(props: MenuProps<OptionType, IsMulti, Group>) => {
    const dispatch = useAutocompleteDispatch();
    const { selectedOntologies } = useAutocompleteState();
    const toggle = () => dispatch({ type: 'toggleOntologySelector', payload: null });
    const { selectProps, children } = props;

    return (
        <components.Menu<OptionType, IsMulti, Group> {...props}>
            <div>{children}</div>
            <div className="bg-surface-secondary text-foreground rounded-b text-xs leading-3 cursor-default flex justify-between items-center p-1">
                <div className="flex items-center grow">
                    {selectProps.enableExternalSources && (
                        <>
                            <div className="pl-2 items-center flex">
                                Sources
                                <div className="overflow-hidden">
                                    {selectedOntologies.map((ontology) => (
                                        <Tooltip
                                            key={ontology.id}
                                            content={
                                                <div className="break-all">
                                                    <strong>Label:</strong> {ontology.label} <br />
                                                    <strong>URI:</strong> {ontology.uri}
                                                </div>
                                            }
                                        >
                                            <span>
                                                <Chip size="sm" variant="soft" className="ml-2">
                                                    {ontology.shortLabel}
                                                </Chip>
                                            </span>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>

                            <Tooltip content="Select sources">
                                <button
                                    type="button"
                                    className="px-2 py-0 ml-2 text-sm bg-default hover:bg-surface-tertiary text-foreground rounded cursor-pointer"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        toggle();
                                    }}
                                >
                                    <FontAwesomeIcon icon={faGear} size="sm" />
                                </button>
                            </Tooltip>
                        </>
                    )}
                </div>
                <div className="mr-2 my-1">
                    <a
                        href="https://www.orkg.org/help-center/article/12/Tips_for_the_ORKG_Autocomplete"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                    >
                        Search syntax tips
                    </a>
                </div>
            </div>
        </components.Menu>
    );
};

export default Menu;

import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAutocompleteDispatch, useAutocompleteState } from 'components/Autocomplete/AutocompleteContext';
import Tooltip from 'components/FloatingUI/Tooltip';
import type { GroupBase } from 'react-select';
import { MenuProps, components } from 'react-select';
import { Badge, Button } from 'reactstrap';
import styled from 'styled-components';

export const StyledMenuListFooter = styled.div`
    background-color: ${(props) => props.theme.bodyBg};
    border-bottom: 1px solid ${(props) => props.theme.bodyBg};
    color: ${(props) => props.theme.bodyColor};
    border-radius: 0 0 4px 4px;
    font-size: 12px;
    line-height: 12px;
    cursor: default;
`;

const Menu = <OptionType, Group extends GroupBase<OptionType>, IsMulti extends boolean = false>(props: MenuProps<OptionType, IsMulti, Group>) => {
    const dispatch = useAutocompleteDispatch();
    const { selectedOntologies } = useAutocompleteState();
    const toggle = () => dispatch({ type: 'toggleOntologySelector', payload: null });
    const { selectProps, children } = props;

    return (
        <components.Menu<OptionType, IsMulti, Group> {...props}>
            <div>{children}</div>

            <StyledMenuListFooter className="d-flex justify-content-between align-items-center p-1">
                <div className="d-flex align-items-center flex-grow-1">
                    {selectProps.enableExternalSources && (
                        <>
                            <div className="ps-2 align-items-center d-flex">
                                Sources
                                <div className="overflow-hidden">
                                    {selectedOntologies.map((ontology) => (
                                        <Tooltip
                                            key={ontology.id}
                                            content={
                                                <div className="text-break">
                                                    <strong>Label:</strong> {ontology.label} <br />
                                                    <strong>URI:</strong> {ontology.uri}
                                                </div>
                                            }
                                        >
                                            <span>
                                                <Badge color="light-darker text-black ms-2 rounded-pill" size="sm">
                                                    {ontology.shortLabel}
                                                </Badge>
                                            </span>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>

                            <Tooltip content="Select sources">
                                <span>
                                    <Button color="light-darker" className="px-2 py-0 ms-2" onClick={toggle} size="sm">
                                        <FontAwesomeIcon icon={faGear} size="sm" />
                                    </Button>
                                </span>
                            </Tooltip>
                        </>
                    )}
                </div>
                <div className="me-2 my-1">
                    <a href="https://www.orkg.org/help-center/article/12/Tips_for_the_ORKG_Autocomplete" target="_blank" rel="noopener noreferrer">
                        Search syntax tips
                    </a>
                </div>
            </StyledMenuListFooter>
        </components.Menu>
    );
};

export default Menu;

import { Button } from 'reactstrap';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import usePreviouslySelectedResearchField from './hooks/usePreviouslySelectedResearchField';

const List = styled.ul`
    list-style: none;
    padding: 10px 0 0 0;
`;

const FieldItem = styled(Button)`
    &&& {
        // &&& https://styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity
        background: ${props => props.theme.light};
        border-radius: 6px;
        padding: 8px 15px;
        margin-bottom: 4px;
        width: 100%;
        text-align: left;
        display: flex;
        text-decoration: none;
        color: inherit;
        transition: none;

        &.active {
            background: ${props => props.theme.secondary};
            color: #fff;
        }
    }
`;

const PreviouslySelectedResearchField = props => {
    const { researchFields } = usePreviouslySelectedResearchField();

    return (
        <div>
            {researchFields.length > 0 && (
                <>
                    <div className="text-muted text-small mt-1">
                        <Tippy content="This list is based on the last 8 papers that you created.">
                            <small>Previously selected research fields:</small>
                        </Tippy>
                    </div>

                    <List className="pt-1">
                        {researchFields.map(rf => {
                            return (
                                <li key={rf.id}>
                                    <FieldItem
                                        color="link"
                                        onClick={e => props.handleFieldSelect(rf)}
                                        className={props.selectedResearchField === rf.id && 'active'}
                                    >
                                        {rf.label}
                                    </FieldItem>
                                </li>
                            );
                        })}
                    </List>
                </>
            )}
        </div>
    );
};

PreviouslySelectedResearchField.propTypes = {
    handleFieldSelect: PropTypes.func,
    selectedResearchField: PropTypes.string
};

export default PreviouslySelectedResearchField;

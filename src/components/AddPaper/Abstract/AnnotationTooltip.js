import { createRef, Component } from 'react';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { ENTITIES } from 'constants/graphSettings';
import { withTheme } from 'styled-components';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';

class AnnotationTooltip extends Component {
    constructor(props) {
        super(props);

        this.tippyInstance = createRef();
        this.reactSelectInstance = createRef();
    }

    render() {
        return (
            <span>
                <Tippy
                    placement="top"
                    appendTo={document.body}
                    followCursor={true}
                    plugins={[followCursor]}
                    arrow={true}
                    onHide={() => {
                        if (this.reactSelectInstance) {
                            this.reactSelectInstance.blur();
                        }
                    }}
                    interactive={true}
                    onCreate={instance => (this.tippyInstance.current = instance)}
                    content={
                        <div style={{ width: '300px' }}>
                            <AutoComplete
                                entityType={ENTITIES.PREDICATE}
                                defaultOptions={this.props.defaultOptions}
                                placeholder="Select or type to enter a property"
                                onChange={(e, a) => {
                                    this.props.handleChangeAnnotationClass(e, a, this.props.range);
                                    this.tippyInstance.current.hide();
                                }}
                                value={{
                                    label: this.props.range.class.label ? this.props.range.class.label : '',
                                    id: this.props.range.class.id,
                                    certainty: this.props.range.certainty,
                                    range_id: this.props.range.id,
                                }}
                                key={value => value}
                                isClearable
                                openMenuOnFocus={true}
                                autoLoadOption={true}
                                allowCreate={true}
                                autoFocus={false}
                                innerRef={instance => (this.reactSelectInstance = instance)}
                            />
                        </div>
                    }
                >
                    <span
                        style={{ backgroundColor: this.props.getClassColor(this.props.range.class.label), color: 'black' }}
                        id={`CR${this.props.range.id}`}
                    >
                        {this.props.lettersNode}
                    </span>
                </Tippy>
            </span>
        );
    }
}

AnnotationTooltip.propTypes = {
    range: PropTypes.object,
    lettersNode: PropTypes.array,
    handleChangeAnnotationClass: PropTypes.func,
    handleValidateAnnotation: PropTypes.func,
    getClassColor: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired,
    defaultOptions: PropTypes.array.isRequired,
};

export default withTheme(AnnotationTooltip);

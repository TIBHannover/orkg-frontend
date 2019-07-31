import React, { Component } from 'react';
import { Tooltip as ReactstrapTooltip } from 'reactstrap';
import PropTypes from 'prop-types';
import rangy from 'rangy';
import CreatableSelect from 'react-select/creatable';

function getAllIndexes(arr, val) {
  var indexes = [],
    i = -1;
  while ((i = arr.indexOf(val, i + 1)) !== -1) {
    indexes.push(i);
  }
  return indexes;
}

class AbstractAnnotator extends Component {
  constructor(props) {
    super(props);

    this.annotatorRef = React.createRef();
  }

  componentDidMount() {
    this.annotatorRef.current.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    this.annotatorRef.current.removeEventListener('mouseup', this.handleMouseUp);
  }

  renderCharNode(charIndex) {
    return (
      <span key={`c${charIndex}`} data-position={charIndex}>
        {this.props.abstract[charIndex]}
      </span>
    );
  }

  getRange(charPosition) {
    return (
      this.props.ranges &&
      this.props.ranges.find((range) => charPosition >= range.start && charPosition <= range.end)
    );
  }

  tooltipRenderer = (lettersNode, range) => {
    const customStyles = {
      control: (provided, state) => ({
        ...provided,
        background: 'inherit',
        boxShadow: state.isFocused ? 0 : 0,
        border: 0,
        paddingLeft: 0,
        paddingRight: 0,
        width: '250px',
        color: '#fff',
      }),
      placeholder: (provided) => ({
        ...provided,
        color: '#fff',
      }),
      singleValue: (provided) => ({
        ...provided,
        color: '#fff',
      }),
      input: (provided) => ({
        ...provided,
        color: '#fff',
      }),
      menu: (provided) => ({
        ...provided,
        zIndex: 10,
      }),
      menuList: (provided) => ({
        ...provided,
        backgroundColor: '#fff',
        opacity: 1,
        color: '#000',
      }),
    };

    let color = '#0052CC';
    switch (this.props.annotationClasses[range.id]) {
      case 'Process':
        color = '#7fa2ff';
        break;
      case 'Data':
        color = '#5FA97F';
        break;
      case 'Material':
        color = '#EAB0A2';
        break;
      case 'Method':
        color = '#D2B8E5';
        break;
      default:
        color = '#0052CC';
    }

    return (
      <span key={`${range.id}`}>
        <span style={{ backgroundColor: color, color: 'black' }} id={`CR${range.id}`}>
          {lettersNode}
        </span>
        <ReactstrapTooltip
          placement="top"
          autohide={false}
          target={`CR${range.id}`}
          className={'annotation-tooltip'}
          innerClassName={'annotation-tooltip-inner'}
          toggle={(e) => this.props.toggleTooltip(range)}
          isOpen={this.props.toolTips[range.id]}
        >
          <CreatableSelect
            value={this.props.annotationClasseOptions.filter(
              ({ label }) => this.props.annotationClasses[range.id] === label,
            )}
            onChange={(e, a) => this.props.handleChangeAnnotationClass(e, a, range)}
            getOptionLabel={({ label }) => label}
            getOptionValue={({ value }) => value}
            key={({ value }) => value}
            options={this.props.annotationClasseOptions}
            isClearable
            onCreateOption={(e) => this.props.handleCreateClass(e, range)}
            placeholder="Select or Type something..."
            styles={customStyles}
          />
        </ReactstrapTooltip>
      </span>
    );
  };

  getAnnotatedText() {
    const annotatedText = [];
    for (let charPosition = 0; charPosition < this.props.abstract.length; charPosition++) {
      const range = this.getRange(charPosition);
      const charNode = this.renderCharNode(charPosition);
      if (!range) {
        annotatedText.push(charNode);
        continue;
      }
      const annotationGroup = [charNode];
      let rangeCharPosition = charPosition + 1;
      for (; rangeCharPosition < parseInt(range.end) + 1; rangeCharPosition++) {
        annotationGroup.push(this.renderCharNode(rangeCharPosition));
        charPosition = rangeCharPosition;
      }
      annotatedText.push(this.tooltipRenderer(annotationGroup, range));
    }
    return annotatedText;
  }

  handleMouseUp = () => {
    var sel = rangy.getSelection(this.annotatorRef.current);
    if (sel.isCollapsed) {
      return null;
    }
    // Get position of the node at which the user started selecting
    let start = parseInt(sel.anchorNode.parentNode.dataset.position);
    // Get position of the node at which the user stopped selecting
    let end = parseInt(sel.focusNode.parentNode.dataset.position);
    // Get the text within the selection
    let text = sel.toString();
    if (!text.length) {
      return null;
    }
    if (sel.isBackwards()) {
      // if the selection's focus is earlier in the document than the anchor
      [start, end] = [end, start];
    }
    // Find index of all occurrences of selected text in the abstract
    var pos = getAllIndexes(this.props.abstract, text);
    // Get the closest number out of occurrences positions
    var closest = pos.reduce(function(prev, curr) {
      return Math.abs(curr - start) < Math.abs(prev - start) ? curr : prev;
    });
    // Update position of selection
    start = closest;
    end = start + text.length - 1;
    // Save range in state
    let range = {
      id: this.props.rangesIdIndex + 1,
      start: start,
      end: end,
      text: text,
      toolTips: false,
    };
    this.props.onCreateAnnotation(range);
    window.getSelection().empty();
  };

  render() {
    const annotatedText = this.getAnnotatedText();

    return (
      <div className={'mt-4'} style={{ lineHeight: '2.5em' }} ref={this.annotatorRef}>
        {annotatedText}
      </div>
    );
  }
}

AbstractAnnotator.propTypes = {
  ranges: PropTypes.array,
  abstract: PropTypes.string,
  rangesIdIndex: PropTypes.number,
  toolTips: PropTypes.object,
  annotationClasseOptions: PropTypes.array,
  annotationClasses: PropTypes.object,
  handleChangeAnnotationClass: PropTypes.func,
  handleCreateClass: PropTypes.func,
  onCreateAnnotation: PropTypes.func,
  toggleTooltip: PropTypes.func,
};

export default AbstractAnnotator;

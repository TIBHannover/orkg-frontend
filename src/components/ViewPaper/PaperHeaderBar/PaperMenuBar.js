import React from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faPen, faTimes, faFile } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

function PaperMenuBar(props) {
    return (
        <div>
            <ButtonGroup className="flex-shrink-0">
                {props.paperLink && (
                    <a href={props.paperLink} className="btn btn-darkblue flex-shrink-0 btn-sm" target="_blank" rel="noopener noreferrer">
                        <Icon icon={faFile} style={{ margin: '2px 4px 0 0' }} /> View paper
                    </a>
                )}
                <Button className="flex-shrink-0" color="darkblue" size="sm" style={{ marginLeft: 1 }} onClick={() => props.toggle('showGraphModal')}>
                    <Icon icon={faProjectDiagram} style={{ margin: '2px 4px 0 0' }} /> Graph view
                </Button>

                {!props.editMode ? (
                    <Button className="flex-shrink-0" style={{ marginLeft: 1 }} color="darkblue" size="sm" onClick={() => props.toggle('editMode')}>
                        <Icon icon={faPen} /> Edit
                    </Button>
                ) : (
                    <Button
                        className="flex-shrink-0"
                        style={{ marginLeft: 1 }}
                        color="darkblueDarker"
                        size="sm"
                        onClick={() => props.toggle('editMode')}
                    >
                        <Icon icon={faTimes} /> Stop editing
                    </Button>
                )}
            </ButtonGroup>
        </div>
    );
}

PaperMenuBar.propTypes = {
    editMode: PropTypes.bool.isRequired,
    paperLink: PropTypes.string,
    toggle: PropTypes.func.isRequired
};

export default PaperMenuBar;

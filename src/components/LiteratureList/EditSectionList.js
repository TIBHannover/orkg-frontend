import { faLightbulb, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PaperCard from 'components/LiteratureList/PaperCard';
import PropTypes from 'prop-types';
import React from 'react';
import { SortableElement } from 'react-sortable-hoc';
import { Button, ListGroup } from 'reactstrap';

const EditSectionList = ({ papers = [], section }) => {
    return (
        <>
            <ListGroup className="mb-3">
                {papers.map(paper => (
                    <PaperCard paper={paper} contributions={paper.contributions} showAddToComparison />
                ))}
            </ListGroup>
            <Button color="secondary" size="sm" className="mb-2">
                <Icon icon={faPlus} className="mr-2" />
                Add entry
            </Button>
            <Button color="light" size="sm" className="mb-2 ml-2">
                <Icon icon={faLightbulb} className="mr-2" />
                Related papers
            </Button>
        </>
    );
};

EditSectionList.propTypes = {
    papers: PropTypes.array,
    section: PropTypes.object.isRequired
};

export default SortableElement(EditSectionList);

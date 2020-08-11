import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Modal, ModalBody, ModalHeader, Alert, Input, ModalFooter, Button, FormGroup, Label } from 'reactstrap';
import { saveFullPaper, createResource } from 'network';
import { PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

const Save = props => {
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);
    const [title, setTitle] = useState('Open Research Knowledge Graph: Next GenerationInfrastructure for Semantic Scholarly Knowledge'); //TODO: get result from grobid
    const [paperId, setPaperId] = useState(null);

    const handleSave = async () => {
        const contributionStatements = {};

        for (const annotation of annotations) {
            console.log(annotation);
            const resource = await createResource(annotation.content.text, [annotation.type]); // ,'http://purl.org/dc/terms/' +
            if (!(PREDICATES.HAS_PART in contributionStatements)) {
                contributionStatements[PREDICATES.HAS_PART] = [
                    {
                        '@id': resource.id
                    }
                ];
            } else {
                contributionStatements[PREDICATES.HAS_PART].push({
                    '@id': resource.id
                });
            }
        }

        const paper = {
            title,
            researchField: 'R11',
            contributions: [
                {
                    name: 'Contribution',
                    values: contributionStatements
                }
            ]
        };

        const savedPaper = await saveFullPaper({ paper: paper }, true);

        setPaperId(savedPaper.id);
    };

    const handleClose = () => {
        props.toggle();
        setPaperId(null);
    };

    return (
        <Modal isOpen={props.isOpen} toggle={handleClose}>
            <ModalHeader toggle={handleClose}>Save annotations</ModalHeader>
            <ModalBody>
                {!paperId ? (
                    annotations.length > 0 ? (
                        <FormGroup>
                            <Label for="exampleUrl">Paper title</Label>
                            <Input type="url" name="url" value={title} onChange={e => setTitle(e.target.value)} />
                        </FormGroup>
                    ) : (
                        <Alert color="danger">You don't have any annotations yet, so there is nothing to save</Alert>
                    )
                ) : (
                    <Alert color="success">
                        Annotations successfully saved{' '}
                        <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}>click here to view the paper</Link>
                    </Alert>
                )}
            </ModalBody>
            {annotations.length && !paperId ? (
                <ModalFooter>
                    <Button color="primary" onClick={handleSave}>
                        Save
                    </Button>
                </ModalFooter>
            ) : null}
        </Modal>
    );
};

Save.propTypes = {
    toggle: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default Save;

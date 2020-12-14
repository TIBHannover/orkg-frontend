import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';

const HelpModal = props => {
    return (
        <Modal isOpen={props.isOpen} toggle={props.toggle} size="lg">
            <ModalHeader toggle={props.toggle}>ORKG Statement editor help</ModalHeader>

            <ModalBody>
                <p>
                    The statement editor in the main part of editing ORKG data. In this guide we provide most frequently asked question that helps to
                    use the statement editor effectively
                </p>
                <ul>
                    <li>
                        <a
                            href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/How-to-insert-a-LaTeX-mathematical-formula"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            How to insert a LaTeX mathematical formula?
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/How-to-retrieve-the-abstract-from-DBpedia,-Wikipedia-or-WikiData"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            How to retrieve the abstract from DBpedia, Wikipedia or WikiData?
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Tips-for-the-ORKG-Autocomplete#search-an-entity-by-id"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            How to search for an entity by its ID?
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Tips-for-the-ORKG-Autocomplete#search-by-exact-match"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            How to search for an entity by exact match?
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Tips-for-the-ORKG-Autocomplete#use-classes-from-external-ontologies"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            How to use classes from external ontologies?
                        </a>
                    </li>
                </ul>
            </ModalBody>
        </Modal>
    );
};

HelpModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired
};

export default HelpModal;

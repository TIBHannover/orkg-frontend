import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Cite } from '@citation-js/core';
import ExistingDoiModal from 'components/AddPaper/GeneralData/ExistingDoiModal';
import ListItem from 'components/ViewPaper/EditDialog/ListItem';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, InputGroup } from 'reactstrap';
import { getPaperByDOI } from 'services/backend/misc';
import { getStatementsBySubject } from 'services/backend/statements';
import { truncate } from 'lodash';
import { getPaperData, parseCiteResult } from 'utils';

const DoiItem = ({ toggleItem, isExpanded, value, onChange, onPopulateMetadata, lookupOnMount }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [existingPaper, setExistingPaper] = useState(null);
    const [isValid, setIsValid] = useState(null);
    const [shouldPerformLookup, setShouldPerformLookup] = useState(lookupOnMount);

    const handleLookup = useCallback(async () => {
        if (!value) {
            toast.error('Please enter the DOI to perform a lookup');
            setIsValid(false);
            return;
        }
        setIsLoading(true);
        setIsValid(null);

        let doi = value.trim();
        doi = doi.startsWith('http') ? doi.substring(doi.indexOf('10.')) : doi;

        // check if paper is already in ORKG
        if (doi.includes('10.') && doi.startsWith('10.')) {
            try {
                const paper = await getPaperByDOI(doi);
                const paperStatements = await getStatementsBySubject({ id: paper.id });
                setExistingPaper({
                    ...getPaperData({ ...paper, label: paper.title }, paperStatements),
                    title: paper.title,
                });
            } catch (e) {
                setExistingPaper(null);
            }
        }

        await Cite.async(doi)
            .then(paper => {
                if (!paper) {
                    return;
                }

                const parseResult = parseCiteResult(paper);

                onPopulateMetadata({
                    title: parseResult.paperTitle,
                    authors: parseResult.paperAuthors,
                    month: parseResult.paperPublicationMonth,
                    year: parseResult.paperPublicationYear,
                    doi: parseResult.doi,
                    publishedIn: parseResult.publishedIn,
                    url: parseResult.url,
                });

                setIsValid(true);
            })
            .catch(({ message }) => {
                let error;
                if (message === 'This format is not supported or recognized') {
                    error = "This format is not supported or recognized. Please enter a valid DOI, BibTeX or enter the paper's metadata manually";
                } else if (message === 'Server responded with status code 404') {
                    error = 'No paper has been found';
                } else {
                    error = 'An error occurred, reload the page and try again';
                }
                toast.error(error);
                setIsValid(false);
            });

        setIsLoading(false);
    }, [onPopulateMetadata, value]);

    useEffect(() => {
        if (shouldPerformLookup) {
            handleLookup();
            setShouldPerformLookup(false);
        }
    }, [handleLookup, shouldPerformLookup]);

    return (
        <ListItem toggleItem={toggleItem} label="Paper DOI or BibTeX" open={isExpanded} value={truncate(value || '', { length: 60 })}>
            <InputGroup>
                <Input value={value} onChange={e => onChange(e.target.value)} disabled={isLoading} valid={isValid} invalid={isValid === false} />
                <Button color="secondary" onClick={handleLookup} disabled={isLoading}>
                    {!isLoading ? 'Lookup' : <Icon icon={faSpinner} spin />}
                </Button>
            </InputGroup>
            {/* TODO: improve modal to allow linking to the 'add contribution' modal */}
            {existingPaper && <ExistingDoiModal existingPaper={existingPaper} />}
        </ListItem>
    );
};

DoiItem.propTypes = {
    isExpanded: PropTypes.bool.isRequired,
    toggleItem: PropTypes.func.isRequired,
    onPopulateMetadata: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    lookupOnMount: PropTypes.bool,
};

DoiItem.defaultProps = {
    lookupOnMount: false,
};

export default DoiItem;

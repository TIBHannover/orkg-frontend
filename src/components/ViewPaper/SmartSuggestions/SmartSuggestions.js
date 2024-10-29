import { faExclamationTriangle, faMagic, faPen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy, { useSingleton } from '@tippyjs/react';
import Tooltip from 'components/Utils/Tooltip';
import AbstractAnnotatorModal from 'components/ViewPaper/AbstractAnnotatorModal/AbstractAnnotatorModal';
import AbstractModal from 'components/ViewPaper/AbstractModal/AbstractModal';
import Bioassays from 'components/ViewPaper/BioassaysModal/Bioassays';
import NERSuggestions from 'components/ViewPaper/SmartSuggestions/NERSuggestions';
import TemplatesRecommendations from 'components/ViewPaper/SmartSuggestions/TemplatesRecommendations';
import { SuggestionsBox } from 'components/ViewPaper/SmartSuggestions/styled';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button, ButtonGroup } from 'reactstrap';

const SmartSuggestions = ({ isLoadingAbstract, title = '', abstract = '', resourceId }) => {
    const [source, target] = useSingleton();

    const [isOpenAbstractModal, setIsOpenAbstractModal] = useState(false);
    const [isOpenAbstractAnnotationModal, setIsOpenAbstractAnnotationModal] = useState(false);

    const showAbstractWarning = !isLoadingAbstract && !abstract;

    return (
        <SuggestionsBox className="rounded">
            <Tippy singleton={source} delay={500} />

            <h3 className="h5 mb-3 d-flex justify-content-between align-items-center">
                <Tooltip message="The suggestions listed below are automatically generated based on the title and abstract from the paper. Using these suggestions is optional.">
                    Suggestions
                </Tooltip>
            </h3>

            <Tippy
                showOnCreate
                delay="1000"
                disabled={!showAbstractWarning}
                placement="right"
                content="We were unable to fetch the abstract of the paper. Click the button to manually add it, this improves the suggestions."
            >
                <span>
                    <Button
                        color="primary"
                        disabled={isLoadingAbstract}
                        className="w-100"
                        onClick={() => setIsOpenAbstractModal(true)}
                        outline
                        size="sm"
                    >
                        {isLoadingAbstract && (
                            <>
                                <Icon icon={faSpinner} spin /> Loading abstract
                            </>
                        )}
                        {!isLoadingAbstract && (
                            <>
                                {!showAbstractWarning ? <Icon icon={faPen} /> : <Icon icon={faExclamationTriangle} className="text-warning" />} Paper
                                abstract
                            </>
                        )}
                    </Button>
                </span>
            </Tippy>

            <ButtonGroup vertical className="w-100 mt-2">
                {abstract && (
                    <Button onClick={() => setIsOpenAbstractAnnotationModal(true)} outline size="sm" color="smart" className="w-100">
                        <Icon icon={faMagic} /> Annotator
                    </Button>
                )}
                <Bioassays resourceId={resourceId} />
            </ButtonGroup>

            <NERSuggestions title={title} abstract={abstract} resourceId={resourceId} />
            <TemplatesRecommendations target={target} title={title} abstract={abstract} resourceId={resourceId} />
            {isOpenAbstractModal && <AbstractModal toggle={() => setIsOpenAbstractModal((v) => !v)} />}
            {isOpenAbstractAnnotationModal && (
                <AbstractAnnotatorModal resourceId={resourceId} toggle={() => setIsOpenAbstractAnnotationModal((v) => !v)} />
            )}
        </SuggestionsBox>
    );
};

SmartSuggestions.propTypes = {
    title: PropTypes.string,
    abstract: PropTypes.string,
    isLoadingAbstract: PropTypes.bool,
    resourceId: PropTypes.string.isRequired,
    isAbstractFetched: PropTypes.bool,
};

export default SmartSuggestions;

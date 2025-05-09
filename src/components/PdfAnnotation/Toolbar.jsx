import { faExpandArrowsAlt, faQuestionCircle, faSearchMinus, faSearchPlus, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';

import Confirm from '@/components/Confirmation/Confirmation';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { resetPdfAnnotation } from '@/slices/pdfAnnotationSlice';

const ToolbarStyled = styled.div`
    background: ${(props) => props.theme.secondary};
    position: fixed;
    width: 100%;
    top: 72px;
    padding: 10px 7px;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.13);
    z-index: 1;
    display: flex;
    align-items: center;
`;

const Toolbar = (props) => {
    const pdf = useSelector((state) => state.pdfAnnotation.pdf);
    const dispatch = useDispatch();

    // Reset the pdf Annotation state
    const discardPdfFile = async () => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to discard this PDF file?',
        });

        if (result) {
            dispatch(resetPdfAnnotation());
        }
    };

    return (
        <ToolbarStyled>
            <h1 className="h5 mb-0 ms-2" style={{ color: '#fff', height: 'auto' }}>
                {/* Set the height to overwrite styles from the PDF  */}
                Survey table extractor
            </h1>
            <Tooltip content="Open help center">
                <span className="ms-3">
                    <a
                        href="https://www.orkg.org/help-center/article/7/Extracting_and_importing_tables_from_survey_articles"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: 22, lineHeight: 1, color: '#fff' }} className="p-0" />
                    </a>
                </span>
            </Tooltip>
            <div className="ms-auto">
                <ButtonGroup className="me-2">
                    <Button
                        color="secondary-darker"
                        disabled={!pdf}
                        size="sm"
                        style={{ marginRight: 2 }}
                        onClick={() => props.changeZoom(props.zoom - 0.2)}
                    >
                        <FontAwesomeIcon icon={faSearchMinus} />
                    </Button>
                    <Button
                        color="secondary-darker"
                        disabled={!pdf}
                        size="sm"
                        style={{ marginRight: 2 }}
                        onClick={() => props.changeZoom(props.zoom + 0.2)}
                    >
                        <FontAwesomeIcon icon={faSearchPlus} />
                    </Button>
                    <Button color="secondary-darker" disabled={!pdf} size="sm" onClick={() => props.changeZoom()}>
                        <FontAwesomeIcon icon={faExpandArrowsAlt} />
                    </Button>
                </ButtonGroup>
                {pdf && (
                    <Button className="me-2" color="secondary-darker" disabled={!pdf} size="sm" onClick={discardPdfFile}>
                        <FontAwesomeIcon icon={faTimesCircle} className="me-1" /> Discard PDF
                    </Button>
                )}
            </div>
        </ToolbarStyled>
    );
};

Toolbar.propTypes = {
    changeZoom: PropTypes.func.isRequired,
    zoom: PropTypes.number.isRequired,
};

export default Toolbar;

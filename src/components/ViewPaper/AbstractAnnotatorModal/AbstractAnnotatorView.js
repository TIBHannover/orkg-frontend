import { useContext } from 'react';
import { Badge, Alert } from 'reactstrap';
import capitalize from 'capitalize';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import { Range, getTrackBackground } from 'react-range';
import { ThemeContext } from 'styled-components';
import toArray from 'lodash/toArray';
import { useSelector } from 'react-redux';
import Tooltip from 'components/Utils/Tooltip';
import AbstractAnnotator from 'components/ViewPaper/AbstractAnnotatorModal/AbstractAnnotator';
import TitleWarningAlert from 'components/ViewPaper/AbstractModal/TitleWarningAlert';

function AbstractAnnotatorView(props) {
    const ranges = useSelector((state) => state.viewPaper.ranges);
    const abstract = useSelector((state) => state.viewPaper.abstract);
    const rangeArray = toArray(ranges).filter((r) => r.certainty >= props.certaintyThreshold);
    const rangesClasses = [...new Set(rangeArray.map((r) => r.class.label))];
    const theme = useContext(ThemeContext);

    return (
        <div className="ps-2 pe-2">
            <TitleWarningAlert />

            {abstract && !props.isAnnotationLoading && !props.isAnnotationFailedLoading && (
                <div>
                    {rangesClasses.length > 0 && (
                        <Alert color="info">
                            <strong>Info:</strong> we automatically annotated the abstract for you. Please remove any incorrect annotations
                        </Alert>
                    )}
                    {rangesClasses.length === 0 && (
                        <Alert color="info">
                            <strong>Info:</strong> we could not find any concepts on the abstract. Please insert more text in the abstract.
                        </Alert>
                    )}
                </div>
            )}

            {!props.isAnnotationLoading && props.isAnnotationFailedLoading && (
                <Alert color="light">
                    {props.annotationError ? props.annotationError : 'Failed to connect to the annotation service, please try again later'}
                </Alert>
            )}
            {!props.isAbstractLoading && !props.isAnnotationLoading && (
                <div>
                    <div id="annotationBadges">
                        <Tooltip className="me-2" message="Annotation labels are the properties that will be used in the contribution data.">
                            Annotation labels
                        </Tooltip>
                        <span className="me-1 ms-1" />
                        {rangesClasses.length > 0 &&
                            rangesClasses.map((c) => {
                                const aconcept = c ? props.classOptions.filter((e) => e.label.toLowerCase() === c.toLowerCase()) : [];
                                if (c && aconcept.length > 0) {
                                    return (
                                        <Tippy key={`c${c}`} content={aconcept[0].description}>
                                            <span>
                                                <Badge
                                                    color={null}
                                                    className="me-2"
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginBottom: '4px',
                                                        color: '#333',
                                                        background: props.getClassColor(c),
                                                    }}
                                                >
                                                    {c ? capitalize(c) : 'Unlabeled'}{' '}
                                                    <Badge pill color="secondary">
                                                        {rangeArray.filter((rc) => rc.class.label === c).length}
                                                    </Badge>
                                                </Badge>
                                            </span>
                                        </Tippy>
                                    );
                                }
                                return (
                                    <Badge
                                        color={null}
                                        className="me-2"
                                        key={`c${c}`}
                                        style={{ marginBottom: '4px', color: '#333', background: props.getClassColor(c) }}
                                    >
                                        {c ? capitalize(c) : 'Unlabeled'}{' '}
                                        <Badge pill color="secondary">
                                            {rangeArray.filter((rc) => rc.class.label === c).length}
                                        </Badge>
                                    </Badge>
                                );
                            })}
                    </div>
                    <AbstractAnnotator
                        certaintyThreshold={props.certaintyThreshold[0]}
                        classOptions={props.classOptions}
                        getClassColor={props.getClassColor}
                    />
                </div>
            )}
            {!props.isAbstractLoading && !props.isAnnotationLoading && !props.isAnnotationFailedLoading && toArray(ranges).length > 0 && (
                <div className="col-3 float-end">
                    <div className="mt-4">
                        <Range
                            step={0.025}
                            min={0}
                            max={1}
                            values={props.certaintyThreshold}
                            onChange={(values) => props.handleChangeCertaintyThreshold(values)}
                            renderTrack={({ props: innerProps, children }) => (
                                <div
                                    {...innerProps}
                                    style={{
                                        ...innerProps.style,
                                        height: '6px',
                                        width: '100%',
                                        background: getTrackBackground({
                                            values: props.certaintyThreshold,
                                            colors: [theme.smart, theme.lightDarker],
                                            min: 0,
                                            max: 1,
                                        }),
                                    }}
                                >
                                    {children}
                                </div>
                            )}
                            renderThumb={({ props: innerProps }) => (
                                <div
                                    {...innerProps}
                                    style={{
                                        ...innerProps.style,
                                        height: '20px',
                                        width: '20px',
                                        borderRadius: '4px',
                                        backgroundColor: '#FFF',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        boxShadow: '0px 2px 6px #AAA',
                                    }}
                                />
                            )}
                        />
                        <div className="mt-2 text-center">
                            <span className="mr-2">Certainty {props.certaintyThreshold[0].toFixed(2)}</span>
                            <Tooltip
                                trigger="click"
                                hideDefaultIcon
                                message="Here you can adjust the certainty value, that means at which level you accept the confidence ratio of automatic annotations. Only the shown annotations will be used to create the contribution data in the next step."
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AbstractAnnotatorView;

AbstractAnnotatorView.propTypes = {
    certaintyThreshold: PropTypes.array.isRequired,
    classOptions: PropTypes.array.isRequired,
    isAbstractLoading: PropTypes.bool.isRequired,
    isAnnotationLoading: PropTypes.bool.isRequired,
    isAnnotationFailedLoading: PropTypes.bool.isRequired,
    handleChangeCertaintyThreshold: PropTypes.func.isRequired,
    getClassColor: PropTypes.func.isRequired,
    annotationError: PropTypes.string,
};

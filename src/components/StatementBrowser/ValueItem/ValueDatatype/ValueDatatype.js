import Link from 'next/link';
import { Badge } from 'reactstrap';
import DATA_TYPES from 'constants/DataTypes';
import { useSelector } from 'react-redux';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { reverse } from 'named-urls';

function ValueDatatype(props) {
    const preferences = useSelector((state) => state.statementBrowser.preferences);

    return (
        <>
            {props.value._class === ENTITIES.LITERAL && (
                <small>
                    <Badge color="light" className="ms-2 me-2" title={props.value.datatype}>
                        {DATA_TYPES.find((dt) => dt.type === props.value.datatype)?.name ?? props.value.datatype}
                    </Badge>
                </small>
            )}
            {props.value._class === ENTITIES.RESOURCE && (
                <small>
                    <Badge color="light" className="ms-2 me-2">
                        {props.value.classes?.length > 0 &&
                            props.value.classes
                                .map((c) => (
                                    <DescriptionTooltip key={c} id={c} _class={ENTITIES.CLASS} disabled={!preferences.showDescriptionTooltips}>
                                        <Link target="_blank" style={{ color: '#60687a' }} href={reverse(ROUTES.CLASS, { id: c })}>
                                            {c}
                                        </Link>
                                    </DescriptionTooltip>
                                ))
                                .reduce((prev, curr) => [prev, ', ', curr])}
                    </Badge>
                </small>
            )}
        </>
    );
}

ValueDatatype.propTypes = {
    value: PropTypes.object.isRequired,
};

export default ValueDatatype;

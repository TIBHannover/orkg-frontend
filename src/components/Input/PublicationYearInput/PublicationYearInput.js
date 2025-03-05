import dayjs from 'dayjs';
import { range } from 'lodash';
import PropTypes from 'prop-types';
import { Input } from 'reactstrap';

const PublicationYearInput = ({ value = '', onChange, inputId = null, isDisabled = false }) => (
    <Input id={inputId} type="select" value={value} onChange={(e) => onChange(e.target.value)} disabled={isDisabled}>
        <option value="">Year</option>
        {range(1900, dayjs().year() + 1)
            .reverse()
            .map((year) => (
                <option key={year}>{year}</option>
            ))}
    </Input>
);

PublicationYearInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    inputId: PropTypes.string,
    isDisabled: PropTypes.bool,
};

export default PublicationYearInput;

import dayjs from 'dayjs';
import { Input } from 'reactstrap';
import PropTypes from 'prop-types';

const PublicationMonthInput = ({ value = '', onChange, inputId = null, isDisabled = false }) => (
    <Input id={inputId} type="select" value={value} onChange={(e) => onChange(e.target.value)} disabled={isDisabled}>
        <option value="">Month</option>
        {dayjs.months().map((el, index) => (
            <option value={index + 1} key={index + 1}>
                {el}
            </option>
        ))}
    </Input>
);

PublicationMonthInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    inputId: PropTypes.string,
    isDisabled: PropTypes.bool,
};

export default PublicationMonthInput;

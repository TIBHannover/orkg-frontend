import { Button, Input } from 'reactstrap';
import { default as BaseDatePicker } from 'react-datepicker';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { range } from 'utils';
import moment from 'moment';

export default function DatePicker(props) {
    const years = range(1900, moment().year() + 1).reverse();
    const months = moment.months();
    return (
        <BaseDatePicker
            {...props}
            className="form-control"
            renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled
            }) => (
                <div
                    style={{
                        margin: 10,
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <Button
                        style={{ padding: '2px 8px', borderBottomRightRadius: '0', borderTopRightRadius: '0' }}
                        size="sm"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                    >
                        <Icon icon={faChevronLeft} />
                    </Button>
                    <Input
                        style={{ borderRadius: '0' }}
                        size="sm"
                        type="select"
                        name="select"
                        value={moment(date, 'YYYY-MM-DD').year()}
                        onChange={({ target: { value } }) => changeYear(value)}
                        onBlur={() => null}
                    >
                        {years.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </Input>
                    <Input
                        style={{ borderRadius: '0' }}
                        size="sm"
                        type="select"
                        name="select"
                        value={moment(date, 'YYYY-MM-DD').month()}
                        onChange={({ target: { value } }) => {
                            changeMonth(value);
                        }}
                        onBlur={() => null}
                    >
                        {months.map((option, index) => (
                            <option key={index} value={index}>
                                {option}
                            </option>
                        ))}
                    </Input>

                    <Button
                        style={{ padding: '2px 8px', borderBottomLeftRadius: '0', borderTopLeftRadius: '0' }}
                        size="sm"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                    >
                        <Icon icon={faChevronRight} />
                    </Button>
                </div>
            )}
        />
    );
}

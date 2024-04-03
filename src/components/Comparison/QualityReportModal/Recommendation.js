import { faCaretDown, faCaretRight, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert, Card, CardBody, Collapse, Table } from 'reactstrap';

const Recommendation = ({ type, title, info, evaluation, solution }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <li>
            <Alert
                color={type === 'issue' ? 'danger' : 'success'}
                className="py-2 mb-2 d-flex justify-content-between align-items-center"
                tabIndex={0}
                role="button"
                fade={false}
                style={{ cursor: 'pointer' }}
                onClick={() => setIsOpen((v) => !v)}
            >
                <span>
                    <span className="d-inline-block" style={{ width: 20 }}>
                        <Icon icon={isOpen ? faCaretDown : faCaretRight} />
                    </span>
                    {title}
                </span>
                <Icon icon={type === 'issue' ? faTimes : faCheck} style={{ fontSize: `${type === 'issue' ? 150 : 130}%` }} />
            </Alert>
            <Collapse isOpen={isOpen}>
                <Card className="mb-2">
                    <CardBody className="px-2 py-0">
                        <Table className="m-0">
                            <tbody>
                                <tr>
                                    <th scope="row" style={{ width: '20%' }}>
                                        Description
                                    </th>
                                    <td>{info}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Evaluation</th>
                                    <td>{evaluation}</td>
                                </tr>
                                <tr>
                                    <th scope="row" className="border-0">
                                        Solution
                                    </th>
                                    <td className="border-0">{solution}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </Collapse>
        </li>
    );
};

Recommendation.propTypes = {
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    info: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    evaluation: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    solution: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

export default Recommendation;

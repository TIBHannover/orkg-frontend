import { faCaretDown, faCaretRight, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, ReactNode, useState } from 'react';

import Alert from '@/components/Ui/Alert/Alert';
import Card from '@/components/Ui/Card/Card';
import CardBody from '@/components/Ui/Card/CardBody';
import Collapse from '@/components/Ui/Nav/Collapse';
import Table from '@/components/Ui/Table/Table';

type RecommendationProps = {
    type: string;
    title: string;
    info: string | ReactNode;
    evaluation: string | ReactNode;
    solution: string | ReactNode;
};

const Recommendation: FC<RecommendationProps> = ({ type, title, info, evaluation, solution }) => {
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
                        <FontAwesomeIcon icon={isOpen ? faCaretDown : faCaretRight} />
                    </span>
                    {title}
                </span>
                <FontAwesomeIcon icon={type === 'issue' ? faTimes : faCheck} style={{ fontSize: `${type === 'issue' ? 150 : 130}%` }} />
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

export default Recommendation;

import { isArray, isEqual } from 'lodash';
import { Fragment, useCallback, useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap';

import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';

const labels = {
    doi: 'DOI',
    title: 'Title',
    authors: 'Authors',
    publicationMonth: 'Publication month',
    publicationYear: 'Publication year',
    publishedIn: 'Published in',
    url: 'URL',
};

const useOverwriteValuesModal = () => {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [valuesToBeOverwritten, setValuesToBeOverwritten] = useState([]);
    const [promiseCallbacks, setPromiseCallbacks] = useState({ proceed: () => {}, cancel: () => {} });

    const shouldUpdateValues = ({ currentData, newData }) => {
        const _valuesToBeOverwritten = [];
        for (const [key, value] of Object.entries(currentData)) {
            const doesValueExist = isArray(value) ? value.length > 0 : !!value;
            if (doesValueExist && !isEqual(value, newData[key])) {
                _valuesToBeOverwritten.push({
                    key,
                    current: currentData[key],
                    new: newData[key],
                });
            }
        }
        if (_valuesToBeOverwritten.length > 0) {
            setIsOpenModal(true);
            setValuesToBeOverwritten(_valuesToBeOverwritten);

            const promise = new Promise((resolve, reject) => {
                setPromiseCallbacks({
                    resolve,
                    reject,
                });
            });
            return promise.then(
                () => {
                    setIsOpenModal(false);
                    return true;
                },
                () => {
                    setIsOpenModal(false);
                    return false;
                },
            );
        }
        return true;
    };

    const OverwriteValuesModal = useCallback(
        () =>
            isOpenModal && (
                <Modal isOpen toggle={() => setIsOpenModal((v) => !v)}>
                    <ModalHeader toggle={() => setIsOpenModal((v) => !v)}>Values will be overwritten</ModalHeader>
                    <ModalBody>
                        <p>The following values will be overwritten if you continue</p>
                        <Table bordered size="sm">
                            <tbody>
                                {valuesToBeOverwritten.map((value) => (
                                    <Fragment key={value.key}>
                                        <tr className="bg-light">
                                            <th colSpan="2">{labels[value.key]}</th>
                                        </tr>
                                        <tr>
                                            <th scope="row">Current</th>
                                            <td>{value.key !== 'authors' ? value.current : <AuthorBadges authors={value.current} />}</td>
                                        </tr>
                                        <tr>
                                            <th scope="row">New</th>
                                            <td>{value.key !== 'authors' ? value.new : <AuthorBadges authors={value.new} />}</td>
                                        </tr>
                                    </Fragment>
                                ))}
                            </tbody>
                        </Table>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={() => promiseCallbacks.reject()}>
                            Cancel
                        </Button>
                        <Button color="primary" onClick={() => promiseCallbacks.resolve()}>
                            Replace
                        </Button>
                    </ModalFooter>
                </Modal>
            ),
        [isOpenModal, promiseCallbacks, valuesToBeOverwritten],
    );

    return { OverwriteValuesModal, shouldUpdateValues };
};

export default useOverwriteValuesModal;

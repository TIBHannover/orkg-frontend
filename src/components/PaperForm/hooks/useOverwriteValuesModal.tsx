import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';
import { isArray, isEqual } from 'lodash';
import { ReactNode, useCallback, useState } from 'react';

import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import { Author } from '@/services/backend/types';

const labels = {
    doi: 'DOI',
    title: 'Title',
    authors: 'Authors',
    publicationMonth: 'Publication month',
    publicationYear: 'Publication year',
    publishedIn: 'Published in',
    url: 'URL',
} as const;

type FieldKey = keyof typeof labels;

type OverwriteEntry = {
    key: FieldKey;
    current: unknown;
    new: unknown;
};

type PromiseCallbacks = {
    resolve: () => void;
    reject: () => void;
};

type DataRecord = Partial<Record<FieldKey, unknown>>;

const renderValue = (key: FieldKey, value: unknown): ReactNode => {
    if (key === 'authors') {
        const authors = (isArray(value) ? value : []) as Author[];
        return authors.length > 0 ? <AuthorBadges authors={authors} /> : <span className="text-default-400">—</span>;
    }
    if (value === null || value === undefined || value === '') {
        return <span className="text-default-400">—</span>;
    }
    return String(value);
};

const useOverwriteValuesModal = () => {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [valuesToBeOverwritten, setValuesToBeOverwritten] = useState<OverwriteEntry[]>([]);
    const [promiseCallbacks, setPromiseCallbacks] = useState<PromiseCallbacks>({ resolve: () => {}, reject: () => {} });

    const shouldUpdateValues = ({ currentData, newData }: { currentData: DataRecord; newData: DataRecord }): Promise<boolean> => {
        const _valuesToBeOverwritten: OverwriteEntry[] = [];
        for (const [key, value] of Object.entries(currentData) as [FieldKey, unknown][]) {
            const doesValueExist = isArray(value) ? value.length > 0 : !!value;
            if (doesValueExist && !isEqual(value, newData[key])) {
                _valuesToBeOverwritten.push({
                    key,
                    current: value,
                    new: newData[key],
                });
            }
        }
        if (_valuesToBeOverwritten.length > 0) {
            setIsOpenModal(true);
            setValuesToBeOverwritten(_valuesToBeOverwritten);

            const promise = new Promise<void>((resolve, reject) => {
                setPromiseCallbacks({ resolve, reject });
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
        return Promise.resolve(true);
    };

    const OverwriteValuesModal = useCallback(
        () => (
            <Modal.Backdrop
                isOpen={isOpenModal}
                onOpenChange={(open) => {
                    if (!open) promiseCallbacks.reject();
                }}
            >
                <Modal.Container size="md">
                    <Modal.Dialog className="sm:max-w-xl">
                        <Modal.CloseTrigger className="!top-3 !right-3" />
                        <Modal.Header>
                            <Modal.Heading>Values will be overwritten</Modal.Heading>
                            <p className="text-sm text-default-500 mt-1">The following fields will be replaced if you continue.</p>
                        </Modal.Header>
                        <Modal.Body className="flex flex-col gap-3 p-1">
                            {valuesToBeOverwritten.map((v) => (
                                <div key={v.key} className="p-3 rounded-medium border border-default-200 bg-default-50/50">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-default-500 mb-2">{labels[v.key]}</div>
                                    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 text-sm">
                                        <div className="min-w-0">
                                            <div className="text-[11px] text-default-400 mb-1">Current</div>
                                            <div className="break-words text-default-500 line-through decoration-default-300">
                                                {renderValue(v.key, v.current)}
                                            </div>
                                        </div>
                                        <FontAwesomeIcon icon={faArrowRight} className="text-default-400 mt-5" />
                                        <div className="min-w-0">
                                            <div className="text-[11px] text-primary mb-1">New</div>
                                            <div className="break-words font-medium">{renderValue(v.key, v.new)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="ghost" onPress={() => promiseCallbacks.reject()}>
                                Cancel
                            </Button>
                            <Button variant="primary" onPress={() => promiseCallbacks.resolve()}>
                                Replace
                            </Button>
                        </Modal.Footer>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        ),
        [isOpenModal, promiseCallbacks, valuesToBeOverwritten],
    );

    return { OverwriteValuesModal, shouldUpdateValues };
};

export default useOverwriteValuesModal;

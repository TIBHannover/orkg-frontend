import { faPen } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import useComparison from '@/components/Comparison/hooks/useComparison';
import ReferencesModal from '@/components/Comparison/References/ReferencesModal/ReferencesModal';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';

function References() {
    const [isOpenReferencesModal, setIsOpenReferencesModal] = useState(false);
    const { comparison } = useComparison();
    const { isEditMode } = useIsEditMode();

    if (!comparison) {
        return null;
    }

    return (
        <div>
            {(isEditMode || comparison.references?.length > 0) && (
                <div id="dataSources" className="py-3" style={{ lineHeight: 1.5 }}>
                    <h5>
                        References{' '}
                        {isEditMode && (
                            <ActionButtonView icon={faPen} action={() => setIsOpenReferencesModal(true)} isDisabled={false} title="Edit" />
                        )}
                    </h5>
                    {comparison.references?.length > 0 && (
                        <ul className="m-0">
                            {comparison.references.map((reference, index) => (
                                <li key={index} className="fst-italic">
                                    <small>
                                        <ValuePlugins type={ENTITIES.LITERAL}>{reference}</ValuePlugins>
                                    </small>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!comparison.references?.length && <p className="m-0">No references</p>}
                </div>
            )}
            {isOpenReferencesModal && <ReferencesModal toggle={() => setIsOpenReferencesModal((v) => !v)} />}
        </div>
    );
}

export default References;

import { faPen } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

import ReferencesModal from '@/app/comparisons/[comparisonId]/ComparisonWithContext/ComparisonPage/References/ReferencesModal/ReferencesModal';
import ActionButton from '@/components/ActionButton/ActionButton';
import useComparison from '@/components/Comparison/hooks/useComparison';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';

const References = () => {
    const [isOpenReferencesModal, setIsOpenReferencesModal] = useState(false);
    const { comparison } = useComparison();
    const { isEditMode } = useIsEditMode();

    if (!comparison) {
        return null;
    }

    const hasReferences = (comparison.references?.length ?? 0) > 0;

    if (!isEditMode && !hasReferences) {
        return null;
    }

    return (
        <div id="dataSources" className="py-6">
            <div className="mb-3 flex items-center gap-2">
                <h3 className="text-lg font-semibold m-0">References</h3>
                {isEditMode && <ActionButton title="Edit references" icon={faPen} action={() => setIsOpenReferencesModal(true)} />}
            </div>
            {hasReferences ? (
                <ul className="m-0 pl-5 list-disc flex flex-col gap-1 leading-relaxed">
                    {comparison.references.map((reference, index) => (
                        <li key={index} className="italic text-sm text-muted">
                            <ValuePlugins type={ENTITIES.LITERAL}>{reference}</ValuePlugins>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="m-0 text-sm text-gray-500 italic">No references</p>
            )}
            {isOpenReferencesModal && <ReferencesModal toggle={() => setIsOpenReferencesModal((v) => !v)} />}
        </div>
    );
};

export default References;

import { faStream } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Skeleton } from '@heroui/react';
import { buttonVariants } from '@heroui/styles';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useState } from 'react';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import ResearchFieldCard from '@/components/Home/ResearchFieldCard';
import { CLASSES, ENTITIES, RESOURCES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Node } from '@/services/backend/types';
import { reverseWithSlug } from '@/utilsTyped';

const MAX_FIELDS = 30;

const ResearchFieldCards = ({
    selectedFieldId,
    selectedFieldLabel,
    researchFields,
    isLoading,
}: {
    selectedFieldId: string;
    selectedFieldLabel: string;
    researchFields: Node[];
    isLoading: boolean;
}) => {
    const [showMoreFields, setShowMoreFields] = useState(false);
    const router = useRouter();
    const researchFieldsSliced = showMoreFields ? researchFields : researchFields.slice(0, MAX_FIELDS);

    const [contentType] = useQueryState('contentType', { defaultValue: CLASSES.COMPARISON });

    return (
        <div className="relative">
            <div className="flex flex-wrap items-stretch">
                <h1 className="w-full md:shrink-0 md:grow-0 md:w-8/12 md:basis-8/12 md:max-w-8/12 text-xl shrink-0 mb-0">
                    <FontAwesomeIcon icon={faStream} className="text-accent" /> Browse by research field
                </h1>
                <div className="w-full md:shrink-0 md:grow-0 md:w-4/12 md:basis-4/12 md:max-w-4/12 mt-2 md:mt-0 flex-row-reverse flex">
                    <div style={{ minWidth: 300 }} id="tour-research-field-bar">
                        <Autocomplete
                            entityType={ENTITIES.RESOURCE}
                            includeClasses={[CLASSES.RESEARCH_FIELD]}
                            placeholder="Search for fields..."
                            onChange={(selected) => {
                                if (selected) {
                                    router.push(
                                        `${reverseWithSlug(ROUTES.HOME_WITH_RESEARCH_FIELD, {
                                            researchFieldId: (selected as OptionType).id,
                                            slug: (selected as OptionType).label,
                                        })}?contentType=${contentType}`,
                                    );
                                }
                            }}
                            value={
                                selectedFieldId !== RESOURCES.RESEARCH_FIELD_MAIN
                                    ? {
                                          id: selectedFieldId,
                                          label: selectedFieldLabel,
                                      }
                                    : null
                            }
                            enableExternalSources={false}
                            allowCreate={false}
                            size="sm"
                            isDisabled={isLoading}
                            rightAligned
                        />
                    </div>
                    {selectedFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                        <Link
                            className={`${buttonVariants({ variant: 'tertiary', size: 'sm' })} shrink-0 mr-2`}
                            href={`${reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                researchFieldId: selectedFieldId,
                                slug: selectedFieldLabel,
                            })}?contentType=${contentType}`}
                        >
                            Visit field page
                        </Link>
                    )}
                </div>
            </div>
            <hr className="mt-4 mb-1" />
            {RESOURCES.RESEARCH_FIELD_MAIN !== selectedFieldId && (
                <>
                    <Breadcrumbs backgroundWhite researchFieldId={selectedFieldId} route={ROUTES.HOME_WITH_RESEARCH_FIELD} />
                    <hr className="mt-1 mb-1" />
                </>
            )}
            {!isLoading && researchFields.length > 0 && (
                <div className="mt-4">
                    <AnimatePresence>
                        <motion.div
                            id="research-field-cards"
                            className="mt-2 justify-center flex flex-wrap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            {researchFieldsSliced?.map((field, index) => (
                                <motion.div
                                    key={field.id}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.39, 0.575, 0.565, 1],
                                        delay: index * 0.05,
                                    }}
                                    style={{ display: 'contents' }}
                                >
                                    <ResearchFieldCard field={field} />
                                </motion.div>
                            ))}
                            {researchFields.length > MAX_FIELDS && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.39, 0.575, 0.565, 1],
                                    }}
                                    role="button"
                                    onClick={() => setShowMoreFields((v) => !v)}
                                    className="cursor-pointer !bg-background !text-foreground border-0 rounded-xl min-h-[85px] min-w-[140px] m-2.5 transition-opacity duration-200 flex flex-col justify-center flex-[0_0_calc(20%-20px)] text-center hover:opacity-80 active:relative active:top-1 max-[400px]:flex-[0_0_80%]"
                                >
                                    {showMoreFields ? 'Show less fields' : 'Show more fields...'}
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
            {isLoading && (
                <div className="mt-4 flex gap-4 justify-center">
                    <Skeleton className="w-[15%] h-7 rounded" />
                    <Skeleton className="w-[15%] h-7 rounded" />
                    <Skeleton className="w-[15%] h-7 rounded" />
                    <Skeleton className="w-[15%] h-7 rounded" />
                    <Skeleton className="w-[15%] h-7 rounded" />
                </div>
            )}
            {selectedFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                <div
                    className="absolute -bottom-[calc(15px+1rem)] left-[89px] w-0 h-0 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.13)]"
                    style={{
                        borderLeft: '15px solid transparent',
                        borderRight: '15px solid transparent',
                        borderTop: '15px solid var(--surface)',
                    }}
                />
            )}
        </div>
    );
};

export default ResearchFieldCards;

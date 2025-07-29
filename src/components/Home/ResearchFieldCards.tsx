import { faStream } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import { OptionType } from '@/components/Autocomplete/types';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import ResearchFieldCard, { Card } from '@/components/Home/ResearchFieldCard';
import Button from '@/components/Ui/Button/Button';
import { CLASSES, ENTITIES, RESOURCES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { Node } from '@/services/backend/types';
import { reverseWithSlug } from '@/utils';

const ArrowCards = styled.div`
    background: transparent;
    position: absolute;
    left: 0px;
    transform: translate(89px);
    bottom: -15px;
    width: 0;
    height: 0;
    border-left: 15px solid transparent;
    border-right: 15px solid transparent;
    border-top: 15px solid #fff;
    filter: drop-shadow(1px 1px 0px rgba(0, 0, 0, 0.13));
`;

const ShowMore = styled(Card)`
    background: ${(props) => props.theme.light}!important;
    color: ${(props) => props.theme.bodyColor} !important;
    text-align: center;
`;

const MotionShowMore = motion.create(ShowMore);

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

    return (
        <>
            <div className="row" style={{ position: 'relative' }}>
                <h1 className="col-md-8 h5 flex-shrink-0 mb-0">
                    <FontAwesomeIcon icon={faStream} className="text-primary" /> Browse by research field
                </h1>
                <div className="col-md-4 mt-2 mt-md-0 flex-row-reverse d-flex">
                    <div style={{ minWidth: 300 }} id="tour-research-field-bar">
                        <Autocomplete
                            entityType={ENTITIES.RESOURCE}
                            includeClasses={[CLASSES.RESEARCH_FIELD]}
                            placeholder="Search for fields..."
                            onChange={(selected) => {
                                if (selected) {
                                    router.push(
                                        reverseWithSlug(ROUTES.HOME_WITH_RESEARCH_FIELD, {
                                            researchFieldId: (selected as OptionType).id,
                                            slug: (selected as OptionType).label,
                                        }),
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
                        <Button
                            tag={Link}
                            href={reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                researchFieldId: selectedFieldId,
                                slug: selectedFieldLabel,
                            })}
                            color="light"
                            size="sm"
                            className="flex-shrink-0 me-2"
                        >
                            Visit field page
                        </Button>
                    )}
                </div>
            </div>
            <hr className="mt-3 mb-1" />
            {RESOURCES.RESEARCH_FIELD_MAIN !== selectedFieldId && (
                <>
                    <Breadcrumbs backgroundWhite researchFieldId={selectedFieldId} route={ROUTES.HOME_WITH_RESEARCH_FIELD} disableLastField />
                    <hr className="mt-1 mb-1" />
                </>
            )}

            {!isLoading && researchFields.length > 0 && (
                <div className="mt-3">
                    <AnimatePresence>
                        <motion.div
                            id="research-field-cards"
                            className="mt-2 justify-content-center d-flex flex-wrap"
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
                                <MotionShowMore
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        duration: 0.4,
                                        ease: [0.39, 0.575, 0.565, 1],
                                    }}
                                    role="button"
                                    onClick={() => setShowMoreFields((v) => !v)}
                                    as="div"
                                >
                                    {showMoreFields ? 'Show less fields' : 'Show more fields...'}
                                </MotionShowMore>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
            {selectedFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && <ArrowCards />}
            {isLoading && (
                <div className="mt-3">
                    <div>
                        <ContentLoader height="10%" width="100%" viewBox="0 0 100 10" style={{ width: '100% !important' }}>
                            <rect x="2" y="0" rx="2" ry="2" width="15" height="7" />
                            <rect x="22" y="0" rx="2" ry="2" width="15" height="7" />
                            <rect x="42" y="0" rx="2" ry="2" width="15" height="7" />
                            <rect x="62" y="0" rx="2" ry="2" width="15" height="7" />
                            <rect x="82" y="0" rx="2" ry="2" width="15" height="7" />
                        </ContentLoader>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResearchFieldCards;

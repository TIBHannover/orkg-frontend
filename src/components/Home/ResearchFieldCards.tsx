import { faStream } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import Link from 'components/NextJsMigration/Link';
import useRouter from 'components/NextJsMigration/useRouter';
import { CLASSES, RESOURCES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import pluralize from 'pluralize';
import { useId, useRef, useState } from 'react';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Button } from 'reactstrap';
import { resourcesUrl } from 'services/backend/resources';
import { ResearchFieldStat } from 'services/backend/stats';
import { Node } from 'services/backend/types';
import styled from 'styled-components';
import { reverseWithSlug } from 'utils';

/* Bootstrap card column is not working correctly working with vertical alignment,
thus used custom styling here */

const Card = styled(Link)`
    cursor: pointer;
    background: #e86161 !important;
    color: #fff !important;
    border: 0 !important;
    border-radius: 12px !important;
    min-height: 85px;
    flex: 0 0 calc(20% - 20px) !important;
    margin: 10px;
    transition: opacity 0.2s;
    justify-content: center;
    display: flex;
    flex: 1 1 auto;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 140px;
    overflow-wrap: anywhere;

    &:hover {
        opacity: 0.8;
    }
    &[disabled] {
        opacity: 0.5;
        cursor: default;
        pointer-events: none;
    }
    &:active {
        top: 4px;
    }

    @media (max-width: 400px) {
        flex: 0 0 80% !important;
    }
`;

const CardTitle = styled.h5`
    color: #fff;
    font-size: 16px;
    padding: 0 5px;
`;

const PaperAmount = styled.div`
    opacity: 0.5;
    font-size: 80%;
    text-align: center;
`;

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

const AnimationContainer = styled(CSSTransition)`
    //transition: 0.3s background-color, 0.3s border-color;

    animation: scale-up-center 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;
    @keyframes scale-up-center {
        0% {
            transform: scale(0.5);
        }
        100% {
            transform: scale(1);
        }
    }
`;

const ShowMore = styled(Card)`
    background: ${(props) => props.theme.light}!important;
    color: ${(props) => props.theme.bodyColor} !important;
    text-align: center;
`;
type SelectedType = {
    id: string;
    value: string;
};

const MAX_FIELDS = 30;

const ResearchFieldCards = ({
    selectedFieldId,
    selectedFieldLabel,
    researchFields,
    researchFieldStats,
    isLoading,
    isLoadingStats,
}: {
    selectedFieldId: string;
    selectedFieldLabel: string;
    researchFields: Node[];
    researchFieldStats: ResearchFieldStat[];
    isLoading: boolean;
    isLoadingStats: boolean;
}) => {
    // Assuming rfAutocompleteRef is a ref pointing to an HTMLInputElement or null
    const rfAutocompleteRef = useRef<HTMLInputElement | null>(null);
    const [showMoreFields, setShowMoreFields] = useState(false);
    const router = useRouter();
    const researchFieldsSliced = showMoreFields ? researchFields : researchFields.slice(0, MAX_FIELDS);
    const instanceId = useId();
    return (
        <>
            <div className="row" style={{ position: 'relative' }}>
                <h1 className="col-md-8 h5 flex-shrink-0 mb-0">
                    <Icon icon={faStream} className="text-primary" /> Browse by research field
                </h1>
                <div className="col-md-4 mt-2 mt-md-0 flex-row-reverse d-flex">
                    <div style={{ minWidth: 300 }} id="tour-research-field-bar">
                        <Autocomplete
                            requestUrl={resourcesUrl}
                            optionsClass={CLASSES.RESEARCH_FIELD}
                            placeholder="Search for fields..."
                            onItemSelected={(selected: SelectedType) => {
                                // blur the field allows to focus and open the menu again
                                rfAutocompleteRef.current && rfAutocompleteRef.current.blur();
                                router.push(
                                    reverseWithSlug(ROUTES.HOME_WITH_RESEARCH_FIELD, {
                                        researchFieldId: selected.id,
                                        slug: selected.value,
                                    }),
                                );
                            }}
                            value={
                                selectedFieldId !== RESOURCES.RESEARCH_FIELD_MAIN
                                    ? {
                                          id: selectedFieldId,
                                          label: selectedFieldLabel,
                                      }
                                    : null
                            }
                            allowCreate={false}
                            ols={false}
                            autoLoadOption
                            cssClasses="form-control-sm"
                            isDisabled={isLoading}
                            innerRef={rfAutocompleteRef}
                            instanceId={instanceId}
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
                    <div>
                        <TransitionGroup id="research-field-cards" className="mt-2 justify-content-center d-flex flex-wrap" exit={false}>
                            {researchFieldsSliced?.map((field, index) => (
                                <AnimationContainer key={field.id} classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                    {/* @ts-expect-error */}
                                    <Card
                                        disabled={researchFieldStats?.[index]?.total === 0}
                                        href={reverseWithSlug(ROUTES.HOME_WITH_RESEARCH_FIELD, {
                                            researchFieldId: field.id,
                                            slug: field.label,
                                        })}
                                    >
                                        <CardTitle className="card-title m-0 text-center"> {field.label}</CardTitle>
                                        <PaperAmount>
                                            {!isLoadingStats ? (
                                                <>
                                                    {pluralize('paper', researchFieldStats?.[index]?.papers ?? 0, true)} -{' '}
                                                    {pluralize('comparison', researchFieldStats?.[index]?.comparisons ?? 0, true)}
                                                </>
                                            ) : (
                                                'Loading...'
                                            )}
                                        </PaperAmount>
                                    </Card>
                                </AnimationContainer>
                            ))}
                            {researchFields.length > MAX_FIELDS && (
                                <AnimationContainer classNames="fadeIn" timeout={{ enter: 500, exit: 0 }}>
                                    <ShowMore role="button" onClick={() => setShowMoreFields((v) => !v)} as="div">
                                        {showMoreFields ? 'Show less fields' : 'Show more fields...'}
                                    </ShowMore>
                                </AnimationContainer>
                            )}
                        </TransitionGroup>
                    </div>
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

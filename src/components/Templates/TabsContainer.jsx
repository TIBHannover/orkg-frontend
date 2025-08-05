import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import useCountInstances from '@/components/Class/hooks/useCountInstances';
import ClassInstances from '@/components/ClassInstances/ClassInstances';
import LoadingOverlay from '@/components/LoadingOverlay/LoadingOverlay';
import Tabs from '@/components/Tabs/Tabs';
import Format from '@/components/Templates/Tabs/Format/Format';
import GeneralSettings from '@/components/Templates/Tabs/GeneralSettings/GeneralSettings';
import PropertyShapesTab from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShapesTab';
import Badge from '@/components/Ui/Badge/Badge';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ROUTES from '@/constants/routes';

export const StyledContainer = styled(Container)`
    fieldset.scheduler-border {
        border: 1px groove #ddd !important;
        padding: 0 1.4em 1.4em 1.4em !important;
        margin: 0 0 1.5em 0 !important;
        -webkit-box-shadow: 0px 0px 0px 0px #000;
        box-shadow: 0px 0px 0px 0px #000;
    }
`;

function TabsContainer({ id }) {
    const { activeTab } = useParams();
    const countPropertyShapes = useSelector((state) => state.templateEditor.properties.length ?? 0);
    const targetClassId = useSelector((state) => state.templateEditor.target_class?.id);
    const isSaving = useSelector((state) => state.templateEditor.isSaving);
    const isLoading = useSelector((state) => state.templateEditor.isLoading);
    const { isEditMode } = useIsEditMode();
    const router = useRouter();

    const { countInstances, isLoading: isLoadingCount } = useCountInstances(targetClassId);

    const onTabChange = (key) => {
        router.push(
            `${reverse(ROUTES.TEMPLATE_TABS, {
                id,
                activeTab: key,
            })}?isEditMode=${isEditMode}`,
        );
    };

    return (
        <StyledContainer className="mt-3 p-0 position-relative">
            <LoadingOverlay
                isLoading={isLoading || isSaving}
                classNameOverlay="rounded"
                loadingText={
                    <>
                        {!isSaving && isLoading && <h1 className="h4">Loading</h1>}
                        {isSaving && (
                            <div>
                                <h1 className="h4">Saving...</h1>
                                Please <strong>do not</strong> leave this page until the save process is finished.
                            </div>
                        )}
                    </>
                }
            >
                <Tabs
                    className="box rounded"
                    destroyOnHidden={false}
                    onChange={onTabChange}
                    activeKey={activeTab ?? 'description'}
                    items={[
                        {
                            label: 'Description',
                            key: 'description',
                            children: (
                                <div className="px-4 py-3">
                                    <GeneralSettings />
                                </div>
                            ),
                        },
                        {
                            label: (
                                <>
                                    Properties <Badge pill>{countPropertyShapes}</Badge>
                                </>
                            ),
                            key: 'properties',
                            children: (
                                <div className="px-4 py-3">
                                    <PropertyShapesTab />
                                </div>
                            ),
                        },
                        {
                            label: 'Format',
                            key: 'format',
                            children: (
                                <div className="px-4 py-3">
                                    <Format />
                                </div>
                            ),
                        },
                        ...(targetClassId
                            ? [
                                  {
                                      label: (
                                          <>
                                              Instances{' '}
                                              {isLoadingCount ? (
                                                  <FontAwesomeIcon icon={faSpinner} className="me-2" spin />
                                              ) : (
                                                  <Badge pill>{countInstances}</Badge>
                                              )}
                                          </>
                                      ),
                                      key: 'instances',
                                      children: (
                                          <div className="px-4 py-3">
                                              <ClassInstances classId={targetClassId} title="template" />
                                          </div>
                                      ),
                                  },
                              ]
                            : []),
                    ]}
                />
            </LoadingOverlay>
        </StyledContainer>
    );
}

TabsContainer.propTypes = {
    id: PropTypes.string.isRequired,
};

export default TabsContainer;

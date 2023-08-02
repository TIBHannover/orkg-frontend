import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { RadialMenu } from 'reagraph';
import styled from 'styled-components';

const StyledContextMenu = styled.div`
    --radial-menu-background: #fff;
    --radial-menu-color: #000;
    --radial-menu-border: #aacbd2;
    --radial-menu-active-color: #000;
    --radial-menu-active-background: #d8e6ea;
`;

const ContextMenu = ({ getExpandButtonLabel, toggleExpandNode, onClose, fetchIncomingStatements, data }) => (
    <StyledContextMenu>
        <RadialMenu
            onClose={onClose}
            items={[
                ...(data._class === ENTITIES.RESOURCE
                    ? [
                          {
                              label: getExpandButtonLabel(data),
                              disabled: !data.hasObjectStatements,
                              onClick: () => {
                                  toggleExpandNode(data.id);
                                  onClose();
                              },
                          },
                          {
                              label: (
                                  <>
                                      View
                                      <br />
                                      resource
                                  </>
                              ),
                              onClick: () => {
                                  window.open(`${reverse(ROUTES.RESOURCE, { id: data.id })}?noRedirect`, '_blank');
                                  onClose();
                              },
                          },
                          {
                              label: (
                                  <>
                                      Fetch
                                      <br />
                                      incoming
                                  </>
                              ),
                              onClick: () => fetchIncomingStatements(data.id),
                          },
                      ]
                    : []),
            ]}
        />
    </StyledContextMenu>
);

ContextMenu.propTypes = {
    data: PropTypes.object.isRequired,
    getExpandButtonLabel: PropTypes.func.isRequired,
    toggleExpandNode: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    fetchIncomingStatements: PropTypes.func.isRequired,
};

export default ContextMenu;

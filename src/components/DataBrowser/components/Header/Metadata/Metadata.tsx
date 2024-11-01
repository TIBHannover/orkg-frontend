import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDataBrowserDispatch, useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import Classes, { BadgeTagsStyle } from 'components/DataBrowser/components/Header/Metadata/Classes';
import Label from 'components/DataBrowser/components/Header/Metadata/Label';
import Templates from 'components/DataBrowser/components/Header/Metadata/Templates';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import pluralize from 'pluralize';
import styled from 'styled-components';

export const MetadataStyled = styled.div`
    &.highlight {
        background: ${(props) => props.theme.primary} !important;
        a.text-primary {
            color: #fff !important;
        }
        animation: blinkAnimation 0.7s 3;
    }

    @keyframes blinkAnimation {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
`;

const Metadata = () => {
    const { entity } = useEntity();
    const { highlightedCycle } = useDataBrowserState();
    const dispatch = useDataBrowserDispatch();
    const highlight = highlightedCycle && highlightedCycle === entity?.id;

    return (
        <MetadataStyled
            className={`py-3 px-3 br-bottom ${highlight ? 'highlight' : ''}`}
            onAnimationEnd={() => highlightedCycle && dispatch({ type: 'HIGHLIGHT_CYCLE', payload: '' })}
        >
            <Label />
            <div className="d-flex flex-wrap">
                <Classes />
                <Templates />
                {entity && 'shared' in entity && entity.shared > 1 && (
                    <BadgeTagsStyle className="text-muted ps-2 my-1 me-1 pe-2 align-items-center d-flex">
                        <FontAwesomeIcon icon={faArrowRight} className="me-1" /> {`Referred: ${pluralize('time', entity.shared, true)}`}
                    </BadgeTagsStyle>
                )}
            </div>
        </MetadataStyled>
    );
};

export default Metadata;

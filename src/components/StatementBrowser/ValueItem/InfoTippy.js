import styled from 'styled-components';
import { useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faInfo, faSpinner, faClock } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Tippy from '@tippyjs/react';
import moment from 'moment';
import { getResourceLink } from 'utils';
import { ENTITIES, MISC } from 'constants/graphSettings';

export const OptionButton = styled(Button)`
    margin: 0 2px !important;
    display: inline-block !important;
    border-radius: 100% !important;
    background-color: ${props => props.theme.lightDarker}!important;
    color: ${props => props.theme.dark}!important;

    & .icon-wrapper {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;

        .icon {
            padding: 0;
            margin: 0;
            font-size: 12px;
        }
    }

    :focus {
        box-shadow: 0 0 0 0.2rem rgba(203, 206, 209, 0.5) !important;
    }
`;

export default function InfoTippy(props) {
    const [isLoading, setIsLoading] = useState(true);
    const value = useSelector(state => state.statementBrowser.values.byId[props.id]);
    const onTrigger = () => {
        setIsLoading(false);
    };
    return (
        <Tippy
            onTrigger={onTrigger}
            interactive={true}
            content={
                <div className="fullPath" style={{ width: '300px' }}>
                    {!isLoading ? (
                        <>
                            Entity ID: {value.id}
                            <br />
                            {value.classes?.length > 0 && (
                                <>
                                    Instance of:{' '}
                                    {value.classes.map((c, index) => (
                                        <>
                                            <Link to={getResourceLink(ENTITIES.CLASS, c)}>{c}</Link>
                                            {index + 1 < value.classes.length && ','}
                                        </>
                                    ))}
                                    <br />
                                </>
                            )}
                            Created:{' '}
                            <span title={value.created_at}>
                                <Icon icon={faClock} /> {moment(value.created_at).fromNow()}
                            </span>
                            <br />
                            Created by:{' '}
                            {value.created_by !== MISC.UNKNOWN_ID ? (
                                <UserAvatar size={18} showDisplayName={true} userId={value.created_by} />
                            ) : (
                                'Unknown'
                            )}
                            <br />
                        </>
                    ) : (
                        <Icon icon={faSpinner} spin />
                    )}
                </div>
            }
        >
            <span>
                <OptionButton color="link" className="p-0" aria-label="Show information about this statement">
                    <span
                        className="icon-wrapper"
                        style={{
                            width: '24px',
                            height: '24px'
                        }}
                    >
                        <Icon
                            className="icon"
                            style={{
                                fontSize: '12px'
                            }}
                            icon={faInfo}
                        />
                    </span>
                </OptionButton>
            </span>
        </Tippy>
    );
}

InfoTippy.propTypes = {
    id: PropTypes.string.isRequired
};

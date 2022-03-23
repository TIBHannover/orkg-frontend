import PropTypes from 'prop-types';
import { CLASSES } from 'constants/graphSettings';
import { Button, InputGroup } from 'reactstrap';
import moment from 'moment';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCalendar, faTags, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import pluralize from 'pluralize';
import styled from 'styled-components';

const NodeIdStyled = styled.div`
    .id {
        font-size: small;
        text-align: center;
        white-space: nowrap;
        background-color: #e9ecef;
        border: 1px solid #ced4da;
        height: 22px;
        line-height: 22px;
        display: inline-block;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }
    input {
        font-size: small;
        line-height: 24px;
        display: inline-block;
        height: 22px;
        border: 1px solid #dbdde5;
        width: 80px;
    }
    button {
        margin: auto;
        text-align: center;
        height: 22px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        svg {
            margin-top: -3px;
            vertical-align: middle;
        }
    }
`;

const ItemMetadata = ({ item, showClasses }) => {
    return (
        <div className="d-flex">
            <div className="flex-grow-1">
                {item.classes && item.classes.includes(CLASSES.COMPARISON) && (
                    <small className="d-inline-block me-2 text-muted">
                        <i>
                            <Icon size="sm" icon={faCalendar} className="me-1" /> {moment(item.created_at).format('DD MMMM YYYY - H:mm')}
                        </i>
                    </small>
                )}
                {item.shared > 0 && (
                    <small className="d-inline-block text-muted me-2">
                        <span>
                            <Icon icon={faArrowRight} color="#dbdde5" />
                        </span>
                        <i>{` Referred: ${pluralize('time', item.shared, true)}`}</i>
                    </small>
                )}
                {showClasses && item.classes?.length > 0 && (
                    <small className="d-inline-block text-muted me-2">
                        <span>
                            <Icon icon={faTags} color="#dbdde5" /> {' Instance of: '}
                        </span>
                        <i>{item.classes.join(', ')}</i>
                    </small>
                )}
            </div>
            <div className="d-flex align-items-end mb-1">
                <NodeIdStyled className="d-flex text-muted">
                    <span className="px-1 id">ID</span>
                    <InputGroup size="xs">
                        <input className="text-muted" length={item.id.length} disabled value={item.id} />
                        <CopyToClipboard
                            text={item.id}
                            onCopy={() => {
                                toast.dismiss();
                                toast.success(`ID copied!`);
                            }}
                        >
                            <Button className="px-2 py-0" size="sm" color="light">
                                <Icon icon={faClipboard} color="#6c757d" size="xs" />
                            </Button>
                        </CopyToClipboard>
                    </InputGroup>
                </NodeIdStyled>
            </div>
        </div>
    );
};

ItemMetadata.propTypes = {
    item: PropTypes.object.isRequired,
    showClasses: PropTypes.bool
};

ItemMetadata.defaultProps = {
    showClasses: false
};

export default ItemMetadata;

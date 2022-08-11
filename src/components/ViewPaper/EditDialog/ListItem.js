import classNames from 'classnames';
import PropTypes from 'prop-types';
import { StyledListGroupOpen, StyledStatementItem } from './styled';

const ListItem = props => {
    const listGroupClass = classNames({
        statementActive: props.open,
        statementItem: true,
        selectable: true,
        'rounded-bottom': props.isLastItem && !props.open,
    });

    const openBoxClass = classNames({
        listGroupOpenBorderBottom: props.isLastItem,
        'rounded-bottom': props.isLastItem,
        'list-group-item': true,
    });

    return (
        <>
            <StyledStatementItem className={listGroupClass} onClick={props.toggleItem}>
                {props.open ? (
                    props.label
                ) : (
                    <div className="d-flex justify-content-between">
                        <div>{props.label}</div> <div className="text-muted font-italic">{props.value}</div>
                    </div>
                )}
            </StyledStatementItem>
            <StyledListGroupOpen isOpen={props.open} className={openBoxClass}>
                <div className="py-3 px-3">{props.children}</div>
            </StyledListGroupOpen>
        </>
    );
};

ListItem.propTypes = {
    open: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    toggleItem: PropTypes.func.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object]),
    isLastItem: PropTypes.bool,
    children: PropTypes.node.isRequired,
};

ListItem.defaultProps = {
    isLastItem: false,
    value: '',
};

export default ListItem;

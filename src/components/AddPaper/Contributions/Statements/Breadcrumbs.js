import React, { Component } from 'react';
import { connect } from 'react-redux';
import { goToResourceHistory } from '../../../../actions/addPaper';

class Breadcrumbs extends Component {
    handleOnClick = (id, historyIndex) => {
        this.props.goToResourceHistory({
            id,
            historyIndex,
        });
    }

    render() {
        return <>
            {this.props.resourceHistory.allIds.map((history, index) => {
                let item = this.props.resourceHistory.byId[history];
                console.log(item);

                return <> <span className="btn btn-link p-0 border-0 align-baseline mb-3" onClick={() => this.handleOnClick(item.id, index)}>{item.label}</span> / </>;
            })}
        </>
    }
}
    
const mapStateToProps = state => {
    return {
        ...state.addPaper,
    }
};

const mapDispatchToProps = dispatch => ({
    goToResourceHistory: (data) => dispatch(goToResourceHistory(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs);
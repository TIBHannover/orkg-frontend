import { Component } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from '../../../constants/routes.js';

class Finish extends Component {
    render() {
        if (!this.props.paperNewResourceId) {
            // no ID yet, thus loading...
            return (
                <div className="text-center text-primary">
                    <span style={{ fontSize: 80 }}>
                        <Icon icon={faSpinner} spin />
                    </span>
                    <br />
                    <h2 className="h5">Loading...</h2> <br />
                </div>
            );
        } else {
            return (
                <div className="text-center text-primary">
                    <span style={{ fontSize: 80 }}>
                        <Icon icon={faCheckCircle} />
                    </span>
                    <br />
                    <h2 className="h5">Paper has been added successfully</h2>
                    <br />
                    <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.props.paperNewResourceId }) + '?comingFromWizard=true'}>
                        <Button color="primary" className="mb-4">
                            View paper
                        </Button>
                    </Link>
                </div>
            );
        }
    }
}

Finish.propTypes = {
    paperNewResourceId: PropTypes.string
};

Finish.defaultProps = {
    paperNewResourceId: null
};

const mapStateToProps = state => ({
    paperNewResourceId: state.addPaper.paperNewResourceId
});

export default connect(mapStateToProps)(Finish);

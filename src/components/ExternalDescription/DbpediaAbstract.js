import { Component } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import DBPEDIA_LOGO from 'assets/img/sameas/dbpedia.png';
import PropTypes from 'prop-types';
import { getAbstractByURI } from 'services/dbpedia';
import Image from 'components/NextJsMigration/Image';

class DbpediaAbstract extends Component {
    constructor(props) {
        super(props);

        this.state = {
            abstract: '',
            collapsed: true,
            isLoading: false,
            loadingFailed: false,
        };
    }

    componentDidMount() {
        this.getAbstract();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.externalResource !== this.props.externalResource) {
            this.getAbstract();
        }
    }

    getAbstract = () => {
        this.setState({ isLoading: true, loadingFailed: false });
        const resource = this.props.externalResource;
        getAbstractByURI(resource)
            .then(_abstract => {
                this.setState({
                    abstract: _abstract,
                    isLoading: false,
                    loadingFailed: !_abstract,
                });
            })
            .catch(error => {
                this.setState({ isLoading: false, loadingFailed: true });
            });
    };

    handleReadMore = () => {
        this.setState(prevState => ({
            collapsed: !prevState.collapsed,
        }));
    };

    render() {
        const shortAbstract = this.state.abstract.substr(0, 550);
        const showReadMore = this.state.abstract !== shortAbstract;

        return (
            <div>
                <h2 className="h5 mt-2 float-start">Abstract from DBpedia</h2>
                <a href={this.props.externalResource} target="_blank" rel="noopener noreferrer">
                    <Image alt="DBpedia logo" src={DBPEDIA_LOGO} style={{ height: 40, float: 'right' }} />
                </a>
                <div className="clearfix" />

                <div style={{ fontSize: '90%' }}>
                    {this.state.isLoading && !this.state.loadingFailed && (
                        <div className="text-center">
                            <Icon icon={faSpinner} spin /> Loading abstract from DBpedia...
                        </div>
                    )}
                    {!this.state.isLoading && this.state.loadingFailed && <div className="text-primary">Failed loading abstract from DBpedia.</div>}
                    {!this.state.isLoading && !this.state.loadingFailed && (
                        <>
                            {this.state.collapsed && this.state.abstract.length > 550 ? `${shortAbstract}...` : this.state.abstract}
                            {showReadMore && (
                                <Button color="link" className="p-0" style={{ fontSize: 'inherit' }} onClick={this.handleReadMore}>
                                    {this.state.collapsed ? 'Read more' : 'Read less'}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }
}

DbpediaAbstract.propTypes = {
    externalResource: PropTypes.string.isRequired,
};

export default DbpediaAbstract;

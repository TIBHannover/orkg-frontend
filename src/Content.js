import React, {Component} from 'react';
import ContentItem from './ContentItem';

class Content extends Component {

    constructor(props) {
        super(props);

        this.isLoading = true;
        this.state = {
        }
        this.setState = this.setState.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.results || nextProps.error) {
            this.isLoading = false;
        }
    }

    render() {
        if (this.isLoading) {
            return (<p>Loading...</p>);
        }

        if (this.props.error) {
            return (<p><strong>Error:</strong> {this.props.error} </p>);
        }

        const content = this.props.results.bindings.map(
                (binding, index) => <ContentItem key={index} binding={binding} editable={false} onChange={this.props.onChange}/>
        );

        return (
            <ol>
                {content}
            </ol>
        );
    }
}

export default Content;
import { Component } from 'react';
import PropTypes from 'prop-types';
import DbpediaAbstract from 'components/ExternalDescription/DbpediaAbstract';
import WikidataDescription from 'components/ExternalDescription/WikidataDescription';
import WikipediaSummary from 'components/ExternalDescription/WikipediaSummary';

class ExternalDescription extends Component {
    constructor(props) {
        super(props);

        this.expressionDbPedia = new RegExp(/^(https?:)?\/\/dbpedia\.org(\/resource(\?.*)?)\//);
        this.expressionWikiData = new RegExp(/^(https?:)?\/\/(www\.)?wikidata\.org(\/entity(\?.*)?)\//);
        this.expressionWikipedia = new RegExp(/^(https?:)?\/\/[a-zA-Z.0-9]{0,3}\.wikipedia\.org\/wiki\/([\w%]+)/g);
    }

    render() {
        if (this.props.query.match(this.expressionDbPedia)) {
            return <DbpediaAbstract externalResource={this.props.query} />;
        }
        if (this.props.query.match(this.expressionWikiData)) {
            return <WikidataDescription externalResource={this.props.query} />;
        }
        if (this.props.query.match(this.expressionWikipedia)) {
            return <WikipediaSummary externalResource={this.props.query} />;
        }
        return null;
    }
}

ExternalDescription.propTypes = {
    query: PropTypes.string.isRequired,
};

export default ExternalDescription;

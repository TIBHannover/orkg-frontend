import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ContributorsComponent from 'components/Contributors/Contributors';

const Contributors = ({ isEmbedded = false }) => {
    const contributors = useSelector(state => state.list.contributors);
    return <ContributorsComponent isEmbedded={isEmbedded} contributors={contributors} />;
};

Contributors.propTypes = {
    isEmbedded: PropTypes.bool,
};

export default Contributors;

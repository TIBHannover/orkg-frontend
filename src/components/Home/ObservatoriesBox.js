import ObservatoriesCarousel from 'components/ObservatoriesCarousel/ObservatoriesCarousel';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import useResearchFieldObservatories from 'components/ResearchField/hooks/useResearchFieldObservatories';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const ObservatoriesBox = ({ researchFieldId }) => {
    const [observatories, isLoading] = useResearchFieldObservatories({ researchFieldId });

    return (
        <div className="box rounded-3" style={{ overflow: 'hidden' }}>
            <h2
                className="h5"
                style={{
                    marginBottom: 0,
                    padding: '15px'
                }}
            >
                <Tippy content="Observatories organize research contributions in a particular research field and are curated by research organizations active in the respective field.">
                    <span>Observatories</span>
                </Tippy>
                <Link to={ROUTES.OBSERVATORIES}>
                    <span style={{ fontSize: '0.9rem', float: 'right', marginTop: 2, marginBottom: 15 }}>More observatories</span>
                </Link>
            </h2>
            <hr className="mx-3 mt-0" />
            <ObservatoriesCarousel observatories={observatories} isLoading={isLoading} />
        </div>
    );
};

ObservatoriesBox.propTypes = {
    researchFieldId: PropTypes.string.isRequired
};

export default ObservatoriesBox;

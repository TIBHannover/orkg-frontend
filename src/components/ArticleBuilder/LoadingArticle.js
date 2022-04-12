import { times } from 'lodash';
import { Fragment } from 'react';
import ContentLoader from 'react-content-loader';
import { Container } from 'reactstrap';

const LoadingArticle = () => (
    <Container className="p-0">
        <div className="box rounded px-5 pt-5 pb-5">
            <ContentLoader width="100%" speed={2} foregroundColor="#f3f3f3" backgroundColor="#ccc" viewBox="0 0 100 40">
                {/* title */}
                <rect x="0" y="0" rx="0" ry="0" width="100" height="5" />
                {/* authors */}
                <rect x="0" y="6" rx="0" ry="0" width="15" height="3" />
                <rect x="16" y="6" rx="0" ry="0" width="15" height="3" />
                <rect x="32" y="6" rx="0" ry="0" width="15" height="3" />
                <rect x="32" y="6" rx="0" ry="0" width="15" height="3" />
                {/* 2 sections */}
                {times(2, i => (
                    <Fragment key={i}>
                        <rect x="0" y={13 + i * 17} rx="0" ry="0" width="100" height="4" />
                        <rect x="0" y={18 + i * 17} rx="0" ry="0" width="30" height="1" />
                        <rect x="0" y={20 + i * 17} rx="0" ry="0" width="45" height="1" />
                        <rect x="0" y={22 + i * 17} rx="0" ry="0" width="35" height="1" />
                        <rect x="0" y={24 + i * 17} rx="0" ry="0" width="45" height="1" />
                    </Fragment>
                ))}
            </ContentLoader>
        </div>
    </Container>
);

export default LoadingArticle;

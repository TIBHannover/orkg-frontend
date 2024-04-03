import ContentLoader from 'react-content-loader';

const PageContentLoader = () => (
    <ContentLoader
        speed={2}
        width="100%"
        height={220}
        viewBox="0 0 1000 200"
        style={{ width: '100% !important' }}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
    >
        <rect x="0" y="0" rx="3" ry="3" width="100%" height="35" />
        <rect x="0" y="40" rx="3" ry="3" width="65%" height="55" />
        <rect x="0" y="100" rx="3" ry="3" width="45%" height="55" />
        <rect x="0" y="160" rx="3" ry="3" width="55%" height="55" />
    </ContentLoader>
);

export default PageContentLoader;

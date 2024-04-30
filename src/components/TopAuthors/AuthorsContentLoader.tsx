import ContentLoader from 'components/ContentLoader/ContentLoader';

const AuthorsContentLoader = () => (
    <div className="mt-4 mb-4">
        <ContentLoader height={130} width={200} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
            <rect x="30" y="5" rx="3" ry="3" width="150" height="6" />
            <rect x="30" y="15" rx="3" ry="3" width="100" height="5" />
            <rect x="30" y="35" rx="3" ry="3" width="150" height="6" />
            <rect x="30" y="45" rx="3" ry="3" width="150" height="5" />
            <rect x="30" y="65" rx="3" ry="3" width="100" height="6" />
            <rect x="30" y="75" rx="3" ry="3" width="150" height="5" />
            <rect x="14" y="0" rx="3" ry="3" width="3" height="100" />
        </ContentLoader>
    </div>
);

export default AuthorsContentLoader;

import { FC, useId } from 'react';
import ReactContentLoader, { IContentLoaderProps } from 'react-content-loader';

const ContentLoader: FC<IContentLoaderProps> = ({ children, ...props }) => {
    const id = useId();
    return (
        <ReactContentLoader backgroundColor="#f3f3f3" foregroundColor="#ecebeb" uniqueKey={id} {...props}>
            {children}
        </ReactContentLoader>
    );
};

export default ContentLoader;

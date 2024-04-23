/* eslint-disable react/prop-types */
/* eslint-disable prefer-arrow-callback */

import LinkNextJs from 'next/link';
import { forwardRef } from 'react';
// import { Link as LinkReactRouter } from 'react-router-dom';

// CRA-CODE
// const Link = forwardRef(function Link({ href, children, ...props }, ref) {
//     return (
//         <LinkReactRouter ref={ref} to={href} {...props}>
//             {children}
//         </LinkReactRouter>
//     );
// });
// export default Link;

// NEXT-CODE
const Link = forwardRef(function Link({ href, children, ...props }, ref) {
    return (
        <LinkNextJs ref={ref} href={href} {...props}>
            {children}
        </LinkNextJs>
    );
});

export default Link;

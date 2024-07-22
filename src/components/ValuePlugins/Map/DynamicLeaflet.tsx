import dynamic from 'next/dynamic';

// because react-leaflet does'nt support rendering on the server and when reloading page shows "window is not defined"
// https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading#with-no-ssr
const DynamicMap = dynamic(() => import('components/ValuePlugins/Map/Leaflet'), {
    ssr: false,
});

export default DynamicMap;

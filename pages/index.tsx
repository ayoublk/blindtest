import dynamic from 'next/dynamic';

const YouTube = dynamic(() => import('react-youtube'), { ssr: false });

const BlindTestApp = dynamic(() => import('../components/BlindTestApp'), { ssr: false });

export default BlindTestApp;
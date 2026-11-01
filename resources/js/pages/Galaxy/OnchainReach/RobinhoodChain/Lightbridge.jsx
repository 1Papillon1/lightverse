// resources/js/pages/Galaxy/OnchainReach/RobinhoodChain/Snair.jsx
import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';

const Lightbridge = () => {
   
     return (
        <>
          <Head><title>Lightbridge</title></Head>
          <UniverseBackdrop />
          
        </>
     );
};

Lightbridge.layout = page => <MainLayout children={page} />;

export default Lightbridge;
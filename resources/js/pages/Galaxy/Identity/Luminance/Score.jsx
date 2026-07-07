// resources/js/pages/Galaxy/Identity/Luminance/Score.jsx
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import arrowBackIcon from '@/assets/icons/arrow_back.svg';
import arrowForwardIcon from '@/assets/icons/arrow_forward.svg';
import ComingSoon from '@/components/information/ComingSoon';

const Score = () => {

    return (
        <>
            <Head>
                <title>Luminance - Score</title>
                <meta name="description" content="View your Luminance Score, a dynamic representation of your reputation and contributions in the Lightverse." />
            </Head>
            <UniverseBackdrop />
            <ComingSoon />
        </>
    );

};

Score.layout = page => <MainLayout>{page}</MainLayout>;

export default Score;
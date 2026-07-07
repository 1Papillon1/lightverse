// resources/js/pages/Galaxy/Identity/Milestones/Badges.jsx
import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import MainLayout from '@/MainLayout';
import UniverseBackdrop from '@/components/visuals/UniverseBackdrop';
import arrowBackIcon from '@/assets/icons/arrow_back.svg';
import arrowForwardIcon from '@/assets/icons/arrow_forward.svg';
import ComingSoon from '@/components/information/ComingSoon';

const Badges = () => {

    return (
        <>
            <Head>
                <title>Milestones - Badges</title>
                <meta name="description" content="Discover the badges you've earned in the Lightverse, showcasing your milestones and achievements in your cosmic journey." />
            </Head>
            <UniverseBackdrop />
            <ComingSoon />
        </>
    );

};

Badges.layout = page => <MainLayout>{page}</MainLayout>;

export default Badges;
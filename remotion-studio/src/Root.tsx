import React from 'react';
import {Composition} from 'remotion';
import {AmberScene} from './AmberScene';
import {Film, FILM_FRAMES} from './v01/Film';
import {ThumbA, ThumbB} from './v01/Thumb';
import {IQ_A, IQ_B, H1280_C, NEA_A, NEA_B, NEA_C, NEA_D, NEA_E, NEA_F, WOKE_N_A, DAYS30_A, BACK_A, HALF_A, AFRICA_A} from './thumbs/IfStyle';
import {Film07, FILM07_FRAMES} from './v07/Film';
import {Woke50k, IceAges} from './thumbs/Triptych';
import {B_LAST, B_50K, B_30D, B_BACK, B_HALF, B_AFRICA, B_ICE} from './thumbs/Bright';
import {Film04, FILM04_FRAMES} from './v04/Film';
import {Film09, FILM09_FRAMES} from './v09/Film';
import {Film10, FILM10_FRAMES} from './v10/Film';
import {Film11, FILM11_FRAMES} from './v11/Film';
import {Film12, FILM12_FRAMES} from './v12/Film';
import {Film13, FILM13_FRAMES} from './v13/Film';
import {Film14, FILM14_FRAMES} from './v14/Film';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AmberTest" component={AmberScene} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="V01-1280" component={Film} durationInFrames={FILM_FRAMES} fps={24} width={1080} height={1920} />
    <Composition id="V01-ThumbA" component={ThumbA} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="V01-ThumbB" component={ThumbB} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-IQ-A" component={IQ_A} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-IQ-B" component={IQ_B} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-1280-C" component={H1280_C} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="V07-Neanderthal" component={Film07} durationInFrames={FILM07_FRAMES} fps={24} width={1920} height={1080} />
    <Composition id="V04-Woke50K" component={Film04} durationInFrames={FILM04_FRAMES} fps={24} width={1920} height={1080} />
    <Composition id="V09-WokeNeander" component={Film09} durationInFrames={FILM09_FRAMES} fps={24} width={1920} height={1080} />
    <Composition id="V10-30Days" component={Film10} durationInFrames={FILM10_FRAMES} fps={24} width={1920} height={1080} />
    <Composition id="V11-BroughtBack" component={Film11} durationInFrames={FILM11_FRAMES} fps={24} width={1920} height={1080} />
    <Composition id="V12-Half" component={Film12} durationInFrames={FILM12_FRAMES} fps={24} width={1920} height={1080} />
    <Composition id="V13-Africa" component={Film13} durationInFrames={FILM13_FRAMES} fps={24} width={1920} height={1080} />
    <Composition id="V14-IceAges" component={Film14} durationInFrames={FILM14_FRAMES} fps={24} width={1920} height={1080} />
    <Composition id="T-NEA-A" component={NEA_A} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-B" component={NEA_B} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-C" component={NEA_C} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-D" component={NEA_D} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-F" component={NEA_F} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-WOKE-A" component={WOKE_N_A} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-30D-A" component={DAYS30_A} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-BACK-A" component={BACK_A} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-HALF-A" component={HALF_A} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-AFRICA-A" component={AFRICA_A} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-ICE-A" component={IceAges} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-E" component={NEA_E} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-50K" component={Woke50k} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="TB-LAST" component={B_LAST} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="TB-50K" component={B_50K} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="TB-30D" component={B_30D} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="TB-BACK" component={B_BACK} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="TB-HALF" component={B_HALF} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="TB-AFRICA" component={B_AFRICA} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="TB-ICE" component={B_ICE} durationInFrames={1} fps={24} width={1280} height={720} />
  </>
);

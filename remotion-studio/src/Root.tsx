import React from 'react';
import {Composition} from 'remotion';
import {AmberScene} from './AmberScene';
import {Film, FILM_FRAMES} from './v01/Film';
import {ThumbA, ThumbB} from './v01/Thumb';
import {IQ_A, IQ_B, H1280_C, NEA_A, NEA_B, NEA_C, NEA_D, NEA_E, NEA_F} from './thumbs/IfStyle';
import {Film07, FILM07_FRAMES} from './v07/Film';
import {Woke50k} from './thumbs/Triptych';
import {Film04, FILM04_FRAMES} from './v04/Film';

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
    <Composition id="T-NEA-A" component={NEA_A} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-B" component={NEA_B} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-C" component={NEA_C} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-D" component={NEA_D} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-F" component={NEA_F} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-NEA-E" component={NEA_E} durationInFrames={1} fps={24} width={1280} height={720} />
    <Composition id="T-50K" component={Woke50k} durationInFrames={1} fps={24} width={1280} height={720} />
  </>
);

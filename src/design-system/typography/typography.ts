/* eslint-disable sort-keys-fix/sort-keys-fix */
import { precomputeValues } from '@capsizecss/core';
import { mapValues, pick } from 'lodash';
import { PixelRatio } from 'react-native';
import { fontWeights } from './fontWeights';
import { typeHierarchy } from './typeHierarchy';

const capsize = (options: Parameters<typeof precomputeValues>[0]) => {
  const values = precomputeValues(options);
  const fontSize = parseFloat(values.fontSize);
  const baselineTrimEm = parseFloat(values.baselineTrim);
  const capHeightTrimEm = parseFloat(values.capHeightTrim);
  const fontScale = PixelRatio.getFontScale();

  return {
    fontSize,
    lineHeight:
      values.lineHeight !== 'normal'
        ? parseFloat(values.lineHeight)
        : undefined,
    marginBottom: PixelRatio.roundToNearestPixel(
      baselineTrimEm * fontSize * fontScale
    ),
    marginTop: PixelRatio.roundToNearestPixel(
      capHeightTrimEm * fontSize * fontScale
    ),
  } as const;
};

export const fonts = {
  SFProRounded: {
    regular: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Regular',
      fontWeight: ios ? fontWeights.regular : 'normal',
    },
    medium: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Medium',
      fontWeight: ios ? fontWeights.medium : 'normal',
    },
    semibold: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Semibold',
      fontWeight: ios ? fontWeights.semibold : 'normal',
    },
    bold: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Bold',
      fontWeight: ios ? fontWeights.bold : 'normal',
    },
    heavy: {
      fontFamily: ios ? 'SF Pro Rounded' : 'SF-Pro-Rounded-Heavy',
      fontWeight: ios ? fontWeights.heavy : 'normal',
    },
  },

  SFMono: {
    regular: {
      fontFamily: ios ? 'SF Mono' : 'SFMono-Regular',
      fontWeight: ios ? fontWeights.regular : 'normal',
    },
    medium: {
      fontFamily: ios ? 'SF Mono' : 'SFMono-Medium',
      fontWeight: ios ? fontWeights.medium : 'normal',
    },
  },
} as const;

export const headingWeights = pick(fonts.SFProRounded, ['heavy', 'bold']);
export const textWeights = fonts.SFProRounded;

// Sourced from https://seek-oss.github.io/capsize
const fontMetrics = {
  capHeight: 1443,
  ascent: 1950,
  descent: -494,
  lineGap: 0,
  unitsPerEm: 2048,
} as const;

const marginCorrectionForFontSize = {
  23: ios ? -0.3 : -0.3,
  20: ios ? -0.5 : -0.2,
  18: ios ? 0.4 : 0.2,
  16: ios ? -0.5 : 2.4,
  14: ios ? -0.3 : -0.1,
} as const;

const createTextSize = ({
  fontSize,
  lineHeight: leading,
  letterSpacing,
}: {
  fontSize: keyof typeof marginCorrectionForFontSize;
  lineHeight: number;
  letterSpacing: number;
}) => {
  const styles = {
    letterSpacing,
    ...capsize({
      fontMetrics,
      fontSize,
      leading,
    }),
  } as const;

  const marginCorrection =
    fontSize in marginCorrectionForFontSize
      ? marginCorrectionForFontSize[fontSize]
      : 0;

  return {
    ...styles,
    marginTop: PixelRatio.roundToNearestPixel(
      styles.marginTop + marginCorrection
    ),
    marginBottom: PixelRatio.roundToNearestPixel(
      styles.marginBottom - marginCorrection
    ),
  };
};

export const headingSizes = mapValues(typeHierarchy.heading, createTextSize);
export const textSizes = mapValues(typeHierarchy.text, createTextSize);
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function Logo(props: any) {
  return (
    <Svg
      width={200}
      height={200}
      viewBox="0 0 200 200"
      fill="none"
      {...props}
    >
      <Path
        d="M100 0C44.772 0 0 44.772 0 100s44.772 100 100 100 100-44.772 100-100S155.228 0 100 0zm0 180c-44.183 0-80-35.817-80-80s35.817-80 80-80 80 35.817 80 80-35.817 80-80 80z"
        fill="#00843D"
      />
      <Path
        d="M100 40c-33.137 0-60 26.863-60 60s26.863 60 60 60 60-26.863 60-60-26.863-60-60-60zm0 100c-22.091 0-40-17.909-40-40s17.909-40 40-40 40 17.909 40 40-17.909 40-40 40z"
        fill="#00843D"
      />
    </Svg>
  );
}
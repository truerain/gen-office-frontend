import type { Preview } from '@storybook/react';
import { ThemeProvider } from '@gen-office/theme';
import '../../../packages/theme/src/styles/global.css';
import React from 'react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FFFFFF',
        },
        {
          name: 'dark',
          value: '#1A1A1A',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider 
        defaultMode="light"
        useLGFont={false}  // LG Smart 폰트를 사용하려면 true로 변경
      >
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
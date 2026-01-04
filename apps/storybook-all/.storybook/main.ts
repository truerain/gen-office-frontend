import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // 모든 packages 하위의 src 폴더에서 .stories 파일을 찾습니다.
  stories: [
    "../../../packages/*/src/**/*.mdx",
    "../../../packages/*/src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    return {
      ...config,
      // 모노레포에서 발생할 수 있는 의존성 최적화 이슈 방지
      optimizeDeps: {
        include: ["@gen-office/design-tokens", "@gen-office/theme", "@gen-office/primitive"],
      },
    };
  },
  staticDirs: [
    // theme 패키지의 폰트 폴더를 스토리북의 '/' 경로로 매핑
    { from: "../../../packages/theme/public/fonts", to: "/fonts" }
  ],  
};
export default config;
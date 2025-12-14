import { mergeConfig, type UserConfig } from "vite";

export default (config: UserConfig) => {
  return mergeConfig(config, {
    server: {
      allowedHosts: ["unrepulsing-tristen-exoterically.ngrok-free.dev"],
    },
  });
};

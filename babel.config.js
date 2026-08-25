module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // NOTE: Do NOT add react-native-reanimated/plugin here.
    // Reanimated 4.x is automatically included by babel-preset-expo.
    // Adding it explicitly causes double-processing and crashes.
    plugins: [],
  };
};


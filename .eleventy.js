import eleventyLucideicons from "@grimlink/eleventy-plugin-lucide-icons";

export default async function(eleventyConfig) {
  eleventyConfig.setInputDirectory("./docs");
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addPassthroughCopy({"./dist/basecoat.css": "./assets/styles.css"});
  eleventyConfig.addPlugin(eleventyLucideicons);
  // Registry to ensure component assets (JS) load only once per page.
  let componentRegistry = {}
  eleventyConfig.on('beforeBuild', () => { componentRegistry = {}; })
  eleventyConfig.addNunjucksGlobal("registerComponent", function(componentName) {
    if (!componentRegistry[componentName]) {
      componentRegistry[componentName] = true;
      return true;
    }
    return false;
  });
}
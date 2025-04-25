import eleventyLucideicons from "@grimlink/eleventy-plugin-lucide-icons";
import prettier from "prettier";

export default async function(eleventyConfig) {
  eleventyConfig.setInputDirectory("./docs");
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");
  eleventyConfig.addPassthroughCopy({"./dist/basecoat.css": "./assets/styles.css"});
  eleventyConfig.addPlugin(eleventyLucideicons);
  eleventyConfig.addNunjucksAsyncFilter("prettyHtml", async (code, callback) => {
    try {
      const formattedCode = await prettier.format(code, {
        parser: "html",
        printWidth: 1000,
        singleAttributePerLine: false,
        bracketSameLine: true,
        htmlWhitespaceSensitivity: "ignore"
      });
      callback(null, formattedCode);
    } catch (err) {
      console.error("Error formatting HTML with Prettier:", err);
      callback(err, code);
    }
  });
  // Registry to ensure component assets (JS) load only once per page.
  let componentRegistry;
  eleventyConfig.on('beforeBuild', () => { componentRegistry = {}; });
  eleventyConfig.addNunjucksGlobal("registerComponent", function(componentName) {
    // Reset registry at the start of each page build
    if (!this.page) {
      componentRegistry = {};
    }
    
    if (!componentRegistry[componentName]) {
      componentRegistry[componentName] = true;
      return true;
    }
    return false;
  });
}
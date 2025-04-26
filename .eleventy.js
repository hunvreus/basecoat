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
}
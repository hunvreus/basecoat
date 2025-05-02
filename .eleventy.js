import eleventyLucideicons from "@grimlink/eleventy-plugin-lucide-icons";
import prettier from "prettier";
import Nunjucks from "nunjucks";
import fs from "fs";
import path from "path";

export default async function(eleventyConfig) {
  eleventyConfig.setInputDirectory("./docs/src");
  eleventyConfig.addPassthroughCopy({"docs/src/assets": "assets"});
  eleventyConfig.addPassthroughCopy({ "src/js": "assets/js" });
  eleventyConfig.addPlugin(eleventyLucideicons);
  eleventyConfig.addShortcode("fetchCode", function(filePath) {
    const absolutePath = path.resolve(process.cwd(), filePath);
    try {
      return fs.readFileSync(absolutePath, 'utf8');
    } catch (error) {
      console.error(`[Eleventy FetchCode Error] Failed to read: ${absolutePath}`, error);
      return `<!-- Error fetching code for ${filePath} -->`;
    }
  });

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
  let nunjucksEnvironment = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader([
      "src/nunjucks",
      "docs/src/_includes"
    ]),
    { autoescape: true }
  );
  eleventyConfig.setLibrary("njk", nunjucksEnvironment); 
}
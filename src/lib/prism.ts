import Prism from "prismjs";
import "prismjs/components/prism-markdown";

const markdownLang = Prism.languages.markdown as any;
Prism.languages.mdlike = {
    title: markdownLang.title,
    "url-reference": markdownLang["url-reference"],
    bold: markdownLang.bold,
    italic: markdownLang.italic,
    strike: markdownLang.strike,
    "code-snippet": markdownLang["code-snippet"],
    url: markdownLang.url,
    spoiler: {
        pattern: /(\|\|)(?:([^|]|\|[^|])+)(\|\|)/,
        greedy: true,
        inside: {
            content: {
                pattern: /([^|]|\|[^|])+/,
                lookbehind: true,
                inside: {},
            },
            punctuation: /\|\|/,
        },
    },
};

["url", "bold", "italic", "strike", "spoiler"].forEach(function (token) {
    ["url", "bold", "italic", "strike", "spoiler", "code-snippet"].forEach(
        function (inside) {
            if (token !== inside) {
                (Prism.languages.mdlike as any)[token].inside.content.inside[
                    inside
                ] = (Prism.languages.mdlike as any)[inside];
            }
        }
    );
});

export default Prism;

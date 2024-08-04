"use client"

import { type RenderLeafProps } from "slate-react";
import { Text, type NodeEntry, type BaseRange, type Path } from "slate";

import Prism from "@/lib/prism";

type Token = string | Prism.Token;

import { cn } from "@/lib/utils";

export function tokenizeMarkdownPreview(
    ranges: BaseRange[],
    tokens: Token[],
    path: Path,
    start = 0
) {
    for (const token of tokens) {
        const end = start + token.length;
        if (typeof token !== "string") {
            if (token.content.length) {
                tokenizeMarkdownPreview(
                    ranges,
                    token.content as Token[],
                    path,
                    start
                );
            }

            if (token.type === "title") {
                const content = (token.content as string[]).find(
                    (t) => typeof t === "string"
                );
                if (content) {
                    const tokenContent = Prism.tokenize(
                        content,
                        Prism.languages.mdlike
                    );
                    tokenizeMarkdownPreview(
                        ranges,
                        tokenContent,
                        path,
                        token.length - content.length
                    );
                }

                const punctuation = (token.content as Prism.Token[]).find(
                    (t) => t.type === "punctuation"
                );
                const level = punctuation?.content.length ?? 1;

                ranges.push({
                    [token.type]: true,
                    level: level <= 6 ? level : 6,
                    anchor: { path, offset: start },
                    focus: { path, offset: end },
                } as BaseRange);
            } else {
                let type = token.type;
                if (token.type === "bold") {
                    const punctuation = (token.content as Prism.Token[]).find(
                        (t) => t.type === "punctuation"
                    );
                    if (punctuation?.content === "__") type = "underline";
                }

                ranges.push({
                    [type]: true,
                    anchor: { path, offset: start },
                    focus: { path, offset: end },
                });
            }
        }

        start = end;
    }
}

export function decorateMarkdownPreview([node, path]: NodeEntry): BaseRange[] {
    const ranges: BaseRange[] = [];
    if (!Text.isText(node)) return ranges;

    const tokens = Prism.tokenize(node.text, Prism.languages.mdlike);
    tokenizeMarkdownPreview(ranges, tokens, path);

    return ranges;
}

export function withMarkdownPreviewLeaf<Props extends RenderLeafProps>(
    WrappedComponent: React.ComponentType<Props>
) {
    function ComponentWithMarkdownPreview(props: Props) {
        const { leaf, attributes, children } = props;
        const TitleComponentLevel = `h${leaf.level ?? 1}` as const;
        const className = leaf.punctuation
            ? cn(
                  "text-zinc-700 inline-block",
                  leaf.title && "m-0 inline-block font-semibold"
              )
            : cn(
                  leaf.bold && "font-bold",
                  leaf.italic && "italic",
                  leaf.strike && "line-through",
                  leaf.underline && "underline",
                  leaf["code-snippet"] && "rounded-sm bg-zinc-800",
                  leaf.url && "text-blue-500",
                  leaf.title && "m-0 inline-block font-semibold",
                  leaf.spoiler && "rounded-sm bg-zinc-800 px-1.5 py-0.5"
              );

        if (
            leaf.bold ||
            leaf.italic ||
            leaf.strike ||
            leaf.underline ||
            leaf["code-snippet"] ||
            leaf.url ||
            leaf.punctuation ||
            leaf.title ||
            leaf.spoiler
        ) {
            const Comp = leaf.title ? TitleComponentLevel : "span";
            return (
                <Comp {...attributes} className={className}>
                    {children}
                </Comp>
            );
        }

        return <WrappedComponent {...props} />;
    }

    return ComponentWithMarkdownPreview;
}

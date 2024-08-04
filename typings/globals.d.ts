// TypeScript users only add this code
import { BaseEditor, Descendant } from "slate";
import { ReactEditor } from "slate-react";

type CustomElement = { type: string; children: CustomText[] };
type CustomText = {
    text: string;
    title?: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    punctuation?: boolean;
    "code-snippet"?: boolean;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    url?: boolean;
    spoiler?: boolean;
};

declare module "slate" {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

"use client"

import { useMemo, useCallback } from "react";
import { createEditor, type Descendant } from "slate"
import {
    Slate,
    Editable,
    withReact,
    type RenderLeafProps,
    type RenderElementProps,
    type RenderPlaceholderProps,
} from "slate-react";
import { withHistory } from "slate-history";

const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [{ text: "" }],
    },
];

export default function TextEditor() {
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    const renderLeaf = useCallback((props: RenderLeafProps) => {
        return <RenderLeafComponent {...props} />;
    }, []);

    const renderElement = useCallback((props: RenderElementProps) => {
        return <RenderElementComponent {...props} />;
    }, []);

    const renderPlaceholder = useCallback((props: RenderPlaceholderProps) => {
        return <RenderPlaceholderComponent {...props} />;
    }, []);

    return (
        <Slate editor={editor} initialValue={initialValue}>
            <Editable
                className="prose prose-invert h-[138px] max-w-full overflow-y-auto rounded-md border border-zinc-100/10 px-4 py-2 text-sm"
                placeholder="What's on your mind?"
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                renderPlaceholder={renderPlaceholder}
            />
        </Slate>
    )
}

function RenderElementComponent({ attributes, children }: RenderElementProps) {
    return <div {...attributes}>{children}</div>
}

function RenderLeafComponent({ attributes, children }: RenderLeafProps) {
    return <span {...attributes}>{children}</span>
}

function RenderPlaceholderComponent({ attributes, children }: RenderPlaceholderProps) {
    return (
        <div className="relative">
            <div {...attributes}>{children}</div>
        </div>
    );
}

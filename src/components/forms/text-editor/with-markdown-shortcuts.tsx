"use client";

import {
    Element as SlateElement,
    Node as SlateNode,
    Point,
    Range,
    Transforms,
    Editor,
    type Descendant,
} from "slate";
import { ReactEditor, type RenderElementProps } from "slate-react";

export const ShortcutsEntries = [
    {
        type: "list",
        keys: ["*", "-", "+"],
    },
    {
        type: "blockquote",
        keys: [">"],
    },
];

export function withMarkdownShortcuts(editor: Editor) {
    const { deleteBackward, insertText } = editor;

    editor.insertText = (text) => {
        const { selection } = editor;
        if (text.endsWith(" ") && selection && Range.isCollapsed(selection)) {
            const { anchor } = selection;
            const block = Editor.above(editor, {
                match: (node) =>
                    SlateElement.isElement(node) &&
                    Editor.isBlock(editor, node),
            });

            const path = block ? block[1] : [];
            const start = Editor.start(editor, path);
            const range = { anchor, focus: start };
            const beforeText = Editor.string(editor, range) + text.slice(0, -1);
            const shortcutsEntry = ShortcutsEntries.find((entry) =>
                entry.keys.includes(beforeText)
            );

            if (shortcutsEntry) {
                Transforms.select(editor, range);
                if (!Range.isCollapsed(range)) {
                    Transforms.delete(editor);
                }

                const newNode: Partial<SlateElement> = {
                    type: shortcutsEntry.type,
                    key: beforeText,
                };

                Transforms.setNodes<SlateElement>(editor, newNode, {
                    match: (node) =>
                        SlateElement.isElement(node) &&
                        Editor.isBlock(editor, node),
                });

                if (shortcutsEntry.type === "list") {
                    const listNode = {
                        type: "bulleted-list",
                        children: [],
                        key: beforeText,
                    };

                    Transforms.wrapNodes(editor, listNode, {
                        match: (n) =>
                            !Editor.isEditor(n) &&
                            SlateElement.isElement(n) &&
                            n.type === "list",
                    });
                }

                return;
            }
        }

        return insertText(text);
    };

    editor.deleteBackward = (...args) => {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
            const match = Editor.above(editor, {
                match: (node) =>
                    SlateElement.isElement(node) &&
                    Editor.isBlock(editor, node),
            });

            if (match) {
                const [block, path] = match;
                const start = Editor.start(editor, path);

                if (
                    !Editor.isEditor(block) &&
                    SlateElement.isElement(block) &&
                    block.type !== "paragraph" &&
                    Point.equals(selection.anchor, start)
                ) {
                    const newNode: Partial<SlateElement> = {
                        type: "paragraph",
                    };
                    Transforms.setNodes(editor, newNode);

                    if (block.type === "list") {
                        Transforms.unwrapNodes(editor, {
                            match: (n) =>
                                !Editor.isEditor(n) &&
                                SlateElement.isElement(n) &&
                                n.type === "bulleted-list",
                            split: true,
                        });
                    }

                    return;
                }
            }

            return deleteBackward(...args);
        }
    };

    return editor;
}

export function withMarkdownShortcutsElement<Props extends RenderElementProps>(
    WrappedComponent: React.ComponentType<Props>
) {
    function ComponentWithMarkdownShortcuts(props: Props) {
        const { element, attributes, children } = props;
        if (element.type === "blockquote") {
            return (
                <blockquote
                    {...attributes}
                    className="m-0 font-normal not-italic"
                >
                    {children}
                </blockquote>
            );
        }

        if (element.type === "bulleted-list") {
            return (
                <ul {...attributes} className="m-0">
                    {children}
                </ul>
            );
        }

        if (element.type === "list") {
            return (
                <li {...attributes} className="m-0">
                    {children}
                </li>
            );
        }

        return <WrappedComponent {...props} />;
    }

    return ComponentWithMarkdownShortcuts;
}

export function onDOMBeforeInput(editor: Editor) {
    queueMicrotask(() => {
        const pendingDiffs = ReactEditor.androidPendingDiffs(editor);
        const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
            if (!diff.text.endsWith(" ")) {
                return false;
            }

            const { text } = SlateNode.leaf(editor, path);
            const beforeText =
                text.slice(0, diff.start) + diff.text.slice(0, -1);
            const shortcutsEntry = ShortcutsEntries.find((entry) =>
                entry.keys.includes(beforeText)
            );

            if (!shortcutsEntry) return;

            const blockEntry = Editor.above(editor, {
                at: path,
                match: (n) =>
                    SlateElement.isElement(n) && Editor.isBlock(editor, n),
            });
            if (!blockEntry) {
                return false;
            }

            const [, blockPath] = blockEntry;
            return Editor.isStart(
                editor,
                Editor.start(editor, path),
                blockPath
            );
        });

        if (scheduleFlush) {
            ReactEditor.androidScheduleFlush(editor);
        }
    });
}

export function stringifyMSElement(node: Descendant, text: string) {
    if (!SlateElement.isElement(node)) return text;

    const shortcutsEntry = ShortcutsEntries.find((entry) => {
        const type = node.type === "bulleted-list" ? "list" : node.type;
        return entry.type === type && entry.keys.includes(node.key!);
    });

    return shortcutsEntry ? `${node.key} ${text}` : text;
}

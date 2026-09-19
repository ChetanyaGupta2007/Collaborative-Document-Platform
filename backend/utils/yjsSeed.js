const Y = require("yjs");
const { getSchema } = require("@tiptap/core");
const StarterKit = require("@tiptap/starter-kit");
const { prosemirrorJSONToYDoc } = require("@tiptap/y-tiptap");

function seedYDocFromTipTap(targetYDoc, content) {
    if (content == null) {
        return;
    }

    // Guard against legacy/non-ProseMirror content (e.g. a raw string
    // saved by an older create-document flow) instead of letting
    // prosemirrorJSONToYDoc throw and silently kill join_document.
    if (typeof content !== "object" || content.type !== "doc") {
        console.error("seedYDocFromTipTap: content is not valid ProseMirror JSON, skipping seed", content);
        return;
    }

    const schema = getSchema([
        StarterKit,
    ]);
    // Convert restored TipTap JSON into a temporary Y.Doc
    const tempDoc = prosemirrorJSONToYDoc(
        schema,
        content
    );
    // Get the fragments
    const targetFragment = targetYDoc.getXmlFragment("default");
    const tempFragment = tempDoc.getXmlFragment("default");


    // Replace target document content
    targetYDoc.transact(() => {
        targetFragment.delete(
            0,
            targetFragment.length
        );
        const contentInsert = tempFragment
            .toArray()
            .map((item) => item.clone());
        targetFragment.insert(
            0,
            contentInsert
        );
    });

}

module.exports = { seedYDocFromTipTap };
const Y = require("yjs");
const { getSchema } = require("@tiptap/core");
const StarterKitModule = require("@tiptap/starter-kit");
const { prosemirrorJSONToYDoc } = require("@tiptap/y-tiptap");

// @tiptap/starter-kit ships as ESM; depending on how it's built,
// a plain CJS require() can return the extension directly OR the
// module wrapped as { default: <extension> }. Unwrap defensively.
const StarterKit = StarterKitModule.default || StarterKitModule;

function seedYDocFromTipTap(targetYDoc, content) {
    if (content == null) {
        return;
    }

    if (typeof content !== "object" || content.type !== "doc") {
        console.error("seedYDocFromTipTap: content is not valid ProseMirror JSON, skipping seed", content);
        return;
    }

    const schema = getSchema([
        StarterKit,
    ]);

    const tempDoc = prosemirrorJSONToYDoc(
        schema,
        content
    );

    const targetFragment = targetYDoc.getXmlFragment("default");
    const tempFragment = tempDoc.getXmlFragment("default");

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
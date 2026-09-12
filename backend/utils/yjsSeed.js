const Y = require("yjs");
const { getSchema } = require("@tiptap/core");
const StarterKit = require("@tiptap/starter-kit");
const { prosemirrorJSONToYDoc } = require("@tiptap/y-tiptap");

function seedYDocFromTipTap(targetYDoc, content){
    if (content == null){
        return;
    }
    const schema = getSchema([
        StarterKit,
      ]);
      // 8. Convert restored TipTap JSON into a temporary Y.Doc
      const tempDoc = prosemirrorJSONToYDoc(
        schema,
        content
      );
      // 9. Get the fragments
      const targetFragment = targetYDoc.getXmlFragment("default");
      const tempFragment = tempDoc.getXmlFragment("default");
      
      
      // 11. Replace target document content
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
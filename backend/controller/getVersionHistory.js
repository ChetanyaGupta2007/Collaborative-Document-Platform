 async function getVersionHistory (req, res)
  { try { 
    const versions = await DocumentVersion .find({ document: req.params.id }) .select("version createdBy createdAt -content") .sort({ version: -1 }); 
    res.status(200).json(versions); } 
    catch (error) { 
        res.status(500).json({ message: "Failed to fetch version history" }); 
    } };
  
  
  
  module.exports = { getVersionHistory };
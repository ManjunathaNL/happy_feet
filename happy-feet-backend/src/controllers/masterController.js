const getModel = require("../models/Masters");

exports.generateCrud = (modelName) => {
  const Model = getModel[modelName];

  return {
    getAll: async (req, res) => {
      try {
        const data = await Model.find().sort({ createdAt: -1 });
        res.status(200).json({ data });
      } catch (err) { res.status(500).json({ message: err.message }); }
    },

    getById: async (req, res) => {
      try {
        const data = await Model.findById(req.params.id);
        if (!data) return res.status(404).json({ message: "Record not found" });
        res.status(200).json({ data });
      } catch (err) { res.status(500).json({ message: err.message }); }
    },

    create: async (req, res) => {
      try {
        const payload = { ...req.body };
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => { payload[file.fieldname] = `/uploads/${file.filename}`; });
        }
        const data = await Model.create(payload);
        res.status(201).json({ message: "Created successfully", data });
      } catch (err) { res.status(400).json({ message: err.message }); }
    },

    update: async (req, res) => {
      try {
        const payload = { ...req.body };
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => { payload[file.fieldname] = `/uploads/${file.filename}`; });
        }
        const data = await Model.findByIdAndUpdate(req.params.id, payload, { new: true });
        res.status(200).json({ message: "Updated successfully", data });
      } catch (err) { res.status(400).json({ message: err.message }); }
    },

    delete: async (req, res) => {
      try {
        await Model.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
      } catch (err) { res.status(500).json({ message: err.message }); }
    }
  };
};
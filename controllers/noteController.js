const Note = require("../models/Note");
const Dream = require("../models/Dream");
const Action = require("../models/Action");
const Task = require("../models/Task");
const Idea = require("../models/Idea");

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { title, content, linkedType, linkedId, tags, priority, isPinned } =
      req.body;

    // Validate linkedType and linkedId
    if (linkedType !== "standalone") {
      if (!linkedId) {
        return res.status(400).json({
          success: false,
          message: "linkedId is required for linked notes",
        });
      }

      // Verify that the linked resource belongs to the current user
      let linkedResource;
      switch (linkedType) {
        case "dream":
          linkedResource = await Dream.findOne({
            _id: linkedId,
            userId: req.user.id,
          });
          break;
        case "action":
          linkedResource = await Action.findOne({
            _id: linkedId,
            userId: req.user.id,
          });
          break;
        case "task":
          linkedResource = await Task.findOne({
            _id: linkedId,
            userId: req.user.id,
          });
          break;
        case "idea":
          linkedResource = await Idea.findOne({
            _id: linkedId,
            userId: req.user.id,
          });
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid linkedType",
          });
      }

      if (!linkedResource) {
        return res.status(404).json({
          success: false,
          message: `${linkedType} not found or does not belong to current user`,
        });
      }
    }

    const note = new Note({
      userId: req.user.id,
      title: title || "Untitled Note",
      content,
      linkedType: linkedType || "standalone",
      linkedId: linkedType !== "standalone" ? linkedId : null,
      tags: tags || [],
      priority: priority || "medium",
      isPinned: isPinned || false,
    });

    await note.save();
    if (linkedType !== "standalone") {
      await note.populate("linkedId");
    }

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const { linkedType, linkedId, priority, isPinned, tags, sortBy } =
      req.query;

    // Build filter
    const filter = { userId: req.user.id };

    if (linkedType) {
      filter.linkedType = linkedType;
    }

    if (linkedId) {
      filter.linkedId = linkedId;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (isPinned !== undefined) {
      filter.isPinned = isPinned === "true";
    }

    if (tags) {
      const tagList = String(tags)
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (tagList.length === 1) {
        filter.tags = tagList[0];
      } else if (tagList.length > 1) {
        filter.tags = { $in: tagList };
      }
    }

    // Build sort
    let sortObject = {};
    if (sortBy) {
      sortObject[sortBy] = -1;
    } else {
      sortObject["createdAt"] = -1;
    }

    const notes = await Note.find(filter).sort(sortObject);

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all unique tags for current user notes
exports.getAllNoteTags = async (req, res) => {
  try {
    const tags = await Note.distinct("tags", { userId: req.user.id });

    const cleanedTags = tags
      .filter((tag) => typeof tag === "string")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .sort((a, b) => a.localeCompare(b));

    res.status(200).json({
      success: true,
      count: cleanedTags.length,
      tags: cleanedTags,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single note
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get notes for specific resource
exports.getNotesByResource = async (req, res) => {
  try {
    const { linkedType, linkedId } = req.params;

    // Validate linkedType
    const validTypes = ["dream", "action", "task", "idea"];
    if (!validTypes.includes(linkedType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid linkedType",
      });
    }

    // Verify resource exists and belongs to user
    let resourceTitle;
    let linkedResource;

    switch (linkedType) {
      case "dream":
        linkedResource = await Dream.findOne({
          _id: linkedId,
          userId: req.user.id,
        });
        resourceTitle = linkedResource?.title;
        break;
      case "action":
        linkedResource = await Action.findOne({
          _id: linkedId,
          userId: req.user.id,
        });
        resourceTitle = linkedResource?.title;
        break;
      case "task":
        linkedResource = await Task.findOne({
          _id: linkedId,
          userId: req.user.id,
        });
        resourceTitle = linkedResource?.title;
        break;
      case "idea":
        linkedResource = await Idea.findOne({
          _id: linkedId,
          userId: req.user.id,
        });
        resourceTitle = linkedResource?.title;
        break;
    }

    if (!linkedResource) {
      return res.status(404).json({
        success: false,
        message: `${linkedType} not found or does not belong to current user`,
      });
    }

    const notes = await Note.find({
      userId: req.user.id,
      linkedType: linkedType,
      linkedId: linkedId,
    }).sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      resourceType: linkedType,
      resourceTitle: resourceTitle,
      notes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get standalone notes
exports.getStandaloneNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
      linkedType: "standalone",
    }).sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    const { title, content, tags, priority, isPinned } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (priority !== undefined) note.priority = priority;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle pin status
exports.togglePinNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: "Note pin status toggled",
      note,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
      noteId: note._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get note statistics
exports.getNoteStats = async (req, res) => {
  try {
    const totalNotes = await Note.countDocuments({ userId: req.user.id });
    const standaloneNotes = await Note.countDocuments({
      userId: req.user.id,
      linkedType: "standalone",
    });
    const pinnedNotes = await Note.countDocuments({
      userId: req.user.id,
      isPinned: true,
    });
    const byPriority = await Note.aggregate([
      { $match: { userId: req.user.objectId || req.user.id } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const byType = await Note.aggregate([
      { $match: { userId: req.user.objectId || req.user.id } },
      { $group: { _id: "$linkedType", count: { $sum: 1 } } },
    ]);

    const stats = {
      totalNotes,
      standaloneNotes,
      pinnedNotes,
      byPriority: {},
      byType: {},
    };

    byPriority.forEach((item) => {
      stats.byPriority[item._id] = item.count;
    });

    byType.forEach((item) => {
      stats.byType[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

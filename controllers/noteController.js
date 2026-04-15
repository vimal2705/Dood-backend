const Note = require('../models/Note');
const Dream = require('../models/Dream');
const Action = require('../models/Action');
const Task = require('../models/Task');
const Idea = require('../models/Idea');

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const { content, linkedType, linkedId, tags, isPinned } = req.body;

    // Validate linkedType and linkedId
    if (linkedType !== 'standalone') {
      if (!linkedId) {
        return res.status(400).json({
          success: false,
          message: 'linkedId is required for linked notes'
        });
      }

      // Verify that the linked resource belongs to the current user
      let linkedResource;
      switch (linkedType) {
        case 'dream':
          linkedResource = await Dream.findOne({ _id: linkedId, userId: req.user.id });
          break;
        case 'action':
          linkedResource = await Action.findOne({ _id: linkedId, userId: req.user.id });
          break;
        case 'task':
          linkedResource = await Task.findOne({ _id: linkedId, userId: req.user.id });
          break;
        case 'idea':
          linkedResource = await Idea.findOne({ _id: linkedId, userId: req.user.id });
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid linkedType'
          });
      }

      if (!linkedResource) {
        return res.status(404).json({
          success: false,
          message: `${linkedType} not found or does not belong to current user`
        });
      }
    }

    const note = new Note({
      userId: req.user.id,
      content,
      linkedType: linkedType || 'standalone',
      linkedId: linkedType !== 'standalone' ? linkedId : null,
      tags: tags || [],
      isPinned: isPinned || false
    });

    await note.save();
    if (linkedType !== 'standalone') {
      await note.populate('linkedId');
    }

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const { linkedType, linkedId, isPinned, sortBy } = req.query;

    // Build filter
    const filter = { userId: req.user.id };

    if (linkedType) {
      filter.linkedType = linkedType;
    }

    if (linkedId) {
      filter.linkedId = linkedId;
    }

    if (isPinned) {
      filter.isPinned = isPinned === 'true';
    }

    // Build sort
    let sortObject = {};
    if (sortBy) {
      sortObject[sortBy] = -1;
    } else {
      sortObject['createdAt'] = -1;
    }

    const notes = await Note.find(filter).sort(sortObject);

    res.status(200).json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single note
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notes for specific resource
exports.getNotesByResource = async (req, res) => {
  try {
    const { linkedType, linkedId } = req.params;

    // Validate linkedType
    const validTypes = ['dream', 'action', 'task', 'idea'];
    if (!validTypes.includes(linkedType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid linkedType'
      });
    }

    // Verify resource exists and belongs to user
    let resourceTitle;
    let linkedResource;

    switch (linkedType) {
      case 'dream':
        linkedResource = await Dream.findOne({ _id: linkedId, userId: req.user.id });
        resourceTitle = linkedResource?.title || linkedResource?.subTitle;
        break;
      case 'action':
        linkedResource = await Action.findOne({ _id: linkedId, userId: req.user.id });
        resourceTitle = linkedResource?.title;
        break;
      case 'task':
        linkedResource = await Task.findOne({ _id: linkedId, userId: req.user.id });
        resourceTitle = linkedResource?.title;
        break;
      case 'idea':
        linkedResource = await Idea.findOne({ _id: linkedId, userId: req.user.id });
        resourceTitle = linkedResource?.title;
        break;
    }

    if (!linkedResource) {
      return res.status(404).json({
        success: false,
        message: `${linkedType} not found or does not belong to current user`
      });
    }

    const notes = await Note.find({
      userId: req.user.id,
      linkedType: linkedType,
      linkedId: linkedId
    }).sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      resourceType: linkedType,
      resourceTitle: resourceTitle,
      notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get standalone notes
exports.getStandaloneNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
      linkedType: 'standalone'
    }).sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    const { content, tags, isPinned } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle pin status
exports.togglePinNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note.isPinned = !note.isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: 'Note pin status toggled',
      note
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      noteId: note._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get note statistics
exports.getNoteStats = async (req, res) => {
  try {
    const totalNotes = await Note.countDocuments({ userId: req.user.id });
    const standaloneNotes = await Note.countDocuments({ userId: req.user.id, linkedType: 'standalone' });
    const pinnedNotes = await Note.countDocuments({ userId: req.user.id, isPinned: true });

    const byType = await Note.aggregate([
      { $match: { userId: req.user.objectId || req.user.id } },
      { $group: { _id: '$linkedType', count: { $sum: 1 } } }
    ]);

    const stats = {
      totalNotes,
      standaloneNotes,
      pinnedNotes,
      byType: {}
    };

    byType.forEach(item => {
      stats.byType[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

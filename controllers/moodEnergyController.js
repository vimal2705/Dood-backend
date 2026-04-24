const MoodEnergy = require('../models/MoodEnergy');

const ENERGY_KEYS = ['very_low', 'low', 'medium', 'high', 'very_high'];
const MOOD_KEYS = ['very_bad', 'bad', 'neutral', 'good', 'very_good'];

const KEY_TO_DISPLAY = {
  very_low: 'Very Low',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High',
  very_bad: 'Very Bad',
  bad: 'Bad',
  neutral: 'Neutral',
  good: 'Good',
  very_good: 'Very Good',
};

const normalizeKey = (value) => {
  if (typeof value !== 'string') return null;
  const raw = value
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');
  if (raw === 'netural') return 'neutral';
  return raw;
};

const parseLevel = (value, keys) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const n = Math.trunc(value);
    if (n >= 1 && n <= 5) return n;
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10);
      if (n >= 1 && n <= 5) return n;
    }

    const key = normalizeKey(trimmed);
    if (!key) return null;
    const idx = keys.indexOf(key);
    if (idx === -1) return null;
    return idx + 1;
  }

  return null;
};

const levelToKey = (level, keys) => keys[Math.min(4, Math.max(0, level - 1))];

const dateToYmd = (date) => {
  const d = new Date(date);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const parseYmdToUtcDay = (ymd) => {
  if (typeof ymd !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split('-').map((v) => parseInt(v, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  // Validate that the date did not overflow (e.g. 2026-02-31)
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return dt;
};

// @desc    Create a new mood/energy entry (multiple per day allowed)
// @route   POST /api/mood-energy
// @access  Private
exports.createMoodEnergyEntry = async (req, res) => {
  try {
    const { energy, mood, recordedAt } = req.body;

    const energyLevel = parseLevel(energy, ENERGY_KEYS);
    const moodLevel = parseLevel(mood, MOOD_KEYS);

    if (!energyLevel) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid energy level. Use 1-5 or one of: Very Low, Low, Medium, High, Very High',
      });
    }
    if (!moodLevel) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid mood level. Use 1-5 or one of: Very Bad, Bad, Neutral, Good, Very Good',
      });
    }

    let finalRecordedAt = new Date();
    if (recordedAt !== undefined) {
      const dt = new Date(recordedAt);
      if (Number.isNaN(dt.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'recordedAt must be a valid ISO date string',
        });
      }
      finalRecordedAt = dt;
    }

    const entry = new MoodEnergy({
      userId: req.user.id,
      energy: energyLevel,
      mood: moodLevel,
      recordedAt: finalRecordedAt,
    });

    await entry.save();

    const energyKey = levelToKey(entry.energy, ENERGY_KEYS);
    const moodKey = levelToKey(entry.mood, MOOD_KEYS);

    res.status(201).json({
      success: true,
      message: 'Mood/Energy entry created successfully',
      entry: {
        _id: entry._id,
        energy: entry.energy,
        energyKey,
        energyLabel: KEY_TO_DISPLAY[energyKey],
        mood: entry.mood,
        moodKey,
        moodLabel: KEY_TO_DISPLAY[moodKey],
        recordedAt: entry.recordedAt,
        day: dateToYmd(entry.day),
        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get average mood/energy for a day or date range
// @route   GET /api/mood-energy/average
// @access  Private
exports.getMoodEnergyAverage = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;

    const hasDate = date !== undefined;
    const hasRange = startDate !== undefined || endDate !== undefined;
    if (hasDate && hasRange) {
      return res.status(400).json({
        success: false,
        message: 'Use either `date` OR (`startDate` and `endDate`), not both',
      });
    }

    let match = { userId: req.user.id };
    let filter = { type: 'all' };
    let includePerDay = false;

    if (hasDate) {
      const day = parseYmdToUtcDay(String(date));
      if (!day) {
        return res.status(400).json({
          success: false,
          message: 'date must be in format YYYY-MM-DD',
        });
      }
      match.day = day;
      filter = { type: 'day', date: dateToYmd(day) };
    } else if (hasRange) {
      if (startDate === undefined || endDate === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Both startDate and endDate are required for range filter',
        });
      }
      const start = parseYmdToUtcDay(String(startDate));
      const end = parseYmdToUtcDay(String(endDate));
      if (!start || !end) {
        return res.status(400).json({
          success: false,
          message: 'startDate/endDate must be in format YYYY-MM-DD',
        });
      }
      if (end < start) {
        return res.status(400).json({
          success: false,
          message: 'endDate must be the same as or after startDate',
        });
      }
      match.day = { $gte: start, $lte: end };
      filter = { type: 'range', startDate: dateToYmd(start), endDate: dateToYmd(end) };
      includePerDay = true;
    }

    const [result] = await MoodEnergy.aggregate([
      { $match: match },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                avgEnergy: { $avg: '$energy' },
                avgMood: { $avg: '$mood' },
                count: { $sum: 1 },
              },
            },
          ],
          perDay: [
            {
              $group: {
                _id: '$day',
                avgEnergy: { $avg: '$energy' },
                avgMood: { $avg: '$mood' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    const overall = result?.overall?.[0];
    const count = overall?.count || 0;

    const avgEnergy = overall?.avgEnergy ?? null;
    const avgMood = overall?.avgMood ?? null;

    const roundedEnergy = avgEnergy === null ? null : Math.min(5, Math.max(1, Math.round(avgEnergy)));
    const roundedMood = avgMood === null ? null : Math.min(5, Math.max(1, Math.round(avgMood)));

    const energyKey = roundedEnergy === null ? null : levelToKey(roundedEnergy, ENERGY_KEYS);
    const moodKey = roundedMood === null ? null : levelToKey(roundedMood, MOOD_KEYS);

    const response = {
      success: true,
      filter,
      count,
      averages: {
        energy: {
          avg: avgEnergy === null ? null : Number(avgEnergy.toFixed(2)),
          rounded: roundedEnergy,
          key: energyKey,
          label: energyKey ? KEY_TO_DISPLAY[energyKey] : null,
        },
        mood: {
          avg: avgMood === null ? null : Number(avgMood.toFixed(2)),
          rounded: roundedMood,
          key: moodKey,
          label: moodKey ? KEY_TO_DISPLAY[moodKey] : null,
        },
      },
    };

    if (includePerDay) {
      response.perDay = (result?.perDay || []).map((d) => {
        const perEnergyRounded = Math.min(5, Math.max(1, Math.round(d.avgEnergy)));
        const perMoodRounded = Math.min(5, Math.max(1, Math.round(d.avgMood)));
        const perEnergyKey = levelToKey(perEnergyRounded, ENERGY_KEYS);
        const perMoodKey = levelToKey(perMoodRounded, MOOD_KEYS);
        return {
          day: dateToYmd(d._id),
          count: d.count,
          energy: {
            avg: Number(d.avgEnergy.toFixed(2)),
            rounded: perEnergyRounded,
            key: perEnergyKey,
            label: KEY_TO_DISPLAY[perEnergyKey],
          },
          mood: {
            avg: Number(d.avgMood.toFixed(2)),
            rounded: perMoodRounded,
            key: perMoodKey,
            label: KEY_TO_DISPLAY[perMoodKey],
          },
        };
      });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const Log = require("../models/log")


async function deleteOldLogs() {
  try {
    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - FIVE_DAYS);
    const result = await Log.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    console.log(
      `🧹 Old logs cleanup: ${result.deletedCount} ta log o‘chirildi`
    );
  } catch (err) {
    console.error("❌ Loglarni o‘chirishda xato:", err.message);
  }
}

/**
 * Sutkada 1 marta (24 soat)
 */
function startLogCleaner() {
  // server ishga tushganda 1 marta tekshiradi
  deleteOldLogs();

  // har 24 soatda
  setInterval(deleteOldLogs, 24 * 60 * 60 * 1000);
}

module.exports = startLogCleaner;

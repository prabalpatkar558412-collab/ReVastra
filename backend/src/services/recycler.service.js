const { db } = require("../config/firebase");
const { recyclers } = require("../data/recyclers");

function getDistanceValue(distance) {
  return Number.parseFloat(distance) || 0;
}

function buildRecyclerRecommendations(submission) {
  return recyclers
    .map((recycler) => {
      const finalOffer = submission.estimatedValue + recycler.offerBonus;
      const score =
        (recycler.pickup ? 30 : 0) +
        recycler.rating * 10 +
        (200 - getDistanceValue(recycler.distance)) +
        recycler.offerBonus / 10;

      return {
        ...recycler,
        finalOffer,
        score: Number(score.toFixed(1)),
      };
    })
    .sort(
      (firstRecycler, secondRecycler) => secondRecycler.score - firstRecycler.score
    )
    .map((recycler, index) => ({
      ...recycler,
      isBestMatch: index === 0,
    }));
}

async function getRecyclerRecommendations(submissionId) {
  const submissionRef = db.collection("deviceSubmissions").doc(submissionId);
  const submissionDoc = await submissionRef.get();

  if (!submissionDoc.exists) {
    const error = new Error("Submission not found");
    error.statusCode = 404;
    throw error;
  }

  const submission = submissionDoc.data();

  if (!Number.isFinite(submission.estimatedValue)) {
    const error = new Error(
      "Please generate the device estimate before viewing recycler recommendations"
    );
    error.statusCode = 400;
    throw error;
  }

  return {
    submission,
    recyclers: buildRecyclerRecommendations(submission),
  };
}

module.exports = {
  getRecyclerRecommendations,
};

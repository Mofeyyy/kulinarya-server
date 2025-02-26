// Recipe Aggregation Pipeline
export const recipeAggregationPipeline = (filter = {}, otherFilters = {}) => [
  {
    $lookup: {
      from: "users",
      let: { userId: "$byUser" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
        { $project: { firstName: 1, middleName: 1, lastName: 1 } },
      ],
      as: "byUser",
    },
  },

  { $unwind: { path: "$byUser", preserveNullAndEmptyArrays: true } },

  {
    $lookup: {
      from: "moderations",
      let: { moderationId: "$moderationInfo" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$moderationId"] } } },
        { $project: { status: 1 } },
      ],
      as: "moderationInfo",
    },
  },

  { $unwind: { path: "$moderationInfo", preserveNullAndEmptyArrays: true } },

  {
    $match: {
      ...filter,
      ...otherFilters,
    },
  },
];

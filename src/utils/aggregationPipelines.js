// Recipe Aggregation Pipeline
export const recipeAggregationPipeline = (
  filter = {},
  otherFilters = {},
  otherAggregationsPiplines = []
) => [
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

  ...otherAggregationsPiplines,

  {
    $match: {
      ...filter,
      ...otherFilters,
    },
  },
];

// Pipeline for previewing the latest 3 comments with byUser details
export const commentPreviewPipeline = [
  {
    $lookup: {
      from: "comments",
      let: { recipeId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$fromPost", "$$recipeId"] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 3 },

        // Populate the byUser field
        {
          $lookup: {
            from: "users",
            let: { userId: "$byUser" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
              {
                $project: {
                  firstName: 1,
                  middleName: 1,
                  lastName: 1,
                  profilePicture: 1,
                },
              },
            ],
            as: "byUser",
          },
        },

        { $unwind: { path: "$byUser", preserveNullAndEmptyArrays: true } },

        {
          $project: {
            _id: 1,
            text: 1,
            createdAt: 1,
            "byUser.firstName": 1,
            "byUser.middleName": 1,
            "byUser.lastName": 1,
            "byUser.profilePicture": 1,
          },
        },
      ],
      as: "commentsPreview",
    },
  },
];

// Pipeline for getting the total comments count
export const commentCountPipeline = [
  {
    $lookup: {
      from: "comments",
      let: { recipeId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$fromPost", "$$recipeId"] } } },
        { $count: "totalComments" },
      ],
      as: "commentsCount",
    },
  },
  {
    $set: {
      totalComments: { $arrayElemAt: ["$commentsCount.totalComments", 0] },
    },
  },
  { $unset: "commentsCount" }, // Remove unnecessary field
];

// Pipeline for aggregating reaction counts
export const reactionCountPipeline = [
  {
    $lookup: {
      from: "reactions",
      let: { recipeId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$fromPost", "$$recipeId"] } } },
        { $group: { _id: "$reaction", count: { $sum: 1 } } }, // Count reactions by type
        { $project: { _id: 0, reaction: "$_id", count: 1 } },
      ],
      as: "reactionCounts",
    },
  },
];

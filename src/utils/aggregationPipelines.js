// Recipe Aggregation Pipeline
export const recipeAggregationPipeline = (
  filter = {},
  otherFilters = {},
  otherAggregationsPiplines = [],
  otherStages = []
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

  ...otherStages,
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

export const reactionCountPipeline = [
  {
    $lookup: {
      from: "reactions",
      let: { recipeId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$fromPost", "$$recipeId"] } } },
        { $group: { _id: "$reaction", count: { $sum: 1 } } },
        { $project: { _id: 0, reaction: "$_id", count: 1 } },
      ],
      as: "totalReactions",
    },
  },
  {
    $set: {
      totalReactions: {
        $ifNull: ["$totalReactions", []], // Fallback to an empty array
      },
    },
  },
];

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
      totalComments: {
        $ifNull: [{ $arrayElemAt: ["$commentsCount.totalComments", 0] }, 0], // Handle null count
      },
    },
  },
  { $unset: "commentsCount" },
];

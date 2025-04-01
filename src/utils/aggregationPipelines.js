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
        {
          $project: {
            firstName: 1,
            middleName: 1,
            lastName: 1,
            profilePictureUrl: 1,
            bio: 1,
          },
        },
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
        {
          $match: {
            $expr: { $eq: ["$fromPost", "$$recipeId"] },
            $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
          },
        },
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
                  profilePictureUrl: 1,
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
            content: 1,
            createdAt: 1,
            "byUser._id": 1,
            "byUser.firstName": 1,
            "byUser.middleName": 1,
            "byUser.lastName": 1,
            "byUser.profilePictureUrl": 1,
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
        {
          $match: {
            $expr: { $eq: ["$fromPost", "$$recipeId"] },
            reaction: { $ne: null },
          },
        },
        { $count: "total" },
      ],
      as: "reactionData",
    },
  },
  {
    $set: {
      totalReactions: {
        $ifNull: [{ $arrayElemAt: ["$reactionData.total", 0] }, 0],
      }, // Extract count, fallback to 0
    },
  },
  {
    $unset: "reactionData", // Remove the temporary array
  },
];

export const commentCountPipeline = [
  {
    $lookup: {
      from: "comments",
      let: { recipeId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$fromPost", "$$recipeId"] },
            $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
          },
        },
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

export const postViewCountPipeline = [
  {
    $lookup: {
      from: "postviews",
      let: { recipeId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$fromPost", "$$recipeId"] } } },
        { $count: "totalViews" },
      ],
      as: "viewsCount",
    },
  },
  {
    $set: {
      totalViews: {
        $ifNull: [{ $arrayElemAt: ["$viewsCount.totalViews", 0] }, 0], // Handle null count
      },
    },
  },
  { $unset: "viewsCount" },
];

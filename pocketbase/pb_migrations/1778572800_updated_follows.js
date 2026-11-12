/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3660641689");

    // update collection data
    unmarshal(
      {
        indexes: [
          "CREATE UNIQUE INDEX `idx_follows_follower_following` ON `follows` (\n  `follower`,\n  `following`\n)",
        ],
      },
      collection,
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3660641689");

    // update collection data
    unmarshal(
      {
        indexes: [],
      },
      collection,
    );

    return app.save(collection);
  },
);

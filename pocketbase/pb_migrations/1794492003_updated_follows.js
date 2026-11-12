/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3660641689");

    // update collection data
    unmarshal(
      {
        createRule:
          "@request.body.follower = @request.auth.id && (@request.body.accepted:isset = false || @request.body.accepted = false || following.isPublic = true)",
        updateRule:
          "following = @request.auth.id && @request.body.follower:isset = false && @request.body.following:isset = false",
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
        createRule: "@request.body.follower = @request.auth.id",
        updateRule:
          "follower = @request.auth.id || following = @request.auth.id",
      },
      collection,
    );

    return app.save(collection);
  },
);

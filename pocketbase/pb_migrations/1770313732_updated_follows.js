/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3660641689");

    // update collection data
    unmarshal(
      {
        createRule: "@request.body.follower = @request.auth.id",
        listRule: "follower = @request.auth.id || following = @request.auth.id",
        updateRule: "following = @request.auth.id",
        viewRule: "follower = @request.auth.id || following = @request.auth.id",
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
        createRule: "@request.body.follower = @request.auth.collectionId",
        listRule:
          "follower = @request.auth.id || following = @request.auth.collectionId",
        updateRule: "following = @request.auth.collectionId",
        viewRule:
          "follower = @request.auth.id || following = @request.auth.collectionId",
      },
      collection,
    );

    return app.save(collection);
  },
);

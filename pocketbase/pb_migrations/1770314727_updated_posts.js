/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1125843985");

    // update collection data
    unmarshal(
      {
        listRule:
          '@request.auth.id != "" && (\n  user = @request.auth.id ||\n  @collection.follows.follower ?= @request.auth.id && \n  @collection.follows.following ?= user && \n  @collection.follows.accepted ?= true\n)',
        viewRule:
          '@request.auth.id != "" && (\n  user = @request.auth.id ||\n  user.isPublic = true ||\n  @collection.follows.follower ?= @request.auth.id && \n  @collection.follows.following ?= user && \n  @collection.follows.accepted ?= true\n)',
      },
      collection,
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1125843985");

    // update collection data
    unmarshal(
      {
        listRule: "user = @request.auth.id",
        viewRule: "user = @request.auth.id",
      },
      collection,
    );

    return app.save(collection);
  },
);

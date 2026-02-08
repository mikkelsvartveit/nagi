/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3660641689");

    // update collection data
    unmarshal(
      {
        updateRule:
          "follower = @request.auth.id || following = @request.auth.id",
      },
      collection,
    );

    // add field
    collection.fields.addAt(
      4,
      new Field({
        hidden: false,
        id: "bool2555855207",
        name: "read",
        presentable: false,
        required: false,
        system: false,
        type: "bool",
      }),
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3660641689");

    // update collection data
    unmarshal(
      {
        updateRule: "following = @request.auth.id",
      },
      collection,
    );

    // remove field
    collection.fields.removeById("bool2555855207");

    return app.save(collection);
  },
);

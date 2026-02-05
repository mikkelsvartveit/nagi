/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_");

    // add field
    collection.fields.addAt(
      9,
      new Field({
        hidden: false,
        id: "bool4208731335",
        name: "isPublic",
        presentable: false,
        required: true,
        system: false,
        type: "bool",
      }),
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_");

    // remove field
    collection.fields.removeById("bool4208731335");

    return app.save(collection);
  },
);

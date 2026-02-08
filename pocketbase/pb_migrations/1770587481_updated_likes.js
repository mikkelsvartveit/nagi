/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_2190274710");

    // update collection data
    unmarshal(
      {
        updateRule: "post.user = @request.auth.id",
      },
      collection,
    );

    // add field
    collection.fields.addAt(
      3,
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
    const collection = app.findCollectionByNameOrId("pbc_2190274710");

    // update collection data
    unmarshal(
      {
        updateRule: null,
      },
      collection,
    );

    // remove field
    collection.fields.removeById("bool2555855207");

    return app.save(collection);
  },
);

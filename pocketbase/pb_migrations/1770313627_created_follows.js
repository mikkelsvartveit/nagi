/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = new Collection({
      createRule: "@request.body.follower = @request.auth.collectionId",
      deleteRule: "follower = @request.auth.id || following = @request.auth.id",
      fields: [
        {
          autogeneratePattern: "[a-z0-9]{15}",
          hidden: false,
          id: "text3208210256",
          max: 15,
          min: 15,
          name: "id",
          pattern: "^[a-z0-9]+$",
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: "text",
        },
        {
          cascadeDelete: false,
          collectionId: "_pb_users_auth_",
          hidden: false,
          id: "relation3117812038",
          maxSelect: 1,
          minSelect: 0,
          name: "follower",
          presentable: false,
          required: false,
          system: false,
          type: "relation",
        },
        {
          cascadeDelete: false,
          collectionId: "_pb_users_auth_",
          hidden: false,
          id: "relation1908379107",
          maxSelect: 1,
          minSelect: 0,
          name: "following",
          presentable: false,
          required: false,
          system: false,
          type: "relation",
        },
        {
          hidden: false,
          id: "bool1981675086",
          name: "accepted",
          presentable: false,
          required: false,
          system: false,
          type: "bool",
        },
        {
          hidden: false,
          id: "autodate2990389176",
          name: "created",
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: "autodate",
        },
        {
          hidden: false,
          id: "autodate3332085495",
          name: "updated",
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: "autodate",
        },
      ],
      id: "pbc_3660641689",
      indexes: [],
      listRule:
        "follower = @request.auth.id || following = @request.auth.collectionId",
      name: "follows",
      system: false,
      type: "base",
      updateRule: "following = @request.auth.collectionId",
      viewRule:
        "follower = @request.auth.id || following = @request.auth.collectionId",
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_3660641689");

    return app.delete(collection);
  },
);

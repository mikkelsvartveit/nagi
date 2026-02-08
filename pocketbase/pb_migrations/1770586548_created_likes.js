/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = new Collection({
      createRule: "user = @request.auth.id",
      deleteRule: "user = @request.auth.id",
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
          id: "relation2375276105",
          maxSelect: 1,
          minSelect: 0,
          name: "user",
          presentable: false,
          required: true,
          system: false,
          type: "relation",
        },
        {
          cascadeDelete: false,
          collectionId: "pbc_1125843985",
          hidden: false,
          id: "relation1519021197",
          maxSelect: 1,
          minSelect: 0,
          name: "post",
          presentable: false,
          required: true,
          system: false,
          type: "relation",
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
      id: "pbc_2190274710",
      indexes: [
        "CREATE UNIQUE INDEX `idx_3taz2ndKpf` ON `likes` (\n  `user`,\n  `post`\n)",
      ],
      listRule: "user = @request.auth.id || post.user = @request.auth.id",
      name: "likes",
      system: false,
      type: "base",
      updateRule: null,
      viewRule: "user = @request.auth.id || post.user = @request.auth.id",
    });

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_2190274710");

    return app.delete(collection);
  },
);

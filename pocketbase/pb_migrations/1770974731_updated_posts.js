/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1125843985");

    // update field
    collection.fields.addAt(
      1,
      new Field({
        hidden: false,
        id: "file3760176746",
        maxSelect: 10,
        maxSize: 15000000,
        mimeTypes: [
          "image/jpeg",
          "image/png",
          "image/svg+xml",
          "image/gif",
          "image/webp",
        ],
        name: "images",
        presentable: false,
        protected: false,
        required: true,
        system: false,
        thumbs: ["1080x0", "100x100"],
        type: "file",
      }),
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1125843985");

    // update field
    collection.fields.addAt(
      1,
      new Field({
        hidden: false,
        id: "file3760176746",
        maxSelect: 10,
        maxSize: 15000000,
        mimeTypes: [
          "image/jpeg",
          "image/png",
          "image/svg+xml",
          "image/gif",
          "image/webp",
        ],
        name: "images",
        presentable: false,
        protected: false,
        required: true,
        system: false,
        thumbs: ["1080x0", "320x0"],
        type: "file",
      }),
    );

    return app.save(collection);
  },
);

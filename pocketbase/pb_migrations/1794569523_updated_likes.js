/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2190274710")

  // update collection data
  unmarshal({
    "updateRule": "post.user = @request.auth.id && @request.body.user:changed = false && @request.body.post:changed = false"
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2375276105",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_1125843985",
    "hidden": false,
    "id": "relation1519021197",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "post",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2190274710")

  // update collection data
  unmarshal({
    "updateRule": "post.user = @request.auth.id"
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation2375276105",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "user",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1125843985",
    "hidden": false,
    "id": "relation1519021197",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "post",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})

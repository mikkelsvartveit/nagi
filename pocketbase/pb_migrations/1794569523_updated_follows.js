/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3660641689")

  // update collection data
  unmarshal({
    "createRule": "@request.body.follower = @request.auth.id && @request.body.following != @request.auth.id && (@request.body.accepted:isset = false || @request.body.accepted = false || following.isPublic = true)"
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3117812038",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "follower",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1908379107",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "following",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3660641689")

  // update collection data
  unmarshal({
    "createRule": "@request.body.follower = @request.auth.id && (@request.body.accepted:isset = false || @request.body.accepted = false || following.isPublic = true)"
  }, collection)

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3117812038",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "follower",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1908379107",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "following",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})

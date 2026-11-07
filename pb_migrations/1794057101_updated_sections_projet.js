/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3153341614")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3938092973",
    "help": "",
    "hidden": false,
    "id": "relation1343593641",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "projet",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3153341614")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3938092973",
    "help": "",
    "hidden": false,
    "id": "relation1343593641",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "projet",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})

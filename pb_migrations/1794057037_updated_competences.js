/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_735139002")

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text4286007220",
    "max": 0,
    "min": 0,
    "name": "titre",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "select1232983604",
    "maxSelect": 0,
    "name": "categorie",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "technique ",
      "organisation ",
      "communication"
    ]
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select1272968043",
    "maxSelect": 0,
    "name": "niveau",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "debutant",
      "intermediaire",
      "avance"
    ]
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "file3598424642",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "illustration",
    "presentable": false,
    "protected": false,
    "required": true,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_735139002")

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text4286007220",
    "max": 0,
    "min": 0,
    "name": "titre",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "help": "",
    "hidden": false,
    "id": "select1232983604",
    "maxSelect": 0,
    "name": "categorie",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "technique ",
      "organisation ",
      "communication"
    ]
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "select1272968043",
    "maxSelect": 0,
    "name": "niveau",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "debutant",
      "intermediaire",
      "avance"
    ]
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "help": "",
    "hidden": false,
    "id": "file3598424642",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "illustration",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})

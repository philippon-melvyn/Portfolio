/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3938092973")

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
    "id": "select2309287578",
    "maxSelect": 3,
    "name": "domaines",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "Identité de marque",
      "Direction artistique",
      "Conception numérique"
    ]
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "number3734160847",
    "max": null,
    "min": null,
    "name": "annee",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "editor4110439460",
    "maxSize": 0,
    "name": "introduction",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "editor"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "file2081807616",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "couverture",
    "presentable": false,
    "protected": false,
    "required": true,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2387119377",
    "max": 0,
    "min": 0,
    "name": "couverture_alt",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_735139002",
    "help": "",
    "hidden": false,
    "id": "relation3676338126",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "competences",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2495844282",
    "help": "",
    "hidden": false,
    "id": "relation93384784",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "savoirs",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3938092973")

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
    "id": "select2309287578",
    "maxSelect": 0,
    "name": "domaines",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "Identité de marque",
      "Direction artistique",
      "Conception numérique"
    ]
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "help": "",
    "hidden": false,
    "id": "number3734160847",
    "max": null,
    "min": null,
    "name": "annee",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(5, new Field({
    "convertURLs": false,
    "help": "",
    "hidden": false,
    "id": "editor4110439460",
    "maxSize": 0,
    "name": "introduction",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "editor"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "help": "",
    "hidden": false,
    "id": "file2081807616",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": [],
    "name": "couverture",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "help": "",
    "hidden": false,
    "id": "text2387119377",
    "max": 0,
    "min": 0,
    "name": "couverture_alt",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // update field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_735139002",
    "help": "",
    "hidden": false,
    "id": "relation3676338126",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "competences",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(9, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2495844282",
    "help": "",
    "hidden": false,
    "id": "relation93384784",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "savoirs",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})

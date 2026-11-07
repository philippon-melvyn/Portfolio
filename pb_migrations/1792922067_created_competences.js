/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": null,
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
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
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text1843675174",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
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
      },
      {
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
      },
      {
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
      },
      {
        "help": "",
        "hidden": false,
        "id": "number1937347273",
        "max": null,
        "min": null,
        "name": "ordre",
        "onlyInt": true,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "bool3537341224",
        "name": "publie",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": true,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": true,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_735139002",
    "indexes": [],
    "listRule": null,
    "name": "competences",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_735139002");

  return app.delete(collection);
})

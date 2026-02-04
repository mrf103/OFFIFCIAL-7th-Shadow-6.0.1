{
  "name": "CoverDesign",
  "type": "object",
  "properties": {
    "manuscript_id": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "subtitle": {
      "type": "string"
    },
    "author_name": {
      "type": "string"
    },
    "style": {
      "type": "string",
      "enum": [
        "classic",
        "modern",
        "minimal",
        "artistic",
        "academic",
        "religious"
      ],
      "default": "modern"
    },
    "color_scheme": {
      "type": "object",
      "properties": {
        "primary": {
          "type": "string"
        },
        "secondary": {
          "type": "string"
        },
        "accent": {
          "type": "string"
        },
        "text": {
          "type": "string"
        }
      }
    },
    "dimensions": {
      "type": "object",
      "properties": {
        "width": {
          "type": "number"
        },
        "height": {
          "type": "number"
        },
        "spine_width": {
          "type": "number"
        },
        "bleed": {
          "type": "number"
        }
      }
    },
    "front_image_url": {
      "type": "string"
    },
    "back_image_url": {
      "type": "string"
    },
    "spine_image_url": {
      "type": "string"
    },
    "full_cover_url": {
      "type": "string"
    },
    "description": {
      "type": "string",
      "description": "\u0646\u0635 \u0627\u0644\u063a\u0644\u0627\u0641 \u0627\u0644\u062e\u0644\u0641\u064a"
    },
    "isbn": {
      "type": "string"
    },
    "barcode_url": {
      "type": "string"
    },
    "is_approved": {
      "type": "boolean",
      "default": false
    }
  },
  "required": [
    "manuscript_id",
    "title"
  ]
}
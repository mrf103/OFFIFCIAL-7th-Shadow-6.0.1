{
  "name": "Manuscript",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u062e\u0637\u0648\u0637\u0629"
    },
    "author": {
      "type": "string",
      "description": "\u0627\u0633\u0645 \u0627\u0644\u0645\u0624\u0644\u0641"
    },
    "genre": {
      "type": "string",
      "enum": [
        "\u0631\u0648\u0627\u064a\u0629",
        "\u0642\u0635\u0629 \u0642\u0635\u064a\u0631\u0629",
        "\u0634\u0639\u0631",
        "\u0645\u0642\u0627\u0644\u0627\u062a",
        "\u0628\u062d\u062b \u0639\u0644\u0645\u064a",
        "\u0633\u064a\u0631\u0629 \u0630\u0627\u062a\u064a\u0629",
        "\u062a\u0627\u0631\u064a\u062e",
        "\u062f\u064a\u0646",
        "\u0641\u0644\u0633\u0641\u0629",
        "\u0623\u062e\u0631\u0649"
      ],
      "description": "\u062a\u0635\u0646\u064a\u0641 \u0627\u0644\u0639\u0645\u0644"
    },
    "language": {
      "type": "string",
      "enum": [
        "ar",
        "en",
        "mixed"
      ],
      "default": "ar",
      "description": "\u0644\u063a\u0629 \u0627\u0644\u0645\u062e\u0637\u0648\u0637\u0629"
    },
    "direction": {
      "type": "string",
      "enum": [
        "rtl",
        "ltr"
      ],
      "default": "rtl"
    },
    "content": {
      "type": "string",
      "description": "\u0645\u062d\u062a\u0648\u0649 \u0627\u0644\u0645\u062e\u0637\u0648\u0637\u0629 \u0627\u0644\u0643\u0627\u0645\u0644"
    },
    "word_count": {
      "type": "number",
      "description": "\u0639\u062f\u062f \u0627\u0644\u0643\u0644\u0645\u0627\u062a"
    },
    "page_count": {
      "type": "number",
      "description": "\u0639\u062f\u062f \u0627\u0644\u0635\u0641\u062d\u0627\u062a \u0627\u0644\u0645\u0642\u062f\u0631"
    },
    "status": {
      "type": "string",
      "enum": [
        "draft",
        "processing",
        "editing",
        "compliance_check",
        "ready",
        "published"
      ],
      "default": "draft"
    },
    "compliance_status": {
      "type": "string",
      "enum": [
        "pending",
        "passed",
        "flagged",
        "reviewed"
      ],
      "default": "pending"
    },
    "cover_image_url": {
      "type": "string",
      "description": "\u0631\u0627\u0628\u0637 \u0635\u0648\u0631\u0629 \u0627\u0644\u063a\u0644\u0627\u0641"
    },
    "chapters": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "content": {
            "type": "string"
          },
          "word_count": {
            "type": "number"
          },
          "order": {
            "type": "number"
          }
        }
      }
    },
    "narrative_arc": {
      "type": "object",
      "properties": {
        "exposition": {
          "type": "number"
        },
        "rising_action": {
          "type": "number"
        },
        "climax": {
          "type": "number"
        },
        "falling_action": {
          "type": "number"
        },
        "resolution": {
          "type": "number"
        }
      }
    },
    "index_entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "term": {
            "type": "string"
          },
          "page": {
            "type": "number"
          },
          "category": {
            "type": "string"
          }
        }
      }
    },
    "references": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "citation": {
            "type": "string"
          },
          "source": {
            "type": "string"
          },
          "page": {
            "type": "number"
          }
        }
      }
    },
    "file_url": {
      "type": "string",
      "description": "\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0623\u0635\u0644\u064a"
    },
    "export_urls": {
      "type": "object",
      "properties": {
        "pdf": {
          "type": "string"
        },
        "epub": {
          "type": "string"
        },
        "print_ready": {
          "type": "string"
        }
      }
    }
  },
  "required": [
    "title",
    "author"
  ]
}
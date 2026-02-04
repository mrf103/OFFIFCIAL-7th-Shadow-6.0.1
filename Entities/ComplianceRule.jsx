{
  "name": "ComplianceRule",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "\u0627\u0633\u0645 \u0627\u0644\u0642\u0627\u0639\u062f\u0629"
    },
    "description": {
      "type": "string",
      "description": "\u0648\u0635\u0641 \u0627\u0644\u0642\u0627\u0639\u062f\u0629"
    },
    "category": {
      "type": "string",
      "enum": [
        "religious",
        "political",
        "social",
        "legal",
        "cultural"
      ],
      "description": "\u0641\u0626\u0629 \u0627\u0644\u0642\u0627\u0639\u062f\u0629"
    },
    "severity": {
      "type": "string",
      "enum": [
        "critical",
        "high",
        "medium",
        "low"
      ],
      "default": "medium"
    },
    "keywords": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "\u0643\u0644\u0645\u0627\u062a \u0645\u0641\u062a\u0627\u062d\u064a\u0629 \u0644\u0644\u0641\u062d\u0635"
    },
    "patterns": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "\u0623\u0646\u0645\u0627\u0637 \u0646\u0635\u064a\u0629 \u0644\u0644\u0643\u0634\u0641"
    },
    "is_active": {
      "type": "boolean",
      "default": true
    },
    "region": {
      "type": "string",
      "description": "\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062c\u063a\u0631\u0627\u0641\u064a\u0629 \u0644\u0644\u0642\u0627\u0639\u062f\u0629"
    }
  },
  "required": [
    "name",
    "category"
  ]
}
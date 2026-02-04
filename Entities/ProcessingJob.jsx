{
  "name": "ProcessingJob",
  "type": "object",
  "properties": {
    "manuscript_id": {
      "type": "string",
      "description": "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062e\u0637\u0648\u0637\u0629"
    },
    "job_type": {
      "type": "string",
      "enum": [
        "upload",
        "split",
        "merge",
        "edit",
        "compliance",
        "cover_design",
        "indexing",
        "export"
      ],
      "description": "\u0646\u0648\u0639 \u0627\u0644\u0645\u0647\u0645\u0629"
    },
    "status": {
      "type": "string",
      "enum": [
        "queued",
        "processing",
        "completed",
        "failed"
      ],
      "default": "queued"
    },
    "progress": {
      "type": "number",
      "default": 0,
      "description": "\u0646\u0633\u0628\u0629 \u0627\u0644\u0625\u0646\u062c\u0627\u0632"
    },
    "result": {
      "type": "object",
      "description": "\u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629"
    },
    "error_message": {
      "type": "string"
    },
    "started_at": {
      "type": "string",
      "format": "date-time"
    },
    "completed_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": [
    "manuscript_id",
    "job_type"
  ]
}
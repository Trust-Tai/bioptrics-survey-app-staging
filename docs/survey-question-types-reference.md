# Survey Question Types Reference

This document provides a reference for the correct question type values to use in survey import JSON files. These values must match the `responseType` values stored in the database to prevent duplicate question creation during import.

## Question Type Values

When importing surveys, use only the `responseType` field with the following values:

| UI Display Name | JSON `responseType` field (Database Value) | Description |
|----------------|------------------------------------------|-------------|
| Short Text     | shortText                                | Single-line text input |
| Long Text      | longText                                 | Multi-line text area input |
| Number         | number                                   | Numeric input field |
| Rating Scale   | ratingScale                              | Star or numeric rating scale |
| Multiple Choice| multipleChoice                           | Multiple selectable options |
| Single Choice  | singleChoice                             | Single selectable option from a list |
| Date           | date                                     | Date picker |
| Time           | time                                     | Time picker |
| Email          | email                                    | Email input with validation |
| Phone          | phone                                    | Phone number input |
| URL            | url                                      | URL/website input |
| File Upload    | fileUpload                               | File upload capability |
| Dropdown       | dropdown                                 | Dropdown selection menu |
| Slider         | slider                                   | Range slider |
| Matrix         | matrix                                   | Grid/matrix of questions |
| Ranking        | ranking                                  | Drag and drop ranking of items |

## Important Notes

1. **Matching Logic**: During import, the system matches existing questions using the `versions.questionText` and `versions.responseType` fields in the database.

2. **Preventing Duplicates**: To prevent duplicate questions during import, ensure that:
   - The `responseType` value in your JSON matches exactly with the database values listed above
   - The question text is consistent if you want to reuse existing questions

3. **Question Versioning**: The system stores question text and response type inside a `versions` array, which is important for the matching logic.

4. **Empty Section IDs**: Questions with empty `sectionId` values will not be associated with any section in the survey.

5. **Simplified JSON Structure**: The `type` field is no longer needed in the JSON import file. The system will use the `responseType` field for both matching existing questions and determining the question type.

## Example JSON Question Format

```json
{
  "text": "What is your full name?",
  "responseType": "shortText",
  "sectionId": "basic-info-section",
  "order": 1,
  "description": "Please enter your legal name",
  "required": true
}
```

## Survey Retake Settings

When configuring survey retake settings in your JSON import file, use the following structure:

```json
"defaultSettings": {
  "allowRetake": true,
  "retakeMode": "new"  // or "replace"
}
```

The `retakeMode` property accepts two values:

| Value | UI Option | Description |
|-------|-----------|-------------|
| `"new"` | Add as new response | Each retake creates a new response record |
| `"replace"` | Replace original response | Retakes overwrite the original response |

**Note:** The older format using nested `retakeSettings` with boolean flags is not compatible with the UI:

```json
// DO NOT USE - Not compatible with UI
"retakeSettings": {
  "replaceOriginalResponse": false,
  "addAsNewResponse": true
}
```

## Troubleshooting

If you encounter issues with duplicate questions being created during import:

1. Verify that the `responseType` values in your JSON match the expected database values
2. Check that question text is consistent with existing questions if you want to reuse them
3. Review the server logs for any matching errors during import
4. Ensure the survey import process is refreshing the UI with the latest data after import

# Instaffo Product Engineer: Test Task

Mock data for the test task. The brief: https://docs.google.com/document/d/1CUutjBNYOUaEl6AXpywD1CZgS4dxOserZX3KwuOSMV8/edit

## Job config

Each file in `jobs/` is one job with the questions the company asks:

```json
{
  "id": "job-long",
  "title": "Senior Frontend Engineer",
  "company": "Nordlicht Software GmbH",
  "language": "en",
  "questions": [
    {
      "type": "numeric",
      "id": "salary_expectation",
      "question": "What is your yearly salary expectation in EUR?",
      "required": true,
      "profile_field": "salary_expectation",
      "must_be_below": 90000
    }
  ]
}
```

`language` (`de` or `en`) is the language the recruiter wrote the questions in.

Questions are shown in array order unless you decide otherwise.

## Questions

Every question has:

| Field           | Required | Description                                                  |
| :-------------- | :------- | :----------------------------------------------------------- |
| `type`          | yes      | One of the types below                                       |
| `id`            | yes      | Unique within the job. Used as the key in the answer payload |
| `question`      | yes      | Text shown to the candidate, max 255 characters              |
| `required`      | no       | Default `false`                                              |
| `profile_field` | no       | The profile already holds this answer. See `profile.json`    |

## Types

| Type      | Options                                                               | Answer value                                                                                       |
| :-------- | :-------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| `text`    | `multiline` (default `false`)                                         | String                                                                                             |
| `date`    |                                                                       | String, `YYYY-MM-DD`                                                                               |
| `boolean` |                                                                       | `true` or `false`                                                                                  |
| `numeric` | `min` (default 0), `max` (default 100000000). Integers only           | Integer                                                                                            |
| `select`  | `options`: array of `{ "label", "value" }`. `max_choices` (default 1) | `max_choices` 1: the selected option `value` as a string. Above 1: array of selected option values |
| `file`    |                                                                       | File object, see below                                                                             |

`max_choices` can be equal to or higher than the number of options. Then all options can be selected.

## Profile fields

| `profile_field`       | Where in `profile.json`                    |
| :-------------------- | :----------------------------------------- |
| `notice_period`       | `notice_period`                            |
| `salary_expectation`  | `salary_expectation.amount`                |
| `city`                | `location.city`                            |
| `german_level`        | `languages`, entry with `"language": "de"` |
| `english_level`       | `languages`, entry with `"language": "en"` |
| `years_of_experience` | `years_of_experience`                      |

## Screening rules

A company can reject candidates automatically with a rule on a question:

| Rule               | Allowed on | Passes when                 | Example                                             |
| :----------------- | :--------- | :-------------------------- | :-------------------------------------------------- |
| `must_be_at_least` | `numeric`  | answer >= threshold         | Threshold 3: 3 and 4 pass, 2 fails                  |
| `must_be_below`    | `numeric`  | answer < threshold (strict) | Threshold 90000: 85000 passes, 90000 and 95000 fail |
| `must_be_true`     | `boolean`  | answer is `true`            | `"must_be_true": true`                              |

The rule value is the threshold for the numeric rules and `true` for `must_be_true`. A missing answer fails the rule.

## Validation

Job configs are written by recruiters and are not always clean.

- Question IDs must be unique. On duplicates, only the first question counts.
- A screening rule on a type it is not allowed on is ignored.
- A question with an unknown `type` is ignored.

## Answer payload

The example mixes questions from several jobs to show every value shape.

```json
{
  "job_id": "job-long",
  "answers": [
    { "id": "notice_period", "value": "3_months" },
    { "id": "salary_expectation", "value": 85000 },
    { "id": "eu_work_permit", "value": true },
    { "id": "focus_areas", "values": ["frontend", "design_systems"] },
    {
      "id": "cover_letter",
      "value": {
        "content_type": "application/pdf",
        "data": "JVBERi0xLjcK...",
        "file_name": "cover_letter.pdf"
      }
    }
  ],
  "screening": { "passed": false, "failed": ["salary_expectation"] }
}
```

- Multi-select answers use `values` (array). All other answers use `value`.
- Numbers and booleans are JSON numbers and booleans, not strings.
- Files: `data` is the base64-encoded file content. Accept PDF, DOCX, PNG and JPG up to 5 MB.
- Answers taken from the profile are part of the payload like any other answer.
- Leave out optional questions that have no answer.
- `screening.failed` lists the IDs of all questions whose rule failed. `passed` is `true` when the list is empty.
- The order of `answers` and `screening.failed` does not matter.

{{#basics}}

# {{name}}

### {{label}}

{{summary}}

{{#location}}
{{#cleanup}}
{{address}}, {{city}}, {{postalCode}}, {{region}}, {{countryCode}}
{{/cleanup}}
{{/location}}

{{contact}}

{{#profiles}}

- [{{network}}]({{url}})

{{/profiles}}

{{/basics}}

# Work

{{#work}}

## {{position}} @ [{{name}}]({{url}})

#### {{#addArrow}}{{startDate}} {{endDate}}{{/addArrow}}

{{summary}}

{{#highlights}}

- {{&.}}

{{/highlights}}

{{/work}}

# School

{{#education}}

## {{studyType}} @ [{{institution}}]({{url}})

### {{area}}

#### {{#addArrow}}{{startDate}} {{endDate}}{{/addArrow}} ({{score}})

{{#courses}}

- {{&.}}

{{/courses}}

{{/education}}

# Projects

{{#projects}}

## [{{name}}]({{url}})

### {{description}}

#### {{#addArrow}}{{startDate}} {{endDate}}{{/addArrow}}

##### {{#cleanup}}{{#keywords}}{{.}}, {{/keywords}}{{/cleanup}}

{{#highlights}}

- {{&.}}

{{/highlights}}

{{/projects}}

# Certs

{{#certificates}}

## [{{name}}]({{url}})

### {{issuer}}

#### {{date}}

{{/certificates}}

# Skills

{{#skills}}

### {{name}} _{{level}}_

{{#keywords}}

- {{&.}}

{{/keywords}}

{{/skills}}

[JSON](resume.json)

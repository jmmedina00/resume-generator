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

- {{network}}: {{&url}}

{{/profiles}}

{{/basics}}

# Work

{{#work}}

## {{position}} @ {{name}}

#### {{#addArrow}}{{startDate}} {{endDate}}{{/addArrow}}

###### {{&url}}

{{summary}}

{{#highlights}}

- {{&.}}

{{/highlights}}

{{/work}}

# School

{{#education}}

## {{studyType}} @ {{institution}}

### {{area}}

###### {{&url}}

#### {{#addArrow}}{{startDate}} {{endDate}}{{/addArrow}} ({{score}})

{{#courses}}

- {{&.}}

{{/courses}}

{{/education}}

# Projects

{{#projects}}

## {{name}}

### {{description}}

#### {{#addArrow}}{{startDate}} {{endDate}}{{/addArrow}}

##### {{#cleanup}}{{#keywords}}{{.}}, {{/keywords}}{{/cleanup}}

{{&url}}

{{#highlights}}

- {{&.}}

{{/highlights}}

{{/projects}}

# Skills

{{#skills}}

## {{name}} _{{level}}_

{{#keywords}}

- {{&.}}

{{/keywords}}

{{/skills}}

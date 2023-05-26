{{#basics}}

# {{name}}

### {{label}}

{{summary}}

{{#location}}

{{address}}
{{city}}
{{postalCode}}
{{region}}
{{countryCode}}

{{/location}}

{{contact}}

{{#profiles}}

- [{{network}}]({{url}})

{{/profiles}}

{{/basics}}

# Work

{{#work}}

## {{position}} @ [{{name}}]({{url}})

#### {{startDate}}-{{endDate}}

{{summary}}

{{#highlights}}

- {{&.}}

{{/highlights}}

{{/work}}

# School

{{#education}}

## {{studyType}} @ [{{institution}}]({{url}})

### {{area}}

#### {{startDate}}-{{endDate}} ({{score}})

{{#courses}}

- {{&.}}

{{/courses}}

{{/education}}

# Projects

{{#projects}}

## [{{name}}]({{url}})

### {{description}}

#### {{startDate}}-{{endDate}}

##### {{#keywords}}{{.}} {{/keywords}}

{{#highlights}}

- {{&.}}

{{/highlights}}

{{/projects}}

# Skills

{{#skills}}

### {{name}} _{{level}}_

{{#keywords}}

- {{&.}}

{{/keywords}}

{{/skills}}

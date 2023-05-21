# Resume generator

[![](./assets/readme/typescript-icon.png)](https://www.typescriptlang.org/)
[![](./assets/readme/jest.png)](https://jestjs.io/)
[![](./assets/readme/puppeteer.png)](https://pptr.dev/)

Create resume versions in serveral languages from a source file. [Features web navigation.](https://jmmedina00.github.io/resume-generator)

The files generated are [JSON Resume](https://jsonresume.org/), which are then converted to documents by applying themes to them.

## Prerequisites

- A [GitHub personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) with the `gist` scope - only tested with classic tokens

- A [Google Cloud service account's key](https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount) in a project where the Google Drive API is enabled

- The following in Google Drive (note: share with a service account by adding its _email address_):

  - A folder shared with the service account for private files writing
  - A file shared with the service account away from the first folder for storing the private information

- _For experimenting in Dropbox only:_ a scoped app with an app folder and its corresponding app, key and refresh tokens

## Installing

```
npm install
```

## Testing

```
npm test
```

## Running

### Sync private information with Google Drive

```
npm run redact
```

### Run main generation workflow

```
npm start
```

**Warning: this will delete the contents of the local `public` and `private` folders, plus the contents of the Google Drive folder.**

import { basename } from 'path';
import { getAuthorizedGoogle } from './auth';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import mime from 'mime-types';

// https://gist.github.com/tanaikech/33563b6754e5054f3a5832667100fe91

const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';
const LIST_URL = 'https://www.googleapis.com/drive/v3/files';
const DELETE_URL = 'https://www.googleapis.com/drive/v3/files/';

const getAuthorizedFolderId = () => process.env['GOOGLE_DRIVE_FOLDER'] ?? '';

interface GoogleDriveFile {
  kind: string;
  mimeType: string;
  id: string;
  name: string;
}

export const uploadFile = async (path: string) => {
  const google = await getAuthorizedGoogle();

  const filename = basename(path);

  const metadata = {
    filename,
    name: filename,
    parents: [getAuthorizedFolderId()],
    contentType: mime.lookup(filename) || 'application/octet-stream',
  };

  const form = new FormData();
  form.append('metadata', JSON.stringify(metadata), {
    contentType: 'application/json',
  });
  form.append('data', createReadStream(path), metadata);

  return google('post', UPLOAD_URL, {
    params: {
      uploadType: 'multipart',
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: form,
  });
};

export const removeAllFilesFromFolder = async () => {
  const google = await getAuthorizedGoogle();

  const { files }: { files: GoogleDriveFile[] } = await google(
    'get',
    LIST_URL,
    {
      params: { q: `'${getAuthorizedFolderId()}' in parents` },
    }
  );

  const promises = files.map(({ id }) => google('delete', DELETE_URL + id));

  return Promise.all(promises);
};

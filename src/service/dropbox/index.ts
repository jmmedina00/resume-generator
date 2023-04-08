import { basename } from 'path';
import { getAuthorizedDropbox } from './auth';
import { createReadStream } from 'fs';

const DROPBOX_UPLOAD_URL = 'https://content.dropboxapi.com/2/files/upload';

interface DropboxUploadArguments {
  autorename: boolean;
  mode: string;
  mute: boolean;
  path: string;
  strict_conflict: boolean;
}

export const uploadFile = async (path: string) => {
  const dropbox = await getAuthorizedDropbox();

  const fileName = basename(path);

  const metadata: DropboxUploadArguments = {
    autorename: false,
    mode: 'overwrite',
    mute: false,
    path: '/' + fileName,
    strict_conflict: false,
  };

  return dropbox('post', DROPBOX_UPLOAD_URL, {
    body: createReadStream(path),
    headers: {
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify(metadata),
    },
  });
};

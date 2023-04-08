import { getCoreUserInfo } from '../service/github';

export interface Profile {
  network: string;
  username: string;
  url: string;
}

export interface PartialProfiles {
  [key: string]: Partial<Profile>;
}

export const getFullProfiles = async (
  profiles: PartialProfiles
): Promise<Profile[]> => {
  const entries = Object.entries(profiles);

  if (!!entries.find(([_, { url, username }]) => !url && !username)) {
    return Promise.reject(
      new Error('All profile partials must at least have some reference')
    );
  }

  const { fullName } = await getCoreUserInfo();

  return entries.map(([key, { username, url }]) => ({
    network: key,
    username: username ?? fullName,
    url: url ?? `https://${key.includes('.') ? key : key + '.com'}/${username}`,
  }));
};

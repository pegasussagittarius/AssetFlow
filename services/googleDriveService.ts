// services/googleDriveService.ts

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILE_NAME = 'assetflow_data.json';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGoogleClient = (apiKey: string, clientId: string) => {
  return new Promise<void>((resolve, reject) => {
    // @ts-ignore
    const gapi = window.gapi;
    // @ts-ignore
    const google = window.google;

    if (!gapi || !google) {
      reject(new Error("Google Scripts not loaded"));
      return;
    }

    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          apiKey: apiKey,
          discoveryDocs: DISCOVERY_DOCS,
        });
        gapiInited = true;
        checkInit(resolve);
      } catch (err) {
        reject(err);
      }
    });

    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: '', // defined at request time
    });
    gisInited = true;
    checkInit(resolve);
  });
};

const checkInit = (resolve: () => void) => {
  if (gapiInited && gisInited) {
    resolve();
  }
};

const getToken = () => {
  return new Promise<void>((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
      }
      resolve();
    };
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const backupToDrive = async (data: any): Promise<void> => {
  // @ts-ignore
  const gapi = window.gapi;
  
  // 1. Ensure authenticated
  if (!gapi.client.getToken()) {
    await getToken();
  }

  // 2. Find existing file
  const q = `name = '${BACKUP_FILE_NAME}' and trashed = false`;
  const response = await gapi.client.drive.files.list({
    q: q,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const files = response.result.files;
  const fileContent = JSON.stringify(data);
  const fileMetadata = {
    name: BACKUP_FILE_NAME,
    mimeType: 'application/json',
  };

  if (files && files.length > 0) {
    // Update existing
    const fileId = files[0].id;
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileId}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: fileContent,
    });
  } else {
    // Create new
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', new Blob([fileContent], { type: 'application/json' }));

    await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
      body: form,
    });
  }
};

export const restoreFromDrive = async (): Promise<any> => {
  // @ts-ignore
  const gapi = window.gapi;

  // 1. Ensure authenticated
  if (!gapi.client.getToken()) {
    await getToken();
  }

  // 2. Find existing file
  const q = `name = '${BACKUP_FILE_NAME}' and trashed = false`;
  const response = await gapi.client.drive.files.list({
    q: q,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  const files = response.result.files;

  if (files && files.length > 0) {
    const fileId = files[0].id;
    const result = await gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    return result.result; // JSON data
  } else {
    throw new Error("Không tìm thấy bản sao lưu nào trên Google Drive.");
  }
};
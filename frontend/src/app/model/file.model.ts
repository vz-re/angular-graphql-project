export interface Permissions {
  readPermissions: string;
  writePermissions: string;
  executePermissions: string
}

export interface IFiles {
  isDirectory: boolean;
  filename: string;
  filepath: string;
  size: number;
  type: string;
  createdDate: string;
  permissions: Permissions
}

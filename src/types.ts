export type user = {
  userID?: Number;
  name: string;
  email: string;
  password: string;
  role: string;
  free?: boolean;
};
export type reqBodyAuth = {
  name: string | null;
  email: string;
  password: string;
};

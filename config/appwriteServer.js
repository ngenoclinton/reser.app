import { Client, Account, Databases, Storage } from "node-appwrite";

export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) // API Endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT) // project ID
    .setKey(process.env.APPWRITE_API_KEY); // Your secret API key

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
  };
};

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) // API Endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT) // project ID
  .setKey(process.env.APPWRITE_API_KEY); // secret API key // Must be server-side only

export const account = new Account(client);
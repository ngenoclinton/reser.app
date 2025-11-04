import { Client, Account, Databases, Storage } from "appwrite";

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) // API Endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT); // project ID
 
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
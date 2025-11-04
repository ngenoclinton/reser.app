import { Client, Account, Databases, Storage } from "node-appwrite";


export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) // API Endpoint
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT) // project ID
    .setKey(process.env.NEXT_APPWRITE_KEY); // Your secret API key

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

// config/appwriteServer.js
// export const createAdminClient = () => {
//   const client = new Client()
//     .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
//     .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT)
//     .setKey(process.env.NEXT_APPWRITE_KEY);

//   return {
//     account: new Account(client),
//     databases: new Databases(client),
//     storage: new Storage(client),
//   };
// };


const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) // API Endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT) // project ID
  .setKey(process.env.NEXT_APPWRITE_KEY); // secret API key // Must be server-side only

export const account = new Account(client);
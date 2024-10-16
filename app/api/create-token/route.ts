import PinataClient from '@pinata/sdk';
import path from 'path';
import {writeFile} from 'fs/promises';
import {NextRequest, NextResponse} from 'next/server';

import * as fs from 'fs';
import {TokenMetadata} from '@solana/spl-token-metadata';
import {Cluster, clusterApiUrl, Connection, PublicKey} from '@solana/web3.js';
import {randomUUID} from 'crypto';

const sdk = new PinataClient({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_API_SECRET
});
const FILE_UPLOAD_BASE_URL = "https://gateway.pinata.cloud/ipfs/";
export const config = {
  api: {
    bodyParser: false
  }
};

export interface MetaAttributes {
  trait_type: string;
  value: string;
}

export interface Meta {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: MetaAttributes[];
}

async function processFileUploadToIPFS(binaries: ArrayBuffer, file_name: string): Promise<string> {
  // Convert the file data to a Buffer
  const buffer = Buffer.from(await binaries);
  const filename = file_name.replaceAll(" ", "_");
  // Write the file to the specified directory (public/assets) with the modified filename
  const filepath = path.join(process.cwd(), "/static/" + filename);
  await writeFile(
      filepath,
      buffer
  );

  const fileStream = fs.createReadStream(filepath);
  // Upload the file to Pinata
  const {IpfsHash} = await sdk.pinFileToIPFS(fileStream, {pinataMetadata: {name: filename}});
  return `${FILE_UPLOAD_BASE_URL}${IpfsHash}`;
}

export async function POST(req: NextRequest) {
  // Parse the incoming form data
  const formData = await req.formData();
  const name = formData?.get("name") as string | undefined;
  const description = formData?.get("name") as string | undefined;
  const symbol = formData?.get("symbol") as string | undefined;
  const mint = formData?.get("symbol") as string | undefined;
  const upgradeAuthority = formData?.get("upgradeAuthority") as string | undefined;
  const network = formData?.get("network") as Cluster | undefined;

  // Get the file from the form data
  const file = formData.get("file") as File | undefined;
  // Check if a file is received
  if (!file) {
    // If no file is received, return a JSON response with an error and a 400 status code
    return NextResponse.json({message: "No file received"}, {status: 400});
  }

  if (!name || !symbol || !mint || !description || !network) {
    return NextResponse.json({message: "Invalid input",}, {status: 400});
  }

  const image_url = await processFileUploadToIPFS(await file.arrayBuffer(), file.name);

  const metadata: Meta = {
    description,
    name,
    image: image_url,
    symbol,
    attributes: [],
  };

  const make_buffer = Buffer.from(metadata.toString());
  const uri = await processFileUploadToIPFS(make_buffer.buffer, randomUUID());

  const tokenMetadata: TokenMetadata = {
    name,
    symbol,
    additionalMetadata: [],
    mint: new PublicKey(mint),
    uri
  };

  const connection = new Connection(clusterApiUrl(network));
  const recentBlockhash = await connection.getLatestBlockhash();

  if (upgradeAuthority) {
    tokenMetadata.updateAuthority = new PublicKey(upgradeAuthority);
  }

  return NextResponse.json({message: "Success"});
}
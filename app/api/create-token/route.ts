import PinataClient, {PinataPinResponse} from '@pinata/sdk';
import path from 'path';
import {writeFile} from 'fs/promises';
import {NextApiResponse} from 'next';
import {NextRequest, NextResponse} from 'next/server';

import * as fs from 'fs';

const sdk = new PinataClient({pinataApiKey: process.env.PINATA_API_KEY, pinataSecretApiKey: process.env.PINATA_API_SECRET});
const FILE_UPLOAD_BASE_URL = "https://gateway.pinata.cloud/ipfs/";
export const config = {
  api: {
    bodyParser: false
  }
};

interface TokenMetadata {
  icon: string | null,
  name: string,
}
async function processFileUploadToIPFS(binaries: ArrayBuffer, file_name: string): Promise<string> {
  // Convert the file data to a Buffer
    const buffer = Buffer.from(await binaries);
    const filename = file_name.replaceAll(" ", "_");

    try {
      // Write the file to the specified directory (public/assets) with the modified filename
      const filepath = path.join(process.cwd(), "/static/" + filename);
      await writeFile(
          filepath,
          buffer
      );

      const fileStream = fs.createReadStream(filepath);
      // Upload the file to Pinata
      const {IpfsHash} = await sdk.pinFileToIPFS(fileStream, {pinataMetadata: {name: filename}});
      return `${FILE_UPLOAD_BASE_URL}${IpfsHash}`
    } catch (err) {
      throw err;
    }
}

export async function POST(req: NextRequest, res: NextApiResponse) {
  // Parse the incoming form data
  const formData = await req.formData();
  const token_name = formData?.get("token_name") as string | undefined;

  if(!token_name) {
    return NextResponse.json({message: "Invalid input, token_name is required", }, {status: 400});
  }


  const tokenMetadata: TokenMetadata = {
    name: formData?.get("token_name") as string,
    icon: null,
  }
  // Get the file from the form data
  const file = formData.get("file");
  // Check if a file is received
  if (!file) {
    // If no file is received, return a JSON response with an error and a 400 status code
    return res.json({ error: "No files received."});
  }
  if ("arrayBuffer" in file) {
    try {
      const icon_uri = await processFileUploadToIPFS(await file.arrayBuffer(), file.name);
      tokenMetadata.icon = icon_uri;

    } catch (err) {
        return NextResponse.json({message: "Failed while trying to process file upload", details: err.message}, {status: 500})
    }

  }
    return NextResponse.json({message: "Success"});
}
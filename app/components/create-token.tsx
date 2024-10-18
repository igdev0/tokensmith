"use client";
import {Button, Container, Flex, Heading, Switch, Text, TextArea, TextField} from '@radix-ui/themes';
import {Field, Form, Label} from '@radix-ui/react-form';
import {useWallet, WalletProvider} from '@solana/wallet-adapter-react';
import SelectWalletButton from '@/app/components/select-wallet-button';
import {FormEvent, forwardRef, Ref, useContext, useImperativeHandle, useRef, useState} from 'react';
import createTokenJSONSchema from '@/app/create-token-jsonschema.json';
import Ajv from 'ajv';
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {createInitializeInstruction} from "@solana/spl-token-metadata";
import {RpcConfigContext} from '@/app/context/config';
import {Connection, Keypair, PublicKey, SystemProgram, Transaction} from '@solana/web3.js';

interface TokenImageProps {
  error: string | null,
}


function TokenImageComponent(props: TokenImageProps, ref: Ref<{ getImage: () => File }>,) {
  const [file, setFile] = useState<File>(null);
  const [preview, setPreview] = useState<string>();
  const handleFileChange = (event: FormEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files.item(0);
    setFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
  };

  useImperativeHandle(ref, () => ({
    getImage() {
      return file;
    }
  }));

  return (
      <>
        <div
            className="relative border-2 border-dashed text-center p-4 mt-1 flex gap-2 justify-center items-center">
          <input className="opacity-0 absolute w-full h-full cursor-pointer" type="file" onChange={handleFileChange}/>
          {file ? <img className="aspect-square w-10" src={preview}/> : null}
          {file?.name ?? "No image uploaded"}
        </div>
        {
            props.error && (
                <Text mt="2">
                  <p className="dark:text-red-500">
                    {props.error}
                  </p>
                </Text>
            )
        }
      </>
  );
}

const TokenImage = forwardRef(TokenImageComponent);

const INITIAL_DATA = {
  name: "",
  symbol: "",
  description: "",
  image: "",
  decimals: 0,
  total_supply: 0,
  mint_authority: "",
  mint_freeze_authority: "",
};

const INITIAL_ERRORS = {
  name: null,
  symbol: null,
  description: null,
  image: null,
  mint_authority: null,
  mint_freeze_authority: null,
};

type FieldError = string | null;

type FormFieldsError = {
  name: FieldError,
  symbol: FieldError,
  description: FieldError,
  image: FieldError,
  mint_authority: FieldError,
  mint_freeze_authority: FieldError,
}

function removeRef(data: object) {
  return JSON.parse(JSON.stringify(data));
}

const validator = new Ajv({allErrors: true}).addSchema(createTokenJSONSchema);
const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

function useCreateTokenTransaction() {
  return async (connection: Connection, mint: Keypair, decimals: number, totalSupply: number, payer: PublicKey, hasTokenFreeze = false) => {
    const recentBlockhash = await connection.getLatestBlockhash();
    const freezeAuthority = hasTokenFreeze ? payer : null;
    const transaction = new Transaction({recentBlockhash: recentBlockhash.blockhash, feePayer: payer});


    const createMintInstruction = createInitializeMintInstruction(
        mint.publicKey,
        decimals,
        payer,
        freezeAuthority,
        TOKEN_PROGRAM_ID
    );

    const associatedTokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        payer
    );
    const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        payer,
        mint.publicKey,
    );

    const mintTotalSupplyInstruction = createMintToInstruction(mint.publicKey, associatedTokenAccount, payer, totalSupply);

    const accountCreationInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      lamports: await getMinimumBalanceForRentExemptMint(connection),
      space: MINT_SIZE,
      newAccountPubkey: mint.publicKey,
      programId: TOKEN_PROGRAM_ID,
    });


    transaction.add(accountCreationInstruction, createMintInstruction, createTokenAccountInstruction, mintTotalSupplyInstruction);

    return transaction;
  };
}

export default function CreateToken() {
  const tokenImageRef = useRef<{ getImage: () => File } | null>(null);
  const [formData, setFormData] = useState<typeof INITIAL_DATA>(removeRef(INITIAL_DATA));
  const [hasTokenFreeze, setHasTokenFreeze] = useState<boolean>(false);
  const [revokeMintAuthority, setRevokeMintAuthority] = useState<boolean>(false);
  const {connection} = useContext(RpcConfigContext);
  const wallet = useWallet();
  const [formErrors, setFormErrors] = useState<FormFieldsError>(removeRef(INITIAL_ERRORS));
  const createSplTokenTransaction = useCreateTokenTransaction();
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!wallet.publicKey || !wallet?.signTransaction) {
      return;
    }
    const image = tokenImageRef.current?.getImage();
    const mint = Keypair.generate();
    const createdTokenTransaction = await createSplTokenTransaction(connection, mint, formData.decimals, formData.total_supply, wallet.publicKey, hasTokenFreeze);


    const body = new FormData();
    body.set("file", image);
    body.set("name", formData.name);
    body.set("description", formData.description);
    body.set("symbol", formData.symbol);

    // const res = await fetch("/api/upload-metadata", {
    //   method: "POST",
    //   body: body as keyof object
    // });

    // const responseJsonData: { message: string, uri: string } = await res.json();
    const [metadataAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          mint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
    const metadataInitInstruction = createInitializeInstruction({
      name: formData.name,
      symbol: formData.symbol,
      mint: mint.publicKey,
      programId: TOKEN_2022_PROGRAM_ID,
      uri: "https://someuri.com",
      updateAuthority: wallet.publicKey,
      metadata: metadataAccount,
      mintAuthority: wallet.publicKey,
    });
    createdTokenTransaction.add(metadataInitInstruction);

    if (wallet.signTransaction) {
      const signedTx = await wallet.signTransaction(createdTokenTransaction);
      signedTx.partialSign(mint);
      const serialisedTx = signedTx.serialize();
      const txHash = await connection.sendRawTransaction(serialisedTx);
      return {txHash, mint};
    }

  };

  const handleTextInputChange = (formEvent: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {currentTarget} = formEvent;
    setFormData((previousData) => ({
      ...previousData,
      [currentTarget.name]: currentTarget.value,
    }));
  };

  return (

      <Container className="justify-center">
        <Heading className="mt-5" size="8">Create token</Heading>
        <Text>
          <p className="max-w-xl">
            This is a simple solution for creating a new token and its metadata. Fill in the required fields and
            press
            submit.
          </p>
        </Text>
        <Form onSubmit={handleSubmit} className="max-w-xl mt-4">
          <Field name="name" className="mt-2">
            <Label>
              Token name
            </Label>
            <TextField.Root placeholder="e.g: Solana" name="name" onChange={handleTextInputChange} size="3"
                            value={formData.name}/>
          </Field>
          <Field name="symbol" className="mt-2">
            <Label>
              Token symbol
            </Label>
            <TextField.Root placeholder="e.g: SOL" name="symbol" onChange={handleTextInputChange}
                            value={formData.symbol} size="3"/>
          </Field>
          <Field name="symbol" className="mt-2">
            <Label>
              Token decimals
            </Label>
            <TextField.Root placeholder="e.g: 9" type="number" name="decimals" onChange={handleTextInputChange}
                            value={formData.decimals} size="3"/>
          </Field>
          <Field name="symbol" className="mt-2">
            <Label>
              Token total supply
            </Label>
            <TextField.Root placeholder="e.g: 100,000,000" type="number" name="total_supply"
                            onChange={handleTextInputChange}
                            value={formData.total_supply} size="3"/>
          </Field>
          <Field name="description" className="mt-2">
            <Label>
              Token description
            </Label>
            <TextArea
                placeholder="e.g: This is a utility token used within [place], you will receive this token once you do X."
                name="description" onChange={handleTextInputChange} value={formData.description} size="3"/>
          </Field>
          <Field name="token mint account">
            <p className="mb-2 mt-2">
              Token mint authority
            </p>
            <WalletProvider wallets={[]} autoConnect={true}>
              <SelectWalletButton/>
            </WalletProvider>
          </Field>
          <Field name="token mint account" className="mt-4">
            <Flex align="baseline" gapX="2">
              <Switch className="cursor-pointer" onCheckedChange={setHasTokenFreeze} checked={hasTokenFreeze}
              />
              <div>
                <p>Token freeze authority (optional)</p>
                <p className="mb-2 mt-2">
                  <strong>Note: </strong>
                  If the token freeze authority, you can use this token to provide liquidity.
                </p>
              </div>
            </Flex>
          </Field>
          <Field name="token mint account">
            <Flex align="baseline" gapX="2">
              <Switch className="cursor-pointer mt-2" onCheckedChange={setRevokeMintAuthority}
                      checked={revokeMintAuthority}
              />
              <div>
                <p className="mb-2 mt-2">
                  Revoke mint authority
                </p>
                <p>
                  <strong>Note: </strong>
                  If you enable "revoke mint authority" it will disable your authority to ever mint new tokens,
                  which
                  means the supply will never
                  change.
                </p>
              </div>
            </Flex>
          </Field>
          <Field name="image" className="mt-2">
            <Label>
              Token image
            </Label>
            <TokenImage ref={tokenImageRef} error={formErrors.image}/>
          </Field>
          <Button disabled={!wallet?.connected} className="w-full mt-4" size="4" type="submit">Submit</Button>
        </Form>
      </Container>
  );
}
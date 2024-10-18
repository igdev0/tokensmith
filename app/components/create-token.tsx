"use client";
import {Button, Container, Flex, Heading, Switch, Text, TextArea, TextField} from '@radix-ui/themes';
import {Field, Form, Label} from '@radix-ui/react-form';
import {useWallet, WalletProvider} from '@solana/wallet-adapter-react';
import SelectWalletButton from '@/app/components/select-wallet-button';
import {FormEvent, forwardRef, Ref, useContext, useImperativeHandle, useMemo, useRef, useState} from 'react';
import createTokenJSONSchema from '@/app/create-token-jsonschema.json';
import Ajv from 'ajv';
import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  ExtensionType,
  getAssociatedTokenAddress,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token';
import {createInitializeInstruction, pack, TokenMetadata} from "@solana/spl-token-metadata";
import {RpcConfigContext} from '@/app/context/config';
import {Connection, Keypair, PublicKey, SystemProgram, Transaction} from '@solana/web3.js';
import FormFeedback, {FormFeedbackRef} from '@/app/components/form-feedback';


function TokenImageComponent(props, ref: Ref<{ getImage: () => File }>,) {
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
      </>
  );
}

const TokenImage = forwardRef(TokenImageComponent);

const INITIAL_DATA = {
  name: "",
  symbol: "",
  description: "",
  image: "",
  metadata_uri: "",
  decimals: "0",
  total_supply: "0",
  revoke_authority: false,
};


const INITIAL_ERRORS = {
  name: null,
  symbol: null,
  description: null,
  image: null,
};

type FieldError = string | null;

type FormFieldsError = {
  name: FieldError,
  symbol: FieldError,
  description: FieldError,
  metadata_uri: FieldError,
  image: FieldError,
}

function removeRef(data: object) {
  return JSON.parse(JSON.stringify(data));
}


function useCreateTokenTransaction() {
  return async (connection: Connection, mint: Keypair, formData: typeof INITIAL_DATA, payer: PublicKey, hasTokenFreeze = false) => {
    const recentBlockhash = await connection.getLatestBlockhash();
    const freezeAuthority = hasTokenFreeze ? payer : null;
    const transaction = new Transaction({recentBlockhash: recentBlockhash.blockhash, feePayer: payer});
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    const metadata: TokenMetadata = {
      mint: mint.publicKey,
      name: formData.name,
      symbol: formData.symbol,
      uri: formData.metadata_uri,
      additionalMetadata: [],
    };

    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    const accountCreationInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      lamports: mintLamports,
      space: mintLen,
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const metadataPointerInstruction = createInitializeMetadataPointerInstruction(mint.publicKey, payer, mint.publicKey, TOKEN_2022_PROGRAM_ID);

    const createMintInstruction = createInitializeMintInstruction(
        mint.publicKey,
        formData.decimals,
        payer,
        freezeAuthority,
        TOKEN_2022_PROGRAM_ID
    );

    const associatedTokenAccount = await getAssociatedTokenAddress(
        mint.publicKey,
        payer,
        false,
        TOKEN_2022_PROGRAM_ID
    );
    const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
        payer,
        associatedTokenAccount,
        payer,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
    );

    const mintTotalSupplyInstruction = createMintToInstruction(mint.publicKey, associatedTokenAccount, payer, formData.total_supply * Math.pow(10, formData.decimals), [], TOKEN_2022_PROGRAM_ID);

    const metadataInstruction = createInitializeInstruction({
      name: formData.name,
      symbol: formData.symbol,
      mint: mint.publicKey,
      programId: TOKEN_2022_PROGRAM_ID,
      uri: metadata.uri,
      updateAuthority: payer,
      metadata: mint.publicKey,
      mintAuthority: payer,
    });

    transaction.add(accountCreationInstruction, metadataPointerInstruction, createMintInstruction, metadataInstruction, createTokenAccountInstruction, mintTotalSupplyInstruction);

    if (formData.revoke_authority) {
      const revokeAuthorityInstruction = createSetAuthorityInstruction(mint.publicKey, payer, AuthorityType.MintTokens, null, [], TOKEN_2022_PROGRAM_ID);
      transaction.add(revokeAuthorityInstruction);
    }

    return transaction;
  };
}

function FieldErrorMessage({name, formErrors}: { name: string, formErrors: FormFieldsError }) {

  if (!formErrors[name]) {
    return null;
  }
  return (
      <p className="text-red-500">
        {formErrors[name]}
      </p>
  );
}

export default function CreateToken() {
  const tokenImageRef = useRef<{ getImage: () => File } | null>(null);
  const formFeedback = useRef<FormFeedbackRef>();
  const rpcConfig = useContext(RpcConfigContext);
  const [formData, setFormData] = useState<typeof INITIAL_DATA>(removeRef(INITIAL_DATA));
  const [hasTokenFreeze, setHasTokenFreeze] = useState<boolean>(false);
  const {connection} = useContext(RpcConfigContext);
  const wallet = useWallet();
  const [formErrors, setFormErrors] = useState<FormFieldsError>(removeRef(INITIAL_ERRORS));
  const createSplTokenTransaction = useCreateTokenTransaction();
  const [isLoading, setIsLoading] = useState(false);

  const isFormDisabled = useMemo(() => {
    return !wallet.publicKey || isLoading;
  }, [isLoading, wallet]);

  const handleSubmit = async (event: FormEvent) => {
    const validator = new Ajv({allErrors: true}).addSchema(createTokenJSONSchema);
    event.preventDefault();
    if (!wallet.publicKey || !wallet?.signTransaction) {
      return;
    }

    const image = tokenImageRef.current?.getImage();
    const mint = Keypair.generate();
    const body = new FormData();
    validator.validate(createTokenJSONSchema, {
      ...formData,
      decimals: parseInt(formData.decimals),
      total_supply: parseInt(formData.total_supply)
    });
    const currentErrors = removeRef(INITIAL_ERRORS);
    if (validator.errors) {
      for (const error of validator.errors) {
        const name = error.instancePath.split("/").pop();
        currentErrors[name] = error.message;
      }
    }
    if (!image) {
      currentErrors.image = "This field is required";
    }

    setFormErrors(currentErrors);

    if (Object.values(currentErrors).some(v => v !== null)) {
      return;
    }
    setFormErrors(removeRef(INITIAL_ERRORS));
    setIsLoading(true);

    body.set("file", image);
    body.set("name", formData.name);
    body.set("description", formData.description);
    body.set("symbol", formData.symbol);

    const response = await fetch("/api/upload-metadata", {
      method: "POST",
      body: body as FormData
    });

    const responseData: { uri: string, message: string } = await response.json();
    formData.metadata_uri = responseData.uri;

    const createdTokenTransaction = await createSplTokenTransaction(connection, mint, formData, wallet.publicKey, hasTokenFreeze);

    if (wallet.signTransaction) {
      try {
        const signedTx = await wallet.signTransaction(createdTokenTransaction);
        signedTx.partialSign(mint);
        const serialisedTx = signedTx.serialize();
        const txHash = await connection.sendRawTransaction(serialisedTx);
        formFeedback.current?.pushMessage({
          title: "Token created 🚀",
          duration: 10000,
          variant: "success",
          description: `
            <p>Congrats 🎉. your token was created, is a matter of time before the token will show up in your wallet, check <a class="text-purple-800 underline" href="https://explorer.solana.com/tx/account/${txHash}?cluster=${rpcConfig.chain}" target="_blank">this link for more details.</a> </p>
          `
        });
        setFormData(removeRef(INITIAL_DATA));
        // @todo: handle success
      } catch (err) {
        // Possible failure:
        // - Not enough balance
        // - Operation was canceled
        // - aditionalMetadata[] is passed to the transaction and then it fails "not enough balance"
        formFeedback.current?.pushMessage({
          title: "Operation failed",
          description: `The operation failed with message ${err.message()}`,
          variant: "error",
          duration: 3000,
        });
        // @todo: handle error
      }
    }
    setIsLoading(false);

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
            <FieldErrorMessage formErrors={formErrors} name="name"/>
          </Field>
          <Field name="symbol" className="mt-2">
            <Label>
              Token symbol
            </Label>
            <TextField.Root placeholder="e.g: SOL" name="symbol" onChange={handleTextInputChange}
                            value={formData.symbol} size="3"/>
            <FieldErrorMessage formErrors={formErrors} name="symbol"/>
          </Field>
          <Field name="symbol" className="mt-2">
            <Label>
              Token decimals
            </Label>
            <TextField.Root placeholder="e.g: 9" type="number" name="decimals" onChange={handleTextInputChange}
                            value={formData.decimals} size="3"/>
            <FieldErrorMessage formErrors={formErrors} name="decimals"/>
          </Field>
          <Field name="symbol" className="mt-2">
            <Label>
              Token total supply
            </Label>
            <TextField.Root placeholder="e.g: 100,000,000" type="number" name="total_supply"
                            onChange={handleTextInputChange}
                            value={formData.total_supply} size="3"/>
            <FieldErrorMessage formErrors={formErrors} name="total_supply"/>
          </Field>
          <Field name="description" className="mt-2">
            <Label>
              Token description
            </Label>
            <TextArea
                placeholder="e.g: This is a utility token used within [place], you will receive this token once you do X."
                name="description" onChange={handleTextInputChange} value={formData.description} size="3"/>
            <FieldErrorMessage formErrors={formErrors} name="description"/>
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
              <Switch className="cursor-pointer mt-2"
                      onCheckedChange={v => setFormData(prev => ({...prev, revoke_authority: v}))}
                      checked={formData.revoke_authority}
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
            <div className="my-2"/>
            <FieldErrorMessage name="image" formErrors={formErrors}/>
          </Field>
          <Button disabled={isFormDisabled}
                  loading={isLoading}
                  className="w-full mt-4" size="4" type="submit">Submit</Button>
        </Form>
        <FormFeedback ref={formFeedback}/>
      </Container>
  );
}
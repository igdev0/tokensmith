"use client";
import {Button, Container, Flex, Heading, Switch, Text, TextArea, TextField, Theme} from '@radix-ui/themes';
import {Field, Form, Label} from '@radix-ui/react-form';
import {useWallet} from '@solana/wallet-adapter-react';
import {FormEvent, useContext, useMemo, useRef, useState} from 'react';
import createTokenJSONSchema from '@/app/create-token-jsonschema.json';
import Ajv from 'ajv';
import {RpcConfigContext} from '@/app/context/config';
import {Keypair} from '@solana/web3.js';
import FormFeedback, {FormFeedbackRef} from '@/app/components/form-feedback';
import * as Dialog from "@radix-ui/react-dialog";
import {Cross2Icon, DownloadIcon, ExternalLinkIcon} from '@radix-ui/react-icons';
import Link from 'next/link';
import TokenImage from '@/app/components/token-image';
import {removeRef} from '@/app/utils';
import FieldErrorMessage, {FormFieldsError} from '@/app/components/field-error-message';
import useCreateTokenTransaction from '@/app/hooks/use-create-token-transaction';

export const INITIAL_DATA = {
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

export default function CreateToken() {
  const tokenImageRef = useRef<{ getImage: () => File } | null>(null);
  const formFeedback = useRef<FormFeedbackRef>();
  const rpcConfig = useContext(RpcConfigContext);
  const [formData, setFormData] = useState<typeof INITIAL_DATA>(removeRef(INITIAL_DATA));
  const [hasTokenFreeze, setHasTokenFreeze] = useState<boolean>(false);
  const {connection} = useContext(RpcConfigContext);
  const wallet = useWallet();
  const [tokenDetails, setTokenDetails] = useState<{
    name: string,
    tx_hash: string,
    mint_secret_url: string,
    mint_filename: string
  }>();
  const [formErrors, setFormErrors] = useState<FormFieldsError>(removeRef(INITIAL_ERRORS));
  const createSplTokenTransaction = useCreateTokenTransaction();
  const [isLoading, setIsLoading] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(true);

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
    const blob = new Blob([JSON.stringify(mint.secretKey)], {type: "application/json"});
    const mint_secret_url = URL.createObjectURL(blob);

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
        setTokenDetails({
          name: formData.name,
          tx_hash: txHash,
          mint_secret_url,
          mint_filename: `${formData.name}-mint.json`
        });
        setSuccessPopupOpen(true);
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
        <Dialog.Root open={successPopupOpen}>
          <Dialog.Portal>
            <Theme>
              <Dialog.Overlay
                  className="fixed dark:bg-overlay-dark light:bg-overlay-light left-0 right-0 bottom-0 top-0 flex items-center">
                <Dialog.Content
                    className="max-w-lg w-full light:bg-white dark:bg-gray-950 p-4 rounded-l-lg mx-auto relative shadow-2xl shadow-green-800">
                  <Theme>
                    <Dialog.Title className="font-semibold text-3xl mb-2">
                      Token creation succeded 🚀
                    </Dialog.Title>
                    <Dialog.Description className="text-base mb-4">
                      <p>Please store mint's secret key securely, you will need this if you want to modify token mint
                        ownership, mint new tokens and more.</p>
                    </Dialog.Description>
                    <Flex
                        className="items-center gap-2 mb-2 flex-1"><Button asChild>
                      <a
                          target="_blank"
                          href={tokenDetails?.mint_secret_url ?? ""}
                          download={`mint-${tokenDetails?.name ?? "noname"}.json`}>
                        <DownloadIcon/>
                        Download mint secret</a>
                    </Button>
                      <Link
                          className="rt-reset rt-BaseButton rt-r-size-2 rt-variant-outline rt-Button cursor-pointer flex-1"
                          variant="outline"
                          href={`https://explorer.solana.com/tx/account/${tokenDetails?.tx_hash}?cluster=${rpcConfig.chain}`}
                          target="_blank"><ExternalLinkIcon/> View transaction</Link>
                    </Flex>
                    <Dialog.Trigger className="absolute top-0.5 right-0.5 cursor-pointer">
                      <Cross2Icon width={33} height={33}/>
                    </Dialog.Trigger>
                  </Theme>
                </Dialog.Content>
              </Dialog.Overlay>
            </Theme>
          </Dialog.Portal>
        </Dialog.Root>
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
        </Form><Button asChild>
      </Button>
        <FormFeedback ref={formFeedback}/>
      </Container>
  );
}
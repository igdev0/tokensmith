"use client";
import "./page.scss";
import {FormEvent, forwardRef, PropsWithChildren, Ref, useImperativeHandle, useRef, useState} from 'react';
import {Button, Container, Flex, Heading, Switch, Text, TextArea, TextField} from '@radix-ui/themes';
import {Field, Form, Label} from '@radix-ui/react-form';

function Main(props: PropsWithChildren) {
  return (
      <main className="main min-h-screen w-full">
        <main className="fixed h-full w-full">
          <div className="fixed h-full pointer-events-none w-full bg"/>
          <div className="circle circle--xl circle--blue circle--left"/>
          <div className="circle circle--xl circle--green circle--right"/>
          <div className="circle circle--xl circle--purple circle--bottom-center"/>
        </main>
        <div className="z-10 absolute h-full w-full overflow-auto">
          {props.children}
        </div>
      </main>
  );
}


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

export default function Home() {
  const tokenImageRef = useRef<{ getImage: () => File } | null>(null);
  const [formData, setFormData] = useState<typeof INITIAL_DATA>(removeRef(INITIAL_DATA));
  const [hasTokenFreeze, setHasTokenFreeze] = useState<boolean>(false);
  const [revokeMintAuthority, setRevokeMintAuthority] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormFieldsError>(removeRef(INITIAL_ERRORS));
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const image = tokenImageRef.current?.getImage();
  };

  const handleTextInputChange = (formEvent: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {currentTarget} = formEvent;
    setFormData((previousData) => ({
      ...previousData,
      [currentTarget.name]: currentTarget.value,
    }));
  };

  return (
      <Main>
        <Container className="h-full flex flex-col justify-center">
          <Heading className="mt-5" size="8">Create token</Heading>
          <Text>
            <p className="max-w-xl">
              This is a simple solution for creating a new token and its metadata. Fill in the required fields and press
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
              <TextField.Root placeholder="e.g: SOL" type="number" name="e.g: 9" onChange={handleTextInputChange}
                              value={formData.decimals} size="3"/>
            </Field>
            <Field name="symbol" className="mt-2">
              <Label>
                Token total supply
              </Label>
              <TextField.Root placeholder="e.g: 100,000,000" type="number" name="e.g: 9"
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
              <Button variant="solid" size="4">Connect wallet</Button>
            </Field>
            <Field name="token mint account">
              <Flex align="center" gapX="2">
                <Switch className="cursor-pointer" onCheckedChange={setHasTokenFreeze} checked={hasTokenFreeze}
                />
                <p className="mb-2 mt-2">
                  Token freeze authority (optional)
                </p>
              </Flex>
              <Button variant="solid" size="4" disabled={!hasTokenFreeze}>Connect wallet</Button>
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
                    If you enable "revoke mint authority" it will disable your authority to ever mint new tokens, which
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
            <Button className="w-full mt-4" size="4" type="submit">Submit</Button>
          </Form>
        </Container>
      </Main>
  );
}

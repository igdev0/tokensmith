"use client";
import "./page.scss";
import {FormEvent, forwardRef, PropsWithChildren, Ref, useImperativeHandle, useRef, useState} from 'react';
import {Button, Container, Heading, Text, TextArea, TextField} from '@radix-ui/themes';
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
        <div className="z-10 absolute h-full w-full">
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
  mint_authority: "",
  mint_freeze_account: "",
};
export default function Home() {
  const tokenImageRef = useRef<{ getImage: () => File } | null>(null);
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const image = tokenImageRef.current?.getImage();

  };

  return (
      <Main>
        <Container className="h-full flex flex-col justify-center">
          <Heading className="mt-5" size="9">Create token</Heading>
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
              <TextField.Root placeholder="e.g: Solana" name="name"/>
            </Field>
            <Field name="symbol" className="mt-2">
              <Label>
                Token symbol
              </Label>
              <TextField.Root placeholder="e.g: SOL" name="symbol"/>
            </Field>
            <Field name="description" className="mt-2">
              <Label>
                Token description
              </Label>
              <TextArea
                  placeholder="e.g: This is a utility token used within [place], you will receive this token once you do X."
                  name="Description"/>
            </Field>
            <Field name="image" className="mt-2">
              <Label>
                Token image
              </Label>
              <TokenImage ref={tokenImageRef} error="This field is required"/>
            </Field>
          </Form>
          <Button type="submit">Submit</Button>
        </Container>
      </Main>
  );
}

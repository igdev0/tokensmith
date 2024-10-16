"use client";
import "./page.scss";
import {FormEvent, PropsWithChildren} from 'react';
import {Button} from '@radix-ui/themes';

function Main(props: PropsWithChildren) {
  return (
      <main className="main min-h-screen w-full">
        <main className="fixed h-full w-full">
          <div className="fixed h-full pointer-events-none w-full bg"/>
          <div className="circle circle--xl circle--blue circle--left"/>
          <div className="circle circle--xl circle--green circle--right"/>
          <div className="circle circle--xl circle--purple circle--bottom-center"/>
        </main>
        <div className="z-10 relative h-full">
          {props.children}
        </div>
      </main>
  );
}

export default function Home() {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
  };

  const handleFileChange = () => {

  };
  return (
      <Main>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange}/>
          <Button type="submit">Create token</Button>
        </form>
      </Main>
  );
}

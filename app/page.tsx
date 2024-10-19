"use client";
import "./page.scss";
import {PropsWithChildren} from 'react';
import Navbar from '@/app/components/navbar';
import App from '@/app/app';
import CreateToken from '@/app/components/create-token';

function Main(props: PropsWithChildren) {
  return (
      <main className="main min-h-screen w-full">
        <div className="fixed h-full w-full -z-10">
          <div className="fixed h-full pointer-events-none w-full bg"/>
          <div className="circle circle--xl circle--blue circle--left"/>
          <div className="circle circle--xl circle--green circle--right"/>
          <div className="circle circle--xl circle--purple circle--bottom-center"/>
        </div>
        <Navbar/>
        {props.children}
      </main>
  );
}


export default function Home() {

  return (
      <App>
        <Main>
          <CreateToken/>
          <footer className="absolute bottom-2 right-0 left-0 w-full flex justify-center">
            <small>Made with ❤️ by <a className="underline" href="https://github.com/igdev0" target="_blank"
                                      rel="noreferrer">Igdev</a></small>
          </footer>
        </Main>
      </App>

  );
}

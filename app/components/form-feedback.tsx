"use-client";
import * as Toast from '@radix-ui/react-toast';
import {CloseIcon} from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import {forwardRef, useImperativeHandle, useRef, useState} from 'react';

interface FeedbackMessage {
  title: string,
  description: string,
  duration: number,
  variant: "error" | "success"
}

export interface FormFeedbackRef {
  pushMessage(message: FeedbackMessage): void;
}

export default forwardRef(function FormFeedback(props, ref) {
  const [toastOpen, setToastOpen] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);
  const timer = useRef<NodeJS.Timer>();


  useImperativeHandle(ref, () => ({
    pushMessage(message: FeedbackMessage) {
      setMessage(message);
      setToastOpen(true);
      timer.current = setTimeout(() => {
        setToastOpen(false);
        setMessage(null);
      }, message.duration);
    }
  }));

  return (
      <Toast.Provider swipeDirection="up">
        <Toast.Root open={toastOpen} duration={message?.duration ?? 100000} onOpenChange={setToastOpen}
                    className={`bg-gray-950 rounded-lg overflow-hidden shadow-xl ${message?.variant === "error" ? "shadow-red-900" : "shadow-green-900"}`}>
          <Toast.Title className="px-2 pt-2 font-bold text-2xl border-b-2 border-black"
                       dangerouslySetInnerHTML={{__html: message?.title ?? ""}}/>

          <Toast.Description className="px-2 pb-2 pt-1"
                             dangerouslySetInnerHTML={{__html: message?.description ?? ""}}/>
          <Toast.Close aria-label="Close" className="absolute top-0.5 right-0.5"><CloseIcon/></Toast.Close>
          <div className={`w-full h-1 ${message?.variant === "error" ? "bg-red-500" : "bg-green-500"}`}/>
        </Toast.Root>
        <Toast.Viewport className="fixed top-5 max-w-4xl mx-auto left-0 right-0 "/>
      </Toast.Provider>
  );
});
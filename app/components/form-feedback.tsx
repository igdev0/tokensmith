import * as Toast from '@radix-ui/react-toast/dist';
import {CloseIcon} from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import {forwardRef, useImperativeHandle, useRef, useState} from 'react';

interface FeedbackMessage {
  title: string,
  description: string,
  duration: number,
  variant: "error" | "success"
}

export default forwardRef(function FormFeedback(props, ref) {
  const [toastOpen, setToastOpen] = useState(false);
  const [message, setMessage] = useState<FeedbackMessage | null>(null);
  const timer = useRef<NodeJS.Timer>();


  useImperativeHandle(ref, () => ({
    pushMessage(message: FeedbackMessage) {
      setMessage(message);
      timer.current = setTimeout(() => {
        setToastOpen(false);
        setMessage(null);
      }, message.duration);
    }
  }));

  return (
      <Toast.Provider swipeDirection="right">
        <Toast.Root open={toastOpen} onOpenChange={setToastOpen}>
          <Toast.Title dangerouslySetInnerHTML={{__html: message?.title ?? ""}}/>
          <Toast.Description dangerouslySetInnerHTML={{__html: message?.description ?? ""}}/>
          <Toast.Close aria-label="Close"><CloseIcon/></Toast.Close>
        </Toast.Root>
        <Toast.Viewport className="fixed top-0"/>
      </Toast.Provider>
  );
});